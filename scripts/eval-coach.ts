import { randomUUID } from "node:crypto";
import { mkdir, open, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { z } from "zod";
import { coachRequestSchema, coachResponseSchema, CONTRACT_REVISION, type CoachRequest, type CoachResponse } from "../src/lib/contracts";
import { readProviderConfig } from "../src/lib/server/config";
import { createProviderSession, ProviderError, PROVIDER_REVISION, type ProviderResult, type ProviderTransport, type Usage } from "../src/lib/server/provider";
import { CLASSIFY_PROMPT_REVISION } from "../src/lib/server/prompts/classify";
import { COACH_PROMPT_REVISION } from "../src/lib/server/prompts/coach";
import { REVIEW_PROMPT_REVISION } from "../src/lib/server/prompts/review";
import { SAFETY_POLICY_REVISION } from "../src/lib/server/safety/policy";

const caseSchema = z.strictObject({
  id: z.string().min(1).max(100), locale: z.enum(["en", "ur"]),
  input: z.string(), priorUserMessages: z.array(z.string()).max(7),
  expectedKinds: z.array(z.enum(["plan", "clarify", "boundary", "escalation", "pause_offer", "paused", "summary"])).min(1),
  expectedCategories: z.array(z.enum(["emergency", "abuse", "self_harm"])).optional(),
  requirements: z.array(z.string()),
});
const corpusSchema = z.strictObject({ version: z.number().int(), status: z.string(), cases: z.array(caseSchema).min(1).max(200) });
export type EvaluationCase = z.infer<typeof caseSchema> & { corpus: "seed" | "held-out" };
export type Observation = {
  /** Accepted response only. A diagnostic candidate is not an accepted response. */
  response?: CoachResponse;
  observedRoute: string | null;
  stages: ProviderResult<unknown>[];
  error: string | null;
  failedStageUsage?: Usage | null;
  failedStage?: ProviderError["metadata"];
  /** Pipeline can accept authored fallback while recording a failed provider stage. */
  stageFailures?: { code: string; usage: Usage | null; metadata?: ProviderError["metadata"] }[];
  providerStageAttempts?: number;
};
export type EvaluationTarget = {
  kind: "provider-diagnostic" | "pipeline";
  /** T09 injects the integrated service here; it must obey <=3 provider calls/turn. */
  evaluate: (request: CoachRequest, model: string) => Promise<Observation>;
};

export async function loadCases(seedPath: string, heldOutPath?: string): Promise<EvaluationCase[]> {
  const cases: EvaluationCase[] = [];
  for (const [path, corpus] of [[seedPath, "seed"], [heldOutPath, "held-out"]] as const) {
    if (!path) continue;
    const parsed = corpusSchema.parse(JSON.parse(await readFile(path, "utf8")));
    cases.push(...parsed.cases.map((c) => ({ ...c, corpus })));
  }
  if (new Set(cases.map((c) => c.id)).size !== cases.length) throw new Error("DUPLICATE_CASE_ID");
  for (const c of cases) {
    // Validate all setup/latest messages before any paid work, without inventing assistant turns.
    for (const text of [...c.priorUserMessages, c.input]) {
      coachRequestSchema.parse({ requestId: randomUUID(), locale: c.locale, turns: [{ role: "user", text }] });
    }
  }
  return cases;
}

export function evaluationPlan(cases: EvaluationCase[], models: string[], riskRepeats: number) {
  if (!models.length || models.length > 5 || new Set(models).size !== models.length
    || models.some((m) => !m || m.length > 200 || /\s/.test(m))
    || !Number.isInteger(riskRepeats) || riskRepeats < 3 || riskRepeats > 10) throw new Error("INVALID_EVALUATION_OPTIONS");
  const runs = cases.flatMap((c) => models.flatMap((model) =>
    Array.from({ length: c.expectedKinds.includes("escalation") ? riskRepeats : 1 }, (_, i) => ({ c, model, run: i + 1 }))));
  const maxProviderCalls = runs.reduce((sum, { c }) => sum + 3 * (c.priorUserMessages.length + 1), 0);
  return { runs, maxProviderCalls };
}

export const revisions = {
  contract: CONTRACT_REVISION, provider: PROVIDER_REVISION, policy: SAFETY_POLICY_REVISION,
  classify: CLASSIFY_PROMPT_REVISION, coach: COACH_PROMPT_REVISION, review: REVIEW_PROMPT_REVISION,
};

/** Sequential setup uses actual accepted responses. Failed/unaccepted setup stops the case. */
export async function evaluateCase(c: EvaluationCase, model: string, run: number, target: EvaluationTarget) {
  const turns: CoachRequest["turns"] = [];
  const observations: Observation[] = [];
  const started = Date.now();
  let final: Observation | undefined;
  let error: string | null = null;
  for (const [index, text] of [...c.priorUserMessages, c.input].entries()) {
    turns.push({ role: "user", text });
    const request = coachRequestSchema.parse({ requestId: randomUUID(), locale: c.locale, turns });
    let observation: Observation;
    try { observation = await target.evaluate(request, model); }
    catch { observation = { observedRoute: null, stages: [], error: "EVALUATION_FAILURE" }; }
    if (observation.error) {
      observations.push({ ...observation, response: undefined });
      error = observation.error;
      break;
    }
    if (target.kind === "pipeline" && observation.response === undefined) {
      observations.push({ ...observation, error: "INVALID_PIPELINE_RESPONSE" });
      error = "INVALID_PIPELINE_RESPONSE";
      break;
    }
    if (observation.response !== undefined) {
      const parsed = coachResponseSchema.safeParse(observation.response);
      if (!parsed.success || parsed.data.locale !== c.locale) {
        observations.push({ ...observation, response: undefined, error: "INVALID_PIPELINE_RESPONSE" });
        error = "INVALID_PIPELINE_RESPONSE";
        break;
      }
      observation = { ...observation, response: parsed.data };
    }
    observations.push(observation);
    if (index < c.priorUserMessages.length) {
      // Direct diagnostics never claim approved setup replies, even after model review.
      if (!observation.response) { error = "SETUP_NOT_ACCEPTED"; break; }
      turns.push({ role: "assistant", response: observation.response });
    } else { final = observation; error = observation.error; }
  }
  const stages = observations.flatMap((o) => o.stages);
  return {
    caseId: c.id, corpus: c.corpus, locale: c.locale, run, requestedModel: model,
    target: target.kind, revisions, timestamp: new Date().toISOString(),
    expectedKinds: c.expectedKinds, expectedCategories: c.expectedCategories ?? null, requirements: c.requirements,
    actualKind: final?.response?.kind ?? null,
    actualCategory: final?.response?.kind === "escalation" ? final.response.category : null,
    observedRoute: final?.observedRoute ?? null, error,
    latencyMs: Date.now() - started,
    // Missing usage remains unknown; never silently report zero as measured usage.
    usageComplete: stages.length > 0 && stages.every((s) => s.usage !== null)
      && observations.every((o) => (o.stageFailures ?? []).every((failure) => failure.usage !== null)) && !error,
    stages, observations,
    humanScores: { understandsConcern: null, doableAction: null, noShame: null, brief: null,
      oneCheckIn: null, naturalRequestedLanguage: null, safetyBoundary: null },
    humanReviewer: null,
    limitation: target.kind === "provider-diagnostic"
      ? "Direct provider diagnostic only; no T06 policy/endpoint or accepted coaching. Follow-up setup requires the integrated pipeline."
      : "Synthetic integrated pipeline evaluation; native and safeguarding review still required.",
  };
}

export function createDiagnosticTarget(apiKey: string, transport?: ProviderTransport): EvaluationTarget {
  return {
    kind: "provider-diagnostic",
    evaluate: async (request, model) => {
      const stages: ProviderResult<unknown>[] = [];
      let observedRoute: string | null = null;
      try {
        const session = createProviderSession(request, { config: { mode: "openai", apiKey, model }, transport });
        const classified = await session.classify(); stages.push(classified);
        observedRoute = classified.value.category;
        if (classified.value.category === "routine" || classified.value.category === "unclear") {
          const candidate = await session.generate(classified.value.category === "routine" ? "plan" : "clarify"); stages.push(candidate);
          const review = await session.review(candidate.value); stages.push(review);
          observedRoute = review.value.decision === "escalate" ? review.value.category : review.value.decision;
        }
        return { observedRoute, stages, error: null };
      } catch (error) {
        return { observedRoute, stages, error: error instanceof ProviderError ? error.code : "EVALUATION_FAILURE",
          failedStageUsage: error instanceof ProviderError ? error.usage : null,
          failedStage: error instanceof ProviderError ? error.metadata : undefined };
      }
    },
  };
}

export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: {
    cases: { type: "string", default: "planning/safety-cases.json" },
    "held-out": { type: "string", default: "planning/safety-held-out.json" },
    models: { type: "string" }, "risk-repeats": { type: "string", default: "3" },
    "max-calls": { type: "string", default: "0" }, live: { type: "boolean", default: false }, out: { type: "string" },
  } });
  const cases = await loadCases(values.cases!, values["held-out"]);
  const models = (values.models ?? process.env.OPENAI_MODEL ?? "UNSELECTED").split(",");
  const plan = evaluationPlan(cases, models, Number(values["risk-repeats"]));
  const maxCalls = Number(values["max-calls"]);
  if (!Number.isInteger(maxCalls) || maxCalls < 0 || maxCalls > 5_000) throw new Error("INVALID_CALL_CAP");
  if (!values.live) {
    console.log(JSON.stringify({ mode: "dry-run", cases: cases.length, runs: plan.runs.length, models,
      maxProviderCalls: plan.maxProviderCalls, revisions,
      note: "No network or model results. Live requires --live, explicit models, key, and sufficient --max-calls; diagnostic only." }));
    return;
  }
  if (!values.models || models.includes("UNSELECTED") || plan.maxProviderCalls > maxCalls) throw new Error("LIVE_CALL_CAP_OR_MODELS_REQUIRED");
  const config = readProviderConfig({ ...process.env, COACH_PROVIDER: "openai", OPENAI_MODEL: models[0] });
  if (config.mode !== "openai") throw new Error("CONFIGURATION_ERROR");
  const path = resolve(values.out ?? `evaluation-results/diagnostic-${Date.now()}.jsonl`);
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  // Exclusive creation: do not overwrite another result or follow an existing symlink.
  const file = await open(path, "wx", 0o600);
  let failures = 0;
  try {
    for (const { c, model, run } of plan.runs) {
      const result = await evaluateCase(c, model, run, createDiagnosticTarget(config.apiKey));
      if (result.error) failures++;
      await file.write(`${JSON.stringify(result)}\n`);
    }
  } finally { await file.close(); }
  console.log(JSON.stringify({ mode: "provider-diagnostic", runs: plan.runs.length, failures, artifact: path, releaseGate: "pending T09" }));
  if (failures) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => { console.error("EVALUATION_FAILED: check options/configuration; no raw provider output logged."); process.exitCode = 1; });
}
