import "server-only";
import { coachRequestSchema, failureSchema, successForRequestSchema, type CoachRequest } from "@/lib/contracts";
import { ConfigurationError } from "./config";
import { correlation, createCoachService, failure, unavailableForRequest, type CoachService } from "./coach-service";
import { clientKey, createInstanceLimiter, readBoundedJson, requestDeadline,
  RequestLimitError, transportConfig, validateHeaders, withSignal } from "./request-limits";

export function createCoachHandler(options: {
  service?: CoachService;
  env?: () => Record<string, string | undefined>;
  limiter?: ReturnType<typeof createInstanceLimiter>;
} = {}) {
  const service = options.service ?? createCoachService();
  const limiter = options.limiter ?? createInstanceLimiter();
  return async (request: Request): Promise<Response> => {
    const deadline = requestDeadline(request.signal);
    let requestId: string | null = null;
    let validRequest: CoachRequest | null = null;
    const respond = (body: Awaited<ReturnType<CoachService>>, headers?: Record<string, string>) => {
      const status = "response" in body ? 200 : ({ INVALID_INPUT: 400, PAYLOAD_TOO_LARGE: 413,
        RATE_LIMITED: 429, UNAVAILABLE: 503, CONFIGURATION_ERROR: 503 } as const)[body.code];
      return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
    };
    try {
      if (request.method !== "POST") return respond(failure("INVALID_INPUT"));
      const config = transportConfig((options.env ?? (() => process.env))());
      validateHeaders(request, config.origin);
      const limit = limiter.consume(clientKey(request, config.clientKeyHeader));
      if (!limit.allowed) return respond(failure("RATE_LIMITED"), { "Retry-After": String(limit.retryAfter) });
      const input = await readBoundedJson(request, deadline.signal);
      requestId = correlation(input);
      const parsed = coachRequestSchema.safeParse(input);
      if (!parsed.success) return respond(failure("INVALID_INPUT", requestId));
      validRequest = parsed.data;
      // Service races every stage against this transport deadline and retains known-risk fallback.
      const result = await withSignal(() => service(parsed.data, { signal: deadline.signal }), deadline.signal);
      const success = successForRequestSchema(parsed.data).safeParse(result);
      if (success.success) return respond(success.data);
      const failed = failureSchema.safeParse(result);
      return respond(failed.success && failed.data.requestId === requestId ? failed.data : unavailableForRequest(parsed.data));
    } catch (error) {
      if (validRequest) {
        const fallback = unavailableForRequest(validRequest);
        if ("response" in fallback || !(error instanceof ConfigurationError)) return respond(fallback);
      }
      return respond(failure(error instanceof ConfigurationError ? "CONFIGURATION_ERROR"
        : error instanceof RequestLimitError ? error.code : "UNAVAILABLE", requestId));
    } finally { deadline.dispose(); }
  };
}

export function methodNotAllowed() {
  return Response.json(failure("INVALID_INPUT"), { status: 405,
    headers: { "Cache-Control": "no-store", Allow: "POST" } });
}
