import { describe, expect, it, vi } from "vitest";
import type OpenAI from "openai";
import { createBudgetTransport } from "../../../scripts/eval-budget";
import type { ProviderTransport } from "@/lib/server/provider";

function setup(maxUsd = 0.01) {
  const count = vi.fn().mockResolvedValue({ input_tokens: 100 });
  const create = vi.fn().mockResolvedValue({ status: "completed" });
  const persist = vi.fn().mockResolvedValue(undefined);
  const client = { responses: { inputTokens: { count }, create } } as unknown as OpenAI;
  const budget = createBudgetTransport({ client, maxUsd, maxCalls: 3,
    rates: { candidate: { inputUsdPerMillion: 1, outputUsdPerMillion: 5 } }, persist });
  const body: Parameters<ProviderTransport>[0] = { model: "candidate", instructions: "Synthetic",
    input: [{ role: "user", content: "Synthetic" }], max_output_tokens: 100, tools: [], store: false, stream: false };
  const controller = new AbortController();
  const options = { signal: controller.signal, timeout: 1000, maxRetries: 0 as const };
  return { ...budget, count, create, persist, body, options, controller };
}

describe("live evaluation spend guard", () => {
  it("counts complete input and persists maximum charge before generation, without refunding", async () => {
    const s = setup();
    s.create.mockImplementation(async () => {
      expect(s.persist).toHaveBeenCalledWith(expect.objectContaining({ reservedMicrousd: 1300 }));
      return { status: "completed" };
    });
    await s.transport(s.body, s.options);
    expect(s.count).toHaveBeenCalledWith(expect.objectContaining({ instructions: "Synthetic", input: s.body.input }), s.options);
    expect(s.snapshot()).toMatchObject({ reservedUsd: 0.0013, reservedCalls: 1, stopped: null });
  });
  it("refuses the next unaffordable call before inference and remains stopped", async () => {
    const s = setup(0.002);
    await s.transport(s.body, s.options);
    await expect(s.transport(s.body, s.options)).rejects.toThrow("EVALUATION_DOLLAR_CAP");
    await expect(s.transport(s.body, s.options)).rejects.toThrow("EVALUATION_STOPPED");
    expect(s.create).toHaveBeenCalledTimes(1);
    expect(s.snapshot().reservedUsd).toBeLessThanOrEqual(0.002);
  });
  it("retains a failed call's reservation and sanitizes the transport diagnostic", async () => {
    const s = setup();
    s.create.mockRejectedValue(Object.assign(new Error("PRIVATE_KEY_AND_DISCLOSURE"), { status: 429, code: "insufficient_quota" }));
    await expect(s.transport(s.body, s.options)).rejects.toThrow("EVALUATION_TRANSPORT_STOP");
    expect(s.snapshot()).toMatchObject({ reservedUsd: 0.0013, reservedCalls: 1,
      diagnostics: [{ status: 429, code: "insufficient_quota" }] });
    expect(JSON.stringify(s.snapshot())).not.toContain("PRIVATE");
  });
  it.each([NaN, -1, 272001, Number.MAX_SAFE_INTEGER + 1])("rejects invalid or long counts: %s", async (input_tokens) => {
    const s = setup(); s.count.mockResolvedValue({ input_tokens });
    await expect(s.transport(s.body, s.options)).rejects.toThrow();
    expect(s.create).not.toHaveBeenCalled();
  });
  it("halts on unavailable counting instead of estimating tokens", async () => {
    const s = setup(); s.count.mockRejectedValue(new Error("PRIVATE_UPSTREAM"));
    await expect(s.transport(s.body, s.options)).rejects.toThrow();
    expect(s.create).not.toHaveBeenCalled();
    expect(s.snapshot().reservedUsd).toBe(0);
  });
  it("never sends if persistence fails or a deadline expires during counting", async () => {
    const s = setup(); s.persist.mockRejectedValue(new Error("DISK_FAILURE"));
    await expect(s.transport(s.body, s.options)).rejects.toThrow();
    expect(s.create).not.toHaveBeenCalled();
    const t = setup(); t.count.mockImplementation(async () => { t.controller.abort(); return { input_tokens: 100 }; });
    await expect(t.transport(t.body, t.options)).rejects.toThrow();
    expect(t.create).not.toHaveBeenCalled();
  });
  it("bounds actual calls as well as dollars", async () => {
    const s = setup();
    for (let i = 0; i < 3; i++) await s.transport(s.body, s.options);
    await expect(s.transport(s.body, s.options)).rejects.toThrow("EVALUATION_CALL_CAP");
    expect(s.create).toHaveBeenCalledTimes(3);
  });
  it("rejects unpriced models, tools and output without a finite bound", async () => {
    for (const change of [{ model: "unknown" }, { max_output_tokens: undefined }, { stream: true as const }]) {
      const s = setup();
      await expect(s.transport({ ...s.body, ...change } as typeof s.body, s.options)).rejects.toThrow();
      expect(s.count).not.toHaveBeenCalled(); expect(s.create).not.toHaveBeenCalled();
    }
  });
  it.each([0, -1, Infinity, NaN, 1e20])("rejects invalid spend limits: %s", (limit) => {
    expect(() => setup(limit)).toThrow("INVALID_SPEND_LIMIT");
  });
});
