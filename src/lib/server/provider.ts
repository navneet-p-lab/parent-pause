import "server-only";
import OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import { z } from "zod";
import {
  coachRequestSchema, coachResponseSchema, classificationSchema, parseProviderResponse,
  providerClassificationWireSchema, providerResponseWireSchema, providerReviewWireSchema, reviewSchema,
  type CoachRequest, type CoachResponse, type Classification, type Review,
} from "@/lib/contracts";
import { ConfigurationError, type ProviderConfig } from "./config";
import { classificationPrompt } from "./prompts/classify";
import { coachingPrompt } from "./prompts/coach";
import { reviewPrompt } from "./prompts/review";

export const PROVIDER_REVISION = "t05-provider-v3";
export const PROVIDER_LIMITS = { deadlineMs: 20_000, calls: 3, outputTokens: 1_200 } as const;
export const providerJsonSchemas = {
  classify: z.toJSONSchema(providerClassificationWireSchema, { target: "draft-7" }),
  generate: z.toJSONSchema(providerResponseWireSchema, { target: "draft-7" }),
  review: z.toJSONSchema(providerReviewWireSchema, { target: "draft-7" }),
};
export type Operation = keyof typeof providerJsonSchemas;
export type Usage = { inputTokens: number; outputTokens: number };
export type ProviderResult<T> = { value: T; usage: Usage | null; durationMs: number; requestedModel: string; returnedModel: string | null; operation: Operation };
export type ProviderErrorCode = "CANCELLED" | "TIMEOUT" | "CALL_BUDGET" | "REFUSAL"
  | "INCOMPLETE" | "EMPTY_OUTPUT" | "INVALID_OUTPUT" | "UPSTREAM" | "INVALID_INPUT";
export class ProviderError extends Error {
  constructor(readonly code: ProviderErrorCode, readonly usage: Usage | null = null,
    readonly metadata?: { operation: Operation; durationMs: number; requestedModel: string; returnedModel: string | null }) {
    super(code); this.name = "ProviderError";
  }
}

/** Narrow, injectable transport: tests exercise SDK-shaped responses without a key/network. */
export type ProviderTransport = (body: ResponseCreateParamsNonStreaming, options: {
  signal: AbortSignal; timeout: number; maxRetries: 0;
}) => Promise<unknown>;

function sdkTransport(config: Extract<ProviderConfig, { mode: "openai" }>): ProviderTransport {
  const client = new OpenAI({ apiKey: config.apiKey, maxRetries: 0, timeout: PROVIDER_LIMITS.deadlineMs,
    baseURL: "https://api.openai.com/v1", organization: null, project: null, logLevel: "off" });
  return async (body, options) => client.responses.create(body, options);
}

const record = (input: unknown): Record<string, unknown> | null =>
  typeof input === "object" && input !== null && !Array.isArray(input) ? input as Record<string, unknown> : null;
function usageOf(response: Record<string, unknown>): Usage | null {
  const usage = record(response.usage);
  const valid = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
  return usage && valid(usage.input_tokens) && valid(usage.output_tokens)
    ? { inputTokens: usage.input_tokens, outputTokens: usage.output_tokens } : null;
}

function decode(raw: unknown): { value: unknown; usage: Usage | null } {
  const response = record(raw);
  if (!response) throw new ProviderError("INVALID_OUTPUT");
  const usage = usageOf(response);
  if (response.status !== "completed") throw new ProviderError("INCOMPLETE", usage);
  if (!Array.isArray(response.output)) throw new ProviderError("EMPTY_OUTPUT", usage);
  const texts: string[] = [];
  for (const item of response.output) {
    const message = record(item);
    if (message?.type === "reasoning") continue;
    if (message?.type !== "message" || message.role !== "assistant" || message.status !== "completed"
      || !Array.isArray(message.content)) throw new ProviderError("INVALID_OUTPUT", usage);
    for (const part of message.content) {
      const content = record(part);
      if (content?.type === "refusal") throw new ProviderError("REFUSAL", usage);
      if (content?.type !== "output_text" || typeof content.text !== "string") throw new ProviderError("INVALID_OUTPUT", usage);
      texts.push(content.text);
    }
  }
  if (!texts.length || texts.every((text) => !text.trim())) throw new ProviderError("EMPTY_OUTPUT", usage);
  // Never concatenate multiple messages/parts into accidentally valid output.
  if (texts.length !== 1) throw new ProviderError("INVALID_OUTPUT", usage);
  try { return { value: JSON.parse(texts[0]), usage }; }
  catch { throw new ProviderError("INVALID_OUTPUT", usage); }
}

/** One instance per request. Caller owns policy; this adapter never approves coaching. */
export function createProviderSession(input: CoachRequest, options: {
  config: ProviderConfig; transport?: ProviderTransport; signal?: AbortSignal;
}) {
  const parsed = coachRequestSchema.safeParse(input);
  if (!parsed.success) throw new ProviderError("INVALID_INPUT");
  const request = parsed.data; // Zod clones, insulating future calls from caller mutations.
  if (options.config.mode !== "openai") throw new ConfigurationError();
  const config = options.config;
  const transport = options.transport ?? sdkTransport(config);
  const deadline = Date.now() + PROVIDER_LIMITS.deadlineMs;
  let calls = 0;
  let busy = false;
  let failed = false;
  let nextOperation: Operation | null = "classify";

  async function call<T>(operation: Operation, prompt: { instructions: string; input: string }, parse: (value: unknown) => T, authoredPause = false): Promise<ProviderResult<T>> {
    if (options.signal?.aborted) throw new ProviderError("CANCELLED");
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new ProviderError("TIMEOUT");
    const reviewAuthoredPause = authoredPause && operation === "review" && nextOperation === "generate";
    if (busy || failed || calls >= PROVIDER_LIMITS.calls || (nextOperation !== operation && !reviewAuthoredPause)) throw new ProviderError("CALL_BUDGET");
    calls++; // Failed and concurrent operations also consume the one allowed stage.
    nextOperation = operation === "classify" ? "generate" : operation === "generate" ? "review" : null;
    busy = true;
    const started = Date.now();
    const controller = new AbortController();
    const cancel = () => controller.abort(new ProviderError("CANCELLED"));
    options.signal?.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(() => controller.abort(new ProviderError("TIMEOUT")), remaining);
    let removeAbort = () => {};
    let returnedModel: string | null = null;
    try {
      const aborted = new Promise<never>((_, reject) => {
        const onAbort = () => reject(controller.signal.reason);
        controller.signal.addEventListener("abort", onAbort, { once: true });
        removeAbort = () => controller.signal.removeEventListener("abort", onAbort);
      });
      const pending = Promise.resolve().then(() => {
        if (controller.signal.aborted) throw controller.signal.reason;
        return transport({
          model: config.model, ...prompt, input: [{ role: "user", content: prompt.input }],
          store: false, stream: false, tools: [], max_output_tokens: PROVIDER_LIMITS.outputTokens,
          text: { format: { type: "json_schema", name: `parentpause_${operation}`, strict: true, schema: providerJsonSchemas[operation] } },
        }, { signal: controller.signal, timeout: remaining, maxRetries: 0 });
      });
      const raw = await Promise.race([pending, aborted]);
      const model = record(raw)?.model;
      returnedModel = typeof model === "string" && /^[A-Za-z0-9_.:/-]{1,200}$/.test(model) ? model : null;
      if (controller.signal.aborted) throw controller.signal.reason;
      if (Date.now() >= deadline) throw new ProviderError("TIMEOUT");
      const decoded = decode(raw);
      let value: T;
      try { value = parse(decoded.value); }
      catch { throw new ProviderError("INVALID_OUTPUT", decoded.usage); }
      return { value, usage: decoded.usage, durationMs: Date.now() - started, requestedModel: config.model,
        returnedModel, operation };
    } catch (error) {
      failed = true;
      const failure = controller.signal.aborted ? controller.signal.reason : error;
      if (process.env.NODE_ENV === "development") {
        // Fixed, bounded metadata only. Never log SDK messages/headers or chat/output.
        const status = failure instanceof OpenAI.APIError ? failure.status : undefined;
        const code = failure instanceof OpenAI.APIError && ["rate_limit_exceeded", "insufficient_quota", "credit_balance_exhausted", "invalid_api_key", "model_not_found"].includes(failure.code ?? "")
          ? failure.code : undefined;
        console.warn("[ParentPause provider failure]", {
          operation, code: failure instanceof ProviderError ? failure.code : "UPSTREAM",
          ...(Number.isInteger(status) && status! >= 400 && status! <= 599 ? { status } : {}),
          ...(code ? { upstreamCode: code } : {}),
        });
      }
      // Never propagate SDK/Zod errors, causes, headers, prompt text or raw output.
      throw new ProviderError(failure instanceof ProviderError ? failure.code : "UPSTREAM",
        failure instanceof ProviderError ? failure.usage : null,
        { operation, durationMs: Date.now() - started, requestedModel: config.model, returnedModel });
    } finally {
      busy = false;
      clearTimeout(timer); removeAbort(); options.signal?.removeEventListener("abort", cancel);
    }
  }

  return {
    classify: () => call<Classification>("classify", classificationPrompt(request), (v) => classificationSchema.parse(v)),
    generate: (kind: "plan" | "clarify" | "summary") => call<CoachResponse>("generate", coachingPrompt(request, kind), (v) => {
      const candidate = parseProviderResponse(v, request.locale);
      if (candidate.kind !== kind) throw new ProviderError("INVALID_OUTPUT");
      return candidate;
    }),
    review: (candidate: CoachResponse) => {
      const valid = coachResponseSchema.safeParse(candidate);
      if (!valid.success || valid.data.locale !== request.locale) return Promise.reject(new ProviderError("INVALID_INPUT"));
      return call<Review>("review", reviewPrompt(request, valid.data), (v) => reviewSchema.parse(v), valid.data.kind === "pause_offer" || valid.data.kind === "paused");
    },
  };
}
