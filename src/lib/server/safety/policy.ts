import {
  classificationSchema,
  coachResponseSchema,
  reviewSchema,
  type CoachRequest,
  type CoachResponse,
  type EscalationCategory,
} from "@/lib/contracts";
import { findExplicitRisk, hasContextualResolutionClaim } from "./rules";
import { authoredBoundary, authoredEscalation } from "./templates";

export const SAFETY_POLICY_REVISION = "t04-v1";

export type SafetyDecision =
  | { kind: "classify"; fallbackCategory?: EscalationCategory; reassessPriorRisk?: boolean }
  | { kind: "generate"; responseKind: "plan" | "clarify"; fallbackCategory?: EscalationCategory }
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
  if (category === "medical_legal") {
    // An authored boundary is not reviewed. Retain known risk rather than let
    // this route bypass the two-stage contextual reassessment requirement.
    return early.fallbackCategory ? fallback() : { kind: "respond", response: authoredBoundary(request.locale) };
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
  if (initial.kind !== "generate") return initial;
  const fallback = () => initial.fallbackCategory ? escalation(request, initial.fallbackCategory) : unavailable();
  const parsedReview = reviewSchema.safeParse(review);
  if (!parsedReview.success) return fallback();
  if (parsedReview.data.decision === "escalate") return escalation(request, parsedReview.data.category);
  if (parsedReview.data.decision === "block") return fallback();
  const parsedCandidate = coachResponseSchema.safeParse(candidate);
  if (!parsedCandidate.success || parsedCandidate.data.locale !== request.locale
    || parsedCandidate.data.kind !== initial.responseKind) return fallback();
  return { kind: "respond", response: parsedCandidate.data };
}
