import "server-only";
import {
  coachRequestSchema, coachResponseSchema, failureSchema, requestIdSchema, successForRequestSchema,
  type CoachRequest, type CoachResponse, type Failure, type Success,
} from "@/lib/contracts";
import { beforeClassification, afterClassification, afterReview, type SafetyDecision } from "./safety/policy";
import { authoredEscalation } from "./safety/templates";
import { ConfigurationError, readProviderConfig } from "./config";
import { createProviderSession } from "./provider";
import { requestDeadline, withSignal } from "./request-limits";

export const SERVICE_REVISION = "t06-service-v1";
/** Values remain unknown here: injected sessions cannot bypass safety validation. */
export type CoachSession = {
  classify: () => Promise<{ value: unknown }>;
  generate: (kind: "plan" | "clarify") => Promise<{ value: unknown }>;
  review: (candidate: CoachResponse) => Promise<{ value: unknown }>;
};
export type SessionFactory = (request: CoachRequest, signal: AbortSignal) => CoachSession;
export type CoachService = (input: unknown, options?: { signal?: AbortSignal }) => Promise<Success | Failure>;

export function failure(code: Failure["code"], requestId: string | null = null): Failure {
  return failureSchema.parse({ requestId, code, retryable: code === "UNAVAILABLE" || code === "RATE_LIMITED" });
}
export function correlation(input: unknown): string | null {
  const id = requestIdSchema.safeParse(typeof input === "object" && input !== null && "requestId" in input ? input.requestId : null);
  return id.success ? id.data : null;
}

/** Transport and service timeouts share this server-derived known-risk fallback. */
export function unavailableForRequest(request: CoachRequest): Success | Failure {
  const initial = beforeClassification(request);
  const response = initial.kind === "respond" ? initial.response
    : initial.kind === "classify" && initial.fallbackCategory ? authoredEscalation(request.locale, initial.fallbackCategory) : null;
  return response ? successForRequestSchema(request).parse({ requestId: request.requestId, response })
    : failure("UNAVAILABLE", request.requestId);
}

/** Deterministic test/development responses, explicitly not a semantic classifier. */
export function fixtureSession(request: CoachRequest, signal: AbortSignal): CoachSession {
  if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "development") throw new ConfigurationError();
  const check = () => { if (signal.aborted) throw new Error("UNAVAILABLE"); };
  return {
    async classify() { check(); return { value: { category: "unclear" } }; },
    async generate() {
      check();
      return { value: request.locale === "en"
        ? { kind: "clarify", locale: "en", acknowledgment: "Demo response — no AI call. This fixture does not assess your situation.", checkIn: { kind: "question", text: "What would you like help with?" } }
        : { kind: "clarify", locale: "ur", acknowledgment: "نمونہ جواب — کوئی AI کال نہیں ہوئی۔ یہ نمونہ آپ کی صورت حال کا جائزہ نہیں لیتا۔", checkIn: { kind: "question", text: "آپ کس بات میں مدد چاہتے ہیں؟" } } };
    },
    async review() { check(); return { value: { decision: "allow", category: null } }; },
  };
}

const defaultSession: SessionFactory = (request, signal) => {
  const config = readProviderConfig();
  return config.mode === "fixtures" ? fixtureSession(request, signal) : createProviderSession(request, { config, signal });
};

export function createCoachService(sessionFactory: SessionFactory = defaultSession): CoachService {
  return async (input, options = {}) => {
    const parsed = coachRequestSchema.safeParse(input);
    if (!parsed.success) return failure("INVALID_INPUT", correlation(input));
    const request = parsed.data;
    const deadline = requestDeadline(options.signal);
    const initial = beforeClassification(request);
    const finish = (result: SafetyDecision): Success | Failure => {
      if (result.kind !== "respond") return failure("UNAVAILABLE", request.requestId);
      const envelope = successForRequestSchema(request).safeParse({ requestId: request.requestId, response: result.response });
      return envelope.success ? envelope.data : failure("UNAVAILABLE", request.requestId);
    };
    const fallback = () => unavailableForRequest(request);
    try {
      // Explicit emergency needs neither environment configuration nor provider creation.
      if (initial.kind === "respond") return finish(initial);
      if (deadline.signal.aborted) return fallback();
      const session = sessionFactory(request, deadline.signal);
      const classified = await withSignal(() => session.classify(), deadline.signal);
      const decision = afterClassification(request, classified.value);
      if (decision.kind !== "generate") return finish(decision);
      const generated = await withSignal(() => session.generate(decision.responseKind), deadline.signal);
      const candidate = coachResponseSchema.safeParse(generated.value);
      if (!candidate.success || candidate.data.locale !== request.locale || candidate.data.kind !== decision.responseKind) return fallback();
      const reviewed = await withSignal(() => session.review(candidate.data), deadline.signal);
      return finish(afterReview(request, classified.value, candidate.data, reviewed.value));
    } catch (error) {
      // Known-risk fallback outranks configuration, timeout and provider failures.
      if (initial.kind === "classify" && initial.fallbackCategory) return fallback();
      return failure(error instanceof ConfigurationError ? "CONFIGURATION_ERROR" : "UNAVAILABLE", request.requestId);
    } finally { deadline.dispose(); }
  };
}
