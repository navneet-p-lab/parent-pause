import { z } from "zod";
import { LIMITS, localeSchema, turnSchema } from "@/lib/contracts";
import { initialConversation, type ConversationState } from "./conversation-reducer";

export const HISTORY_STORAGE_KEY = "parentpause.conversations.v1";
const MAX_STORAGE_CHARACTERS = 4_000_000;
const turnsSchema = z.array(turnSchema).max(LIMITS.transcriptEntries + 1).superRefine((turns, ctx) => {
  if (turns.length % 2 || turns.some((turn, index) => turn.role !== (index % 2 ? "assistant" : "user"))) {
    ctx.addIssue({ code: "custom", message: "Saved conversations must contain complete alternating exchanges" });
  }
});
const draftSchema = z.string().max(100_000);
const savedSchema = z.strictObject({
  version: z.literal(1), locale: localeSchema, turns: turnsSchema, draft: draftSchema,
  history: z.array(z.strictObject({ id: z.string().min(1).max(100), turns: turnsSchema, draft: draftSchema })).max(1_000),
}).refine((saved) => new Set(saved.history.map((item) => item.id)).size === saved.history.length);

export function restoreConversation(raw: string | null): ConversationState {
  if (raw === null) return initialConversation();
  if (raw.length > MAX_STORAGE_CHARACTERS) throw new Error("History too large");
  const { locale, turns, draft, history } = savedSchema.parse(JSON.parse(raw));
  return { ...initialConversation(), locale, turns, draft, history };
}

export function serializeConversation(state: ConversationState): string | null {
  const latest = state.pending?.turns.at(-1);
  const draft = latest?.role === "user" ? latest.text : state.draft;
  if (!state.turns.length && !draft && !state.history.length) return null;
  const raw = JSON.stringify(savedSchema.parse({ version: 1, locale: state.locale, turns: state.turns, draft, history: state.history }));
  if (raw.length > MAX_STORAGE_CHARACTERS) throw new Error("History too large");
  return raw;
}
