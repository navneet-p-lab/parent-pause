import type OpenAI from "openai";
import type { ProviderTransport } from "../src/lib/server/provider";

export type BudgetRate = { inputUsdPerMillion: number; outputUsdPerMillion: number };
type Entry = { type: "budget-reservation"; model: string; inputTokens: number; maxOutputTokens: number;
  reservedMicrousd: number; totalReservedMicrousd: number };

/** Evaluation-only guard. Reservations are never refunded, even on timeouts/errors.
 * 3x input covers cache writes; 2x output leaves pricing headroom. Token costs only,
 * not an invoice/tax guarantee. The caller persists reservations before inference.
 */
export function createBudgetTransport(options: {
  client: Pick<OpenAI, "responses">;
  rates: Record<string, BudgetRate>;
  maxUsd: number;
  maxCalls: number;
  persist: (entry: Entry) => Promise<void>;
}) {
  const limit = Math.floor(options.maxUsd * 1_000_000);
  if (!Number.isSafeInteger(limit) || limit <= 0 || !Number.isSafeInteger(options.maxCalls) || options.maxCalls < 1) {
    throw new Error("INVALID_SPEND_LIMIT");
  }
  let reserved = 0;
  let calls = 0;
  let stopped: string | null = null;
  let busy = false;
  const diagnostics: { status: number | null; code: string | null }[] = [];
  const transport: ProviderTransport = async (body, requestOptions) => {
    if (stopped || busy) throw new Error("EVALUATION_STOPPED");
    busy = true;
    try {
      const model = body.model;
      if (!model) throw new Error("UNPRICED_REQUEST");
      const rate = options.rates[model];
      const output = body.max_output_tokens;
      if (!rate || !Number.isFinite(rate.inputUsdPerMillion) || rate.inputUsdPerMillion <= 0
        || !Number.isFinite(rate.outputUsdPerMillion) || rate.outputUsdPerMillion <= 0
        || !Number.isSafeInteger(output) || output! <= 0 || body.tools?.length || body.stream || body.store !== false
        || body.service_tier && body.service_tier !== "default") throw new Error("UNPRICED_REQUEST");
      if (calls >= options.maxCalls) throw new Error("EVALUATION_CALL_CAP");
      // Count the same instructions, schema and input; never estimate Urdu by characters.
      const count = await options.client.responses.inputTokens.count({ model: body.model,
        instructions: body.instructions, input: body.input, text: body.text, tools: body.tools }, requestOptions);
      if (requestOptions.signal.aborted) throw new Error("COUNT_CANCELLED");
      if (!Number.isSafeInteger(count.input_tokens) || count.input_tokens < 0 || count.input_tokens > 272_000) {
        throw new Error("INVALID_OR_LONG_CONTEXT_COUNT");
      }
      const amount = Math.ceil(count.input_tokens * rate.inputUsdPerMillion * 3 + output! * rate.outputUsdPerMillion * 2);
      if (!Number.isSafeInteger(amount) || amount <= 0 || reserved + amount > limit) throw new Error("EVALUATION_DOLLAR_CAP");
      reserved += amount;
      calls++;
      await options.persist({ type: "budget-reservation", model, inputTokens: count.input_tokens,
        maxOutputTokens: output!, reservedMicrousd: amount, totalReservedMicrousd: reserved });
      // An abort during persistence must not start a late chargeable request.
      if (requestOptions.signal.aborted) throw new Error("RESERVATION_CANCELLED");
      return await options.client.responses.create(body, requestOptions);
    } catch (error) {
      const value = (error && typeof error === "object" ? error : {}) as { status?: unknown; code?: unknown; message?: unknown };
      diagnostics.push({ status: typeof value.status === "number" ? value.status : null,
        code: typeof value.code === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value.code) ? value.code : null });
      // Halt this run on transport/count/configuration failure; don't burn the corpus.
      stopped = typeof value.message === "string" && /^EVALUATION_(DOLLAR_CAP|CALL_CAP)$/.test(value.message)
        ? value.message : "EVALUATION_TRANSPORT_STOP";
      throw new Error(stopped);
    } finally { busy = false; }
  };
  return { transport, snapshot: () => ({ maxUsd: options.maxUsd, reservedUsd: reserved / 1_000_000,
    reservedCalls: calls, stopped, diagnostics,
    basis: "Exact counted input at 3x supplied standard input rate plus maximum output at 2x output rate; no refunds; excludes account taxes and unrelated usage." }) };
}
