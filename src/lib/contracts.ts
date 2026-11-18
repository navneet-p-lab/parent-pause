import { z } from "zod";
import type { ReactNode } from "react";

/** Contract t01-v4. All content is untrusted plain text, never HTML/Markdown. */
export const CONTRACT_REVISION = "t01-v4";
export const LIMITS = {
  userCodePoints: 2_000,
  transcriptEntries: 15,
  bodyBytes: 64 * 1_024,
  acknowledgmentCodePoints: 180,
  stepCodePoints: 180,
  questionCodePoints: 180,
  messageCodePoints: 240,
  actionCodePoints: 240,
  planEnglishWords: 120,
  escalationEnglishWords: 100,
} as const;

export const countCodePoints = (text: string): number => Array.from(text).length;
const wordSeparator = /[\p{White_Space}\uFEFF]+/u;
export const countWords = (text: string): number => text.split(wordSeparator).filter(Boolean).length;

function boundedText(max: number) {
  // Do not trim/normalize the returned string: preserve parent text and script.
  return z.string().refine((text) => /[^\p{White_Space}\uFEFF]/u.test(text), "Text must not be blank")
    .refine((text) => countCodePoints(text) <= max, `Text exceeds ${max} code points`);
}

export const localeSchema = z.enum(["en", "ur"]);
export const escalationCategorySchema = z.enum(["emergency", "abuse", "self_harm"]);
export const requestIdSchema = z.uuid();

// Wire shapes contain no custom refinements. Their root is always an object,
// and unions are nested, so T05 can export provider JSON Schema from these.
const checkInWireSchema = z.strictObject({ kind: z.literal("question"), text: z.string() });
const planWireSchema = z.strictObject({
  kind: z.literal("plan"), locale: localeSchema, acknowledgment: z.string(),
  steps: z.array(z.string()), checkIn: checkInWireSchema,
});
const clarifyWireSchema = z.strictObject({
  kind: z.literal("clarify"), locale: localeSchema, acknowledgment: z.string(),
  checkIn: checkInWireSchema,
});
const boundaryWireSchema = z.strictObject({
  kind: z.literal("boundary"), locale: localeSchema, message: z.string(),
  alternative: z.string(), checkIn: checkInWireSchema,
});
const escalationWireSchema = z.strictObject({
  kind: z.literal("escalation"), locale: localeSchema, category: escalationCategorySchema,
  message: z.string(), actions: z.array(z.string()), checkIn: checkInWireSchema,
});
const pauseOfferWireSchema = z.strictObject({
  kind: z.literal("pause_offer"), locale: localeSchema, acknowledgment: z.string(), checkIn: checkInWireSchema,
});
const pausedWireSchema = z.strictObject({ kind: z.literal("paused"), locale: localeSchema, message: z.string() });
const summaryWireSchema = z.strictObject({
  kind: z.literal("summary"), locale: localeSchema, acknowledgment: z.string(), steps: z.array(z.string()),
});

export const providerResponseWireSchema = z.strictObject({
  response: z.union([planWireSchema, clarifyWireSchema, boundaryWireSchema, escalationWireSchema, pauseOfferWireSchema, pausedWireSchema, summaryWireSchema]),
});
const conversationIntentSchema = z.enum(["continue", "summarize", "close", "offer_pause", "confirm_pause"]);
export const classificationSchema = z.strictObject({
  category: z.enum(["routine", "unclear", "medical_legal", "emergency", "abuse", "self_harm"]),
  // Old local fixtures/recorded classifications have no intent. They continue coaching.
  intent: conversationIntentSchema.optional(),
});
export const providerClassificationWireSchema = classificationSchema.extend({ intent: conversationIntentSchema });
export const providerReviewWireSchema = z.strictObject({
  decision: z.enum(["allow", "block", "escalate"]),
  category: escalationCategorySchema.nullable(),
});
export const reviewSchema = z.discriminatedUnion("decision", [
  providerReviewWireSchema.extend({ decision: z.literal("allow"), category: z.null() }),
  providerReviewWireSchema.extend({ decision: z.literal("block"), category: z.null() }),
  providerReviewWireSchema.extend({ decision: z.literal("escalate"), category: escalationCategorySchema }),
]);

export const checkInSchema = checkInWireSchema.extend({ text: boundedText(LIMITS.questionCodePoints) });
const acknowledgment = boundedText(LIMITS.acknowledgmentCodePoints);
const message = boundedText(LIMITS.messageCodePoints);
export const planSchema = planWireSchema.extend({
  acknowledgment,
  steps: z.array(boundedText(LIMITS.stepCodePoints)).min(1).max(3),
  checkIn: checkInSchema,
});
export const clarifySchema = clarifyWireSchema.extend({ acknowledgment, checkIn: checkInSchema });
export const boundarySchema = boundaryWireSchema.extend({
  message, alternative: boundedText(LIMITS.messageCodePoints), checkIn: checkInSchema,
});
export const escalationSchema = escalationWireSchema.extend({
  message, actions: z.array(boundedText(LIMITS.actionCodePoints)).min(1).max(3), checkIn: checkInSchema,
});
export const pauseOfferSchema = pauseOfferWireSchema.extend({ acknowledgment, checkIn: checkInSchema });
export const pausedSchema = pausedWireSchema.extend({ message });
export const summarySchema = summaryWireSchema.extend({
  acknowledgment, steps: z.array(boundedText(LIMITS.stepCodePoints)).min(1).max(5),
});

export const coachResponseSchema = z.discriminatedUnion("kind", [
  planSchema, clarifySchema, boundarySchema, escalationSchema, pauseOfferSchema, pausedSchema, summarySchema,
]).superRefine((response, ctx) => {
  if (response.kind === "summary") {
    const normalized = response.steps.map((step) => step.normalize("NFKC").toLowerCase().replace(/[\p{P}\p{White_Space}]+/gu, " ").trim());
    if (new Set(normalized).size !== normalized.length) ctx.addIssue({ code: "custom", message: "Steps must be distinct" });
  }
  if (response.kind === "summary" && [response.acknowledgment, ...response.steps].some((text) => /[?؟]/u.test(text))) {
    ctx.addIssue({ code: "custom", message: "A summary must not ask another question" });
  }
  if (response.locale !== "en") return;
  let fields: string[];
  let max: number;
  if (response.kind === "plan" || response.kind === "summary") {
    fields = [response.acknowledgment, ...response.steps, ...(response.kind === "plan" ? [response.checkIn.text] : [])];
    max = LIMITS.planEnglishWords;
  } else if (response.kind === "escalation") {
    fields = [response.message, ...response.actions, response.checkIn.text];
    max = LIMITS.escalationEnglishWords;
  } else return;
  if (countWords(fields.join(" ")) > max) {
    ctx.addIssue({ code: "custom", message: `English response exceeds ${max} words` });
  }
});

export const userTurnSchema = z.strictObject({
  role: z.literal("user"), text: boundedText(LIMITS.userCodePoints),
});
export const assistantTurnSchema = z.strictObject({ role: z.literal("assistant"), response: coachResponseSchema });
export const turnSchema = z.discriminatedUnion("role", [userTurnSchema, assistantTurnSchema]);
export const coachRequestSchema = z.strictObject({
  requestId: requestIdSchema, locale: localeSchema,
  turns: z.array(turnSchema).min(1).max(LIMITS.transcriptEntries),
}).superRefine((request, ctx) => {
  request.turns.forEach((turn, index) => {
    if (turn.role !== (index % 2 === 0 ? "user" : "assistant")) {
      ctx.addIssue({ code: "custom", path: ["turns", index, "role"], message: "Turns must alternate, user first" });
    }
  });
  if (request.turns.at(-1)?.role !== "user") {
    ctx.addIssue({ code: "custom", path: ["turns"], message: "Latest turn must be a user turn" });
  }
});

export const successSchema = z.strictObject({ requestId: requestIdSchema, response: coachResponseSchema });
export const failureCodeSchema = z.enum([
  "INVALID_INPUT", "PAYLOAD_TOO_LARGE", "RATE_LIMITED", "UNAVAILABLE", "CONFIGURATION_ERROR",
]);
export const failureSchema = z.strictObject({
  requestId: requestIdSchema.nullable(), code: failureCodeSchema, retryable: z.boolean(),
});

/** Validate new output against its request; old transcript locales stay valid. */
export function successForRequestSchema(request: Pick<CoachRequest, "requestId" | "locale">) {
  return successSchema.superRefine((success, ctx) => {
    if (success.requestId !== request.requestId) {
      ctx.addIssue({ code: "custom", path: ["requestId"], message: "Response request ID mismatch" });
    }
    if (success.response.locale !== request.locale) {
      ctx.addIssue({ code: "custom", path: ["response", "locale"], message: "Response locale mismatch" });
    }
  });
}

/** Provider shape validity alone must never be accepted as application validity. */
export function parseProviderResponse(input: unknown, locale: Locale): CoachResponse {
  const { response } = providerResponseWireSchema.parse(input);
  return coachResponseSchema.refine((value) => value.locale === locale, "Response locale mismatch").parse(response);
}

export type Locale = z.infer<typeof localeSchema>;
export type CheckIn = z.infer<typeof checkInSchema>;
export type CoachResponse = z.infer<typeof coachResponseSchema>;
export type CoachRequest = z.infer<typeof coachRequestSchema>;
export type Turn = z.infer<typeof turnSchema>;
export type Success = z.infer<typeof successSchema>;
export type Failure = z.infer<typeof failureSchema>;
export type FailureCode = z.infer<typeof failureCodeSchema>;
export type EscalationCategory = z.infer<typeof escalationCategorySchema>;
export type Classification = z.infer<typeof classificationSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ProviderResponseWire = z.infer<typeof providerResponseWireSchema>;
export type ProviderReviewWire = z.infer<typeof providerReviewWireSchema>;

// Shared presentational interfaces: T02 and T03 can compile independently.
export type ResponseLabels = {
  user: string;
  coach: string;
  planHeading: string;
  summaryHeading: string;
  clarificationHeading: string;
  boundaryHeading: string;
  escalationHeading: string;
  pauseOfferHeading: string;
  pausedHeading: string;
  checkInHeading: string;
  loading: string;
  loadingHints: readonly [string, string, string];
  errors: Record<FailureCode, string>;
};
export type CoachResponseProps = { response: CoachResponse; labels: ResponseLabels };
export type ConversationStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; code: FailureCode };
export type ConversationProps = {
  turns: readonly Turn[];
  uiLocale: Locale;
  labels: Record<Locale, ResponseLabels>;
  status: ConversationStatus;
  announcement: null | { id: string; text: string; urgency: "polite" | "assertive" };
};
export type LocalizedShellProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  children: ReactNode;
};
