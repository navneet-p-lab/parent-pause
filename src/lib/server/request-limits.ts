import "server-only";
import { createHash } from "node:crypto";
import { LIMITS } from "@/lib/contracts";
import { ConfigurationError } from "./config";

export const REQUEST_DEADLINE_MS = 20_000;
export class RequestLimitError extends Error {
  constructor(readonly code: "INVALID_INPUT" | "PAYLOAD_TOO_LARGE" | "UNAVAILABLE") {
    super(code); this.name = "RequestLimitError";
  }
}

/** Race even injected operations that ignore cancellation; never expose abort reasons. */
export async function withSignal<T>(work: () => Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) throw new RequestLimitError("UNAVAILABLE");
  let remove = () => {};
  try {
    const aborted = new Promise<never>((_, reject) => {
      const onAbort = () => reject(new RequestLimitError("UNAVAILABLE"));
      signal.addEventListener("abort", onAbort, { once: true });
      remove = () => signal.removeEventListener("abort", onAbort);
    });
    const result = await Promise.race([Promise.resolve().then(() => {
      if (signal.aborted) throw new RequestLimitError("UNAVAILABLE");
      return work();
    }), aborted]);
    if (signal.aborted) throw new RequestLimitError("UNAVAILABLE");
    return result;
  } finally { remove(); }
}

export function requestDeadline(parent?: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (parent?.aborted) abort();
  else parent?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, REQUEST_DEADLINE_MS);
  return { signal: controller.signal, dispose: () => { clearTimeout(timer); parent?.removeEventListener("abort", abort); } };
}

export function transportConfig(env: Record<string, string | undefined>) {
  try {
    const raw = env.APP_ORIGIN;
    if (!raw) throw new ConfigurationError();
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || url.origin !== raw) throw new ConfigurationError();
    const header = env.COACH_CLIENT_KEY_HEADER?.toLowerCase() || null;
    if (header && (!/^[a-z0-9-]{1,80}$/.test(header) || ["host", "origin", "cookie", "authorization"].includes(header))) throw new ConfigurationError();
    return { origin: raw, clientKeyHeader: header };
  } catch { throw new ConfigurationError(); }
}

export function validateHeaders(request: Request, origin: string) {
  if (request.headers.get("origin") !== origin
    || !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")
    || (request.headers.has("sec-fetch-site") && request.headers.get("sec-fetch-site") !== "same-origin")
    || (request.headers.get("content-encoding") && request.headers.get("content-encoding") !== "identity")) {
    throw new RequestLimitError("INVALID_INPUT");
  }
  const length = request.headers.get("content-length");
  if (length !== null) {
    if (!/^\d+$/.test(length)) throw new RequestLimitError("INVALID_INPUT");
    if (Number(length) > LIMITS.bodyBytes) throw new RequestLimitError("PAYLOAD_TOO_LARGE");
  }
}

export function clientKey(request: Request, trustedHeader: string | null) {
  // Without deployment-specific trust configuration, all callers share one bucket.
  if (!trustedHeader) return "shared-local-instance";
  const value = request.headers.get(trustedHeader);
  if (!value || !/^[A-Za-z0-9_.:-]{1,128}$/.test(value)) throw new RequestLimitError("INVALID_INPUT");
  return createHash("sha256").update(value).digest("hex");
}

export async function readBoundedJson(request: Request, signal: AbortSignal): Promise<unknown> {
  if (!request.body) throw new RequestLimitError("INVALID_INPUT");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let complete = false;
  try {
    while (true) {
      const { done, value } = await withSignal(() => reader.read(), signal);
      if (done) break;
      bytes += value.byteLength;
      if (bytes > LIMITS.bodyBytes) throw new RequestLimitError("PAYLOAD_TOO_LARGE");
      chunks.push(value);
    }
    const buffer = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
    const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer));
    complete = true;
    return value;
  } catch (error) {
    if (error instanceof RequestLimitError) throw error;
    throw new RequestLimitError(signal.aborted ? "UNAVAILABLE" : "INVALID_INPUT");
  } finally {
    if (!complete) void reader.cancel().catch(() => {});
    try { reader.releaseLock(); } catch { /* An aborted pending read may still hold the lock. */ }
  }
}

/** Rolling windows; bounded storage fails closed, never evicts an active budget. */
export function createInstanceLimiter(options: { now?: () => number; maxKeys?: number } = {}) {
  const now = options.now ?? Date.now;
  const maxKeys = options.maxKeys ?? 1_024;
  if (!Number.isSafeInteger(maxKeys) || maxKeys < 1) throw new ConfigurationError();
  const buckets = new Map<string, number[]>();
  return {
    consume(key: string): { allowed: boolean; retryAfter: number } {
      const time = now();
      for (const [id, entries] of buckets) {
        const active = entries.filter((t) => t > time - 3_600_000);
        if (!active.length) buckets.delete(id); else buckets.set(id, active);
      }
      let entries = buckets.get(key);
      if (!entries) {
        if (buckets.size >= maxKeys) return { allowed: false, retryAfter: 60 };
        entries = []; buckets.set(key, entries);
      }
      const recent = entries.filter((t) => t > time - 60_000);
      if (entries.length >= 100 || recent.length >= 10) {
        const wait = Math.max(entries.length >= 100 ? entries[0] + 3_600_000 - time : 0,
          recent.length >= 10 ? recent[0] + 60_000 - time : 0);
        return { allowed: false, retryAfter: Math.max(1, Math.ceil(wait / 1_000)) };
      }
      entries.push(time);
      return { allowed: true, retryAfter: 0 };
    },
  };
}
