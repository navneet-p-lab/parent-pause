import { coachRequestSchema, countCodePoints, failureSchema, LIMITS, successForRequestSchema,
  type CoachRequest, type Failure, type Locale, type Turn } from "@/lib/contracts";

export const MAX_EXCHANGES = (LIMITS.transcriptEntries + 1) / 2;
export type ConversationEvent = { id: string; kind: "loading" | "reply" | "error" | "cancelled" | "cleared"; urgent?: boolean };
export type ConversationSnapshot = { id: string; turns: Turn[]; draft: string };
export type ConversationState = {
  locale: Locale; turns: Turn[]; draft: string; pending: CoachRequest | null;
  history: ConversationSnapshot[];
  failure: Failure | null; validation: "empty" | "overlong" | null; event: ConversationEvent | null;
};
export const initialConversation = (): ConversationState => ({ locale: "en", turns: [], draft: "", history: [], pending: null, failure: null, validation: null, event: null });
export type ConversationAction =
  | { type: "restore"; state: ConversationState }
  | { type: "clear-all" }
  | { type: "draft"; text: string }
  | { type: "locale"; locale: Locale }
  | { type: "start"; requestId: string }
  | { type: "success"; requestId: string; value: unknown }
  | { type: "failure"; requestId: string; failure: Failure }
  | { type: "cancel"; requestId: string }
  | { type: "open"; id: string; eventId: string }
  | { type: "delete-history"; id: string }
  | { type: "clear"; eventId: string };

export function draftProblem(draft: string): "empty" | "overlong" | null {
  return !/[^\p{White_Space}\uFEFF]/u.test(draft) ? "empty"
    : countCodePoints(draft) > LIMITS.userCodePoints ? "overlong" : null;
}
function submittedDraft(state: ConversationState): string {
  const latest = state.pending?.turns.at(-1);
  return latest?.role === "user" ? latest.text : state.draft;
}

function archiveCurrent(state: ConversationState, id: string): ConversationSnapshot[] {
  const draft = submittedDraft(state);
  return state.turns.length || draft ? [{ id, turns: state.turns, draft }, ...state.history] : state.history;
}

export function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
  switch (action.type) {
    case "restore": return action.state;
    case "clear-all": return { ...initialConversation(), locale: state.locale };
    case "draft": return state.pending ? state : { ...state, draft: action.text, failure: null, validation: null, event: null };
    case "locale": return state.locale === action.locale ? state : { ...state, locale: action.locale, draft: submittedDraft(state), pending: null, failure: null, validation: null, event: null };
    case "clear": return { ...initialConversation(), locale: state.locale, history: archiveCurrent(state, action.eventId), event: { id: action.eventId, kind: "cleared" } };
    case "open": {
      const selected = state.history.find((item) => item.id === action.id);
      if (!selected) return state;
      return { ...initialConversation(), locale: state.locale, turns: selected.turns, draft: selected.draft,
        history: archiveCurrent(state, action.eventId).filter((item) => item.id !== action.id) };
    }
    case "delete-history": return { ...state, history: state.history.filter((item) => item.id !== action.id) };
    case "start": {
      if (state.pending || state.turns.length / 2 >= MAX_EXCHANGES) return state;
      const validation = draftProblem(state.draft);
      if (validation) return { ...state, validation };
      const parsed = coachRequestSchema.safeParse({ requestId: action.requestId, locale: state.locale,
        turns: [...state.turns, { role: "user", text: state.draft }] });
      if (!parsed.success) return state;
      return { ...state, draft: "", pending: parsed.data, failure: null, validation: null, event: { id: `${action.requestId}-loading`, kind: "loading" } };
    }
    case "success": {
      if (state.pending?.requestId !== action.requestId) return state;
      const parsed = successForRequestSchema(state.pending).safeParse(action.value);
      if (!parsed.success) return conversationReducer(state, { type: "failure", requestId: action.requestId,
        failure: { requestId: action.requestId, code: "UNAVAILABLE", retryable: true } });
      return { ...state, turns: [...state.pending.turns, { role: "assistant", response: parsed.data.response }], draft: "", pending: null,
        failure: null, validation: null, event: { id: `${action.requestId}-reply`, kind: "reply", urgent: parsed.data.response.kind === "escalation" } };
    }
    case "failure": {
      if (state.pending?.requestId !== action.requestId) return state;
      const parsed = failureSchema.safeParse(action.failure);
      const failure: Failure = parsed.success && (parsed.data.requestId === null || parsed.data.requestId === action.requestId) ? parsed.data
        : { requestId: action.requestId, code: "UNAVAILABLE", retryable: true };
      return { ...state, draft: submittedDraft(state), pending: null, failure, event: { id: `${action.requestId}-error`, kind: "error", urgent: true } };
    }
    case "cancel": return state.pending?.requestId !== action.requestId ? state : { ...state, draft: submittedDraft(state), pending: null, failure: null,
      event: { id: `${action.requestId}-cancelled`, kind: "cancelled" } };
  }
}
