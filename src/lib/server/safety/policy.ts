import {
  classificationSchema,
  coachResponseSchema,
  reviewSchema,
  type CoachRequest,
  type CoachResponse,
  type EscalationCategory,
} from "@/lib/contracts";
import { findExplicitRisk, hasContextualResolutionClaim } from "./rules";
import { authoredBoundary, authoredEscalation, authoredPause } from "./templates";
import { isClosingAcknowledgment } from "./closing";
import { isSummaryRequest } from "./summary";

export const SAFETY_POLICY_REVISION = "t06-safety-v5";

export type SafetyDecision =
  | { kind: "classify"; fallbackCategory?: EscalationCategory; reassessPriorRisk?: boolean }
  | { kind: "generate"; responseKind: "plan" | "clarify" | "summary"; fallbackCategory?: EscalationCategory }
  | { kind: "review"; response: Extract<CoachResponse, { kind: "pause_offer" | "paused" }>; fallbackCategory?: EscalationCategory }
  | { kind: "respond"; response: CoachResponse }
  | { kind: "unavailable"; code: "UNAVAILABLE"; retryable: true };

const unavailable = (): SafetyDecision => ({ kind: "unavailable", code: "UNAVAILABLE", retryable: true });
const escalation = (request: CoachRequest, category: EscalationCategory): SafetyDecision => ({
  kind: "respond", response: authoredEscalation(request.locale, category),
});

/**
 * Call after request validation. Explicit emergency bypasses provider work unless
 * a later contextual resolution claim needs semantic reassessment. Lower known
 * risks classify the full conversation so a novel emergency can outrank them.
 * The fallback is server-derived from supplied text, never a client safety flag.
 */
export function beforeClassification(request: CoachRequest): SafetyDecision {
  const risk = findExplicitRisk(request.turns);
  if (!risk) return { kind: "classify" };
  let resolutionIndex = -1;
  request.turns.forEach((turn, index) => {
    if (index > risk.turnIndex && turn.role === "user" && hasContextualResolutionClaim(turn.text)) resolutionIndex = index;
  });
  // A new explicit declaration in/after that claim keeps the earlier risk floor.
  // In particular, current emergency cannot be erased by a resolution claim.
  const reassessPriorRisk = resolutionIndex >= 0
    && findExplicitRisk(request.turns.slice(resolutionIndex)) === null;
  if (risk.category === "emergency" && !reassessPriorRisk) return escalation(request, "emergency");
  return { kind: "classify", fallbackCategory: risk.category, reassessPriorRisk };
}

/** Unknown classification retains known risk or becomes unavailable, never safe. */
export function afterClassification(request: CoachRequest, input: unknown): SafetyDecision {
  const early = beforeClassification(request);
  if (early.kind !== "classify") return early;
  const fallback = () => early.fallbackCategory ? escalation(request, early.fallbackCategory) : unavailable();
  const parsed = classificationSchema.safeParse(input);
  if (!parsed.success) return fallback();
  const category = parsed.data.category;
  if (category === "emergency") return escalation(request, "emergency");
  if (category === "abuse" || category === "self_harm") {
    return escalation(request, early.fallbackCategory === "emergency" && !early.reassessPriorRisk
      ? "emergency" : category);
  }
  // No routine/unclear/boundary route can erase an unresolved explicit risk.
  if (early.fallbackCategory && !early.reassessPriorRisk) return fallback();
  const previous = request.turns.at(-2);
  const prior = previous?.role === "assistant" ? previous.response.kind : null;
  const latest = request.turns.at(-1);
  // Recapping existing advice is a new request, so it outranks a closing intent.
  // The narrow whole-message helper repairs historical-topic carryover only;
  // every generated recap still requires independent full-context review.
  const recap = latest?.role === "user" && isSummaryRequest(latest.text);
  if (!early.fallbackCategory && (category === "routine" || category === "medical_legal")
    && prior && prior !== "escalation" && (parsed.data.intent === "summarize" || recap)) {
    return { kind: "generate", responseKind: "summary" };
  }
  // A nonurgent professional topic in history must not turn a courtesy-only
  // acknowledgment into another boundary. Full-context review still must allow closure.
  const courtesy = latest?.role === "user" && isClosingAcknowledgment(latest.text);
  if (!early.fallbackCategory && (category === "routine" || category === "medical_legal")
    && prior && prior !== "escalation" && (parsed.data.intent === "close" || courtesy)) {
    return { kind: "review", response: authoredPause(request.locale, true) };
  }
  if (category === "medical_legal") {
    // An authored boundary is not reviewed. Retain known risk rather than let
    // this route bypass the two-stage contextual reassessment requirement.
    return early.fallbackCategory ? fallback() : { kind: "respond", response: authoredBoundary(request.locale) };
  }
  // Only routine conversation can pause. Even a resolution claim must finish
  // the existing classify/generate/review reassessment before releasing a risk floor.
  if (category === "routine" && !early.fallbackCategory) {
    if (parsed.data.intent === "confirm_pause" && prior === "pause_offer") {
      return { kind: "review", response: authoredPause(request.locale, true) };
    }
    if (parsed.data.intent === "offer_pause" && (prior === "plan" || prior === "clarify" || prior === "pause_offer")) {
      return { kind: "review", response: authoredPause(request.locale, false) };
    }
  }
  const decision = { kind: "generate" as const, responseKind: category === "unclear" ? "clarify" as const : "plan" as const };
  return early.fallbackCategory ? { ...decision, fallbackCategory: early.fallbackCategory } : decision;
}

/**
 * Full-context review is mandatory before releasing a prior-risk floor to a new
 * routine/clarification response. Invalid/block/outage/wrong-locale/shape retains
 * the authored fallback. New review emergency always upgrades any lower risk.
 */
export function afterReview(
  request: CoachRequest,
  classification: unknown,
  candidate: unknown,
  review: unknown,
): SafetyDecision {
  const initial = afterClassification(request, classification);
  if (initial.kind !== "generate" && initial.kind !== "review") return initial;
  const fallback = () => initial.fallbackCategory ? escalation(request, initial.fallbackCategory) : unavailable();
  const parsedReview = reviewSchema.safeParse(review);
  if (!parsedReview.success) return fallback();
  if (parsedReview.data.decision === "escalate") return escalation(request, parsedReview.data.category);
  if (parsedReview.data.decision === "block") return fallback();
  const parsedCandidate = coachResponseSchema.safeParse(candidate);
  if (!parsedCandidate.success || parsedCandidate.data.locale !== request.locale
    || (initial.kind === "generate" ? parsedCandidate.data.kind !== initial.responseKind
      : JSON.stringify(parsedCandidate.data) !== JSON.stringify(initial.response))) return fallback();
  return { kind: "respond", response: parsedCandidate.data };
}
