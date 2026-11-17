import { coachRequestSchema, failureSchema, LIMITS, requestIdSchema, successForRequestSchema, type CoachRequest, type Failure, type Success } from "@/lib/contracts";

export const CLIENT_DEADLINE_MS = 25_000;
export class CoachClientError extends Error {
  constructor(readonly failure: Failure) { super(failure.code); this.name = "CoachClientError"; }
}
const unavailable = (requestId: string): CoachClientError => new CoachClientError({ requestId, code: "UNAVAILABLE", retryable: true });

export async function sendCoach(input: CoachRequest, signal: AbortSignal, fetcher: typeof fetch = fetch): Promise<Success> {
  const parsed = coachRequestSchema.safeParse(input);
  if (!parsed.success) throw new CoachClientError({ requestId: requestIdSchema.safeParse(input?.requestId).success ? input.requestId : null, code: "INVALID_INPUT", retryable: false });
  const request = parsed.data;
  const body = JSON.stringify(request);
  if (new TextEncoder().encode(body).byteLength > LIMITS.bodyBytes) throw new CoachClientError({ requestId: request.requestId, code: "PAYLOAD_TOO_LARGE", retryable: false });
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal.aborted) abort(); else signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, CLIENT_DEADLINE_MS);
  let remove = () => {};
  try {
    if (controller.signal.aborted) throw unavailable(request.requestId);
    const cancelled = new Promise<never>((_, reject) => {
      const onAbort = () => reject(unavailable(request.requestId));
      controller.signal.addEventListener("abort", onAbort, { once: true });
      remove = () => controller.signal.removeEventListener("abort", onAbort);
    });
    const operation = async () => {
      if (controller.signal.aborted) throw unavailable(request.requestId);
      const response = await fetcher("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body,
        signal: controller.signal, cache: "no-store", credentials: "same-origin", redirect: "error" });
      if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "") || !response.body) {
        void response.body?.cancel().catch(() => {});
        throw unavailable(request.requestId);
      }
      const reader = response.body.getReader();
      const stopReading = () => { void reader.cancel().catch(() => {}); };
      controller.signal.addEventListener("abort", stopReading, { once: true });
      if (controller.signal.aborted) stopReading();
      const decoder = new TextDecoder("utf-8", { fatal: true });
      let bytes = 0; let text = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > LIMITS.bodyBytes || controller.signal.aborted) throw unavailable(request.requestId);
          text += decoder.decode(value, { stream: true });
        }
        text += decoder.decode();
      } finally { controller.signal.removeEventListener("abort", stopReading); stopReading(); }
      const value: unknown = JSON.parse(text);
      if (response.status === 200) {
        const success = successForRequestSchema(request).safeParse(value);
        if (!success.success) throw unavailable(request.requestId);
        return success.data;
      }
      const failed = failureSchema.safeParse(value);
      if (!failed.success || (failed.data.requestId !== null && failed.data.requestId !== request.requestId)) throw unavailable(request.requestId);
      const expected = { INVALID_INPUT: 400, PAYLOAD_TOO_LARGE: 413, RATE_LIMITED: 429, UNAVAILABLE: 503, CONFIGURATION_ERROR: 503 } as const;
      if (response.status !== expected[failed.data.code] || failed.data.retryable !== ["UNAVAILABLE", "RATE_LIMITED"].includes(failed.data.code)) throw unavailable(request.requestId);
      throw new CoachClientError(failed.data);
    };
    const result = await Promise.race([Promise.resolve().then(operation), cancelled]);
    if (controller.signal.aborted) throw unavailable(request.requestId);
    return result;
  } catch (error) {
    throw error instanceof CoachClientError ? error : unavailable(request.requestId);
  } finally { clearTimeout(timer); remove(); signal.removeEventListener("abort", abort); }
}
