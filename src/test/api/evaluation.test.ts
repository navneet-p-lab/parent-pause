import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createDiagnosticTarget, evaluateCase, evaluationPlan, loadCases, main, type EvaluationCase } from "../../../scripts/eval-coach";
import { responseFixtures } from "@/test/fixtures/contracts";

const c: EvaluationCase = { id: "TEST", corpus: "held-out", locale: "en", input: "Now what?",
  priorUserMessages: ["Bedtime is hard."], expectedKinds: ["plan"], requirements: ["Use history"] };
describe("synthetic evaluation harness", () => {
  it("loads both corpora with explicit held-out provenance", async () => {
    const cases = await loadCases("planning/safety-cases.json", "planning/safety-held-out.json");
    expect(cases).toHaveLength(41);
    expect(cases.filter((c) => c.corpus === "held-out")).toHaveLength(6);
  });
  it("bounds candidate counts/repeats and computes a conservative call ceiling", () => {
    const risk = { ...c, id: "RISK", expectedKinds: ["escalation" as const], expectedCategories: ["emergency" as const] };
    const plan = evaluationPlan([c, risk], ["model-a", "model-b"], 3);
    expect(plan.runs).toHaveLength(8);
    expect(plan.maxProviderCalls).toBe(48);
    for (const [models, repeats] of [[["a", "a"], 3], [["a"], 2], [["a"], 11], [["bad model"], 3], [[], 3]] as const) {
      expect(() => evaluationPlan([c], [...models], repeats)).toThrow("INVALID_EVALUATION_OPTIONS");
    }
  });
  it("uses sequential actual accepted setup replies and records honest empty human scores", async () => {
    const evaluate = vi.fn().mockResolvedValue({ response: responseFixtures.en.plan, observedRoute: "plan", stages: [], error: null });
    const result = await evaluateCase(c, "test-model", 1, { kind: "pipeline", evaluate });
    expect(evaluate).toHaveBeenCalledTimes(2);
    expect(evaluate.mock.calls[1][0].turns).toEqual([
      { role: "user", text: "Bedtime is hard." }, { role: "assistant", response: responseFixtures.en.plan }, { role: "user", text: "Now what?" },
    ]);
    expect(result.actualKind).toBe("plan");
    expect(Object.values(result.humanScores)).toEqual(Array(7).fill(null));
    expect(result.usageComplete).toBe(false);
  });
  it("does not fabricate history after failed/unaccepted diagnostic setup", async () => {
    const evaluate = vi.fn().mockResolvedValue({ observedRoute: "emergency", stages: [], error: null });
    const result = await evaluateCase(c, "test-model", 1, { kind: "provider-diagnostic", evaluate });
    expect(evaluate).toHaveBeenCalledTimes(1);
    expect(result.error).toBe("SETUP_NOT_ACCEPTED");
    expect(result.actualKind).toBeNull();
    expect(result.limitation).toContain("diagnostic only");
  });
  it("preserves known failed-stage usage without exposing refusal content", async () => {
    const target = createDiagnosticTarget("synthetic-key", async () => ({ status: "incomplete", model: "test-snapshot",
      usage: { input_tokens: 25, output_tokens: 12 }, output: [] }));
    const result = await evaluateCase({ ...c, priorUserMessages: [] }, "requested-alias", 1, target);
    expect(result.observations[0]).toMatchObject({ error: "INCOMPLETE", stages: [],
      failedStageUsage: { inputTokens: 25, outputTokens: 12 },
      failedStage: { operation: "classify", requestedModel: "requested-alias", returnedModel: "test-snapshot" } });
    expect(result.usageComplete).toBe(false);
  });
  it.each([
    { response: { ...responseFixtures.en.plan, locale: "ur" as const } },
    { response: { ...responseFixtures.en.plan, steps: [] } },
  ])("validates setup and final pipeline responses without aborting the batch", async ({ response }) => {
    for (const priorUserMessages of [[], ["Earlier concern"]]) {
      const evaluate = vi.fn().mockResolvedValue({ response, observedRoute: "plan", stages: [], error: null });
      const result = await evaluateCase({ ...c, priorUserMessages }, "test", 1, { kind: "pipeline", evaluate });
      expect(result.error).toBe("INVALID_PIPELINE_RESPONSE");
      expect(result.actualKind).toBeNull();
      expect(evaluate).toHaveBeenCalledTimes(1);
    }
  });
  it("never accepts a response accompanying an error or leaks a target exception", async () => {
    const evaluate = vi.fn().mockResolvedValue({ response: responseFixtures.en.plan, observedRoute: "plan", stages: [], error: "UNAVAILABLE" });
    const result = await evaluateCase(c, "test", 1, { kind: "pipeline", evaluate });
    expect(result.error).toBe("UNAVAILABLE"); expect(result.actualKind).toBeNull();
    expect(evaluate).toHaveBeenCalledTimes(1);
    const failed = await evaluateCase(c, "test", 1, { kind: "pipeline", evaluate: async () => { throw new Error("SECRET"); } });
    expect(failed.error).toBe("EVALUATION_FAILURE");
    expect(JSON.stringify(failed)).not.toContain("SECRET");
  });
  it("requires a response for successful pipeline evaluation", async () => {
    const evaluate = vi.fn().mockResolvedValue({ observedRoute: "plan", stages: [], error: null });
    const result = await evaluateCase({ ...c, priorUserMessages: [] }, "test", 1, { kind: "pipeline", evaluate });
    expect(result.error).toBe("INVALID_PIPELINE_RESPONSE"); expect(result.actualKind).toBeNull();
  });
  it("dry run performs no fetch and needs no configuration/key", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network forbidden"));
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await main(["--models", "candidate-a,candidate-b"]);
    const result = JSON.parse(log.mock.calls[0][0]);
    expect(result.mode).toBe("dry-run"); expect(result.models).toEqual(["candidate-a", "candidate-b"]);
    expect(result.maxProviderCalls).toBeGreaterThan(0); expect(fetch).not.toHaveBeenCalled();
  });
  it.each([{ args: ["--live"] }, { args: ["--live", "--models", "candidate", "--max-calls", "1"] }, { args: ["--max-calls", "5001"] }])("rejects opt-in runs without sufficient explicit call cap/models", async ({ args }) => {
    const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network forbidden"));
    await expect(main(args)).rejects.toThrow(); expect(fetch).not.toHaveBeenCalled();
  });
});
