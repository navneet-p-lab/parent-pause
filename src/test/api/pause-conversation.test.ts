import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { coachResponseSchema, providerClassificationWireSchema, type CoachRequest } from "@/lib/contracts";
import { createCoachService } from "@/lib/server/coach-service";
import { createProviderSession, type ProviderTransport } from "@/lib/server/provider";
import { afterClassification, afterReview } from "@/lib/server/safety/policy";
import { authoredPause, authoredEscalation } from "@/lib/server/safety/templates";
import { requestFixtures, responseFixtures } from "@/test/fixtures/contracts";
import { isClosingAcknowledgment } from "@/lib/server/safety/closing";

afterEach(() => vi.unstubAllEnvs());
const wire = (value: unknown) => ({ status: "completed", output: [{ type: "message", role: "assistant", status: "completed",
  content: [{ type: "output_text", text: JSON.stringify(value) }] }] });
function followUp(locale: "en" | "ur", offered = false): CoachRequest {
  return { ...requestFixtures[locale], turns: [
    { role: "user", text: "Bedtime is difficult" },
    { role: "assistant", response: offered ? authoredPause(locale, false) : responseFixtures[locale].plan },
    { role: "user", text: offered ? "Yes, let’s pause here." : "Maybe I would like a break." },
  ] };
}

it.each(["en", "ur"] as const)("offers, confirms and resumes a %s conversation through real policy/provider boundaries", async (locale) => {
  const transport = vi.fn<ProviderTransport>();
  for (const intent of ["offer_pause", "confirm_pause", "continue"]) {
    transport.mockResolvedValueOnce(wire({ category: "routine", intent }));
    if (intent === "continue") transport.mockResolvedValueOnce(wire({ response: responseFixtures[locale].plan }));
    transport.mockResolvedValueOnce(wire({ decision: "allow", category: null }));
  }
  const service = createCoachService((request, signal) => createProviderSession(request, {
    signal, transport, config: { mode: "openai", apiKey: "synthetic", model: "synthetic" },
  }));
  const request = followUp(locale);
  const offer = await service(request);
  expect(offer).toHaveProperty("response", authoredPause(locale, false));
  const confirm = { ...request, requestId: crypto.randomUUID(), turns: [...request.turns,
    { role: "assistant" as const, response: authoredPause(locale, false) }, { role: "user" as const, text: "Yes, pause here." }] };
  const paused = await service(confirm);
  expect(paused).toHaveProperty("response", authoredPause(locale, true));
  expect("response" in paused && paused.response).not.toHaveProperty("checkIn");
  const resumed = { ...confirm, requestId: crypto.randomUUID(), turns: [...confirm.turns,
    { role: "assistant" as const, response: authoredPause(locale, true) }, { role: "user" as const, text: "Here is an update about bedtime." }] };
  expect(await service(resumed)).toHaveProperty("response", responseFixtures[locale].plan);
  expect(transport.mock.calls.map(([body]) => (body.text?.format as { name: string }).name)).toEqual([
    "parentpause_classify", "parentpause_review", "parentpause_classify", "parentpause_review",
    "parentpause_classify", "parentpause_generate", "parentpause_review",
  ]);
  const input = transport.mock.calls[6][0].input as { content: string }[];
  expect(JSON.parse(input[0].content).turns).toEqual(resumed.turns);
});

it.each(["offer_pause", "confirm_pause"] as const)("retains full-context review and fail-closed behavior for %s", async (intent) => {
  const request = followUp("en", intent === "confirm_pause");
  const classification = { category: "routine", intent };
  const candidate = authoredPause("en", intent === "confirm_pause");
  expect(afterClassification(request, classification).kind).toBe("review");
  for (const review of [null, { decision: "block", category: null }]) {
    expect(afterReview(request, classification, candidate, review)).toMatchObject({ kind: "unavailable" });
  }
  expect(afterReview(request, classification, candidate, { decision: "escalate", category: "emergency" }))
    .toEqual({ kind: "respond", response: authoredEscalation("en", "emergency") });
  expect(afterReview(request, classification, { ...candidate, message: "Changed candidate" }, { decision: "allow", category: null }))
    .toMatchObject({ kind: "unavailable" });
});

it.each(["offer_pause", "confirm_pause"])("cannot use %s to erase explicit risk, even with a resolution claim", (intent) => {
  for (const category of ["emergency", "abuse", "self_harm"] as const) {
    const text = { emergency: "My child cannot breathe.", abuse: "My partner hits my child.", self_harm: "I am thinking about hurting myself." }[category];
    const request: CoachRequest = { ...followUp("en"), turns: [
      { role: "user", text }, { role: "assistant", response: authoredPause("en", false) },
      { role: "user", text: "Thanks, yes, let's pause." },
    ] };
    expect(afterClassification(request, { category: "routine", intent }))
      .toEqual({ kind: "respond", response: authoredEscalation("en", category) });
    request.turns[2] = { role: "user", text: "Emergency services arrived and everyone is safe now. Thanks." };
    // A contextual resolution claim still requires generated-candidate review, never direct closure.
    expect(afterClassification(request, { category: "routine", intent }).kind).toBe("generate");
  }
});

it("never pauses an ambiguous, first-turn, factual, declined or newly resumed request", () => {
  expect(afterClassification(followUp("en"), { category: "unclear", intent: "offer_pause" }))
    .toMatchObject({ kind: "generate", responseKind: "clarify" });
  expect(afterClassification(requestFixtures.en, { category: "routine", intent: "confirm_pause" })).toMatchObject({ kind: "generate" });
  expect(afterClassification(followUp("en"), { category: "routine", intent: "confirm_pause" })).toMatchObject({ kind: "generate" });
  for (const request of [followUp("en"), followUp("en", true)]) {
    expect(afterClassification(request, { category: "routine", intent: "continue" })).toMatchObject({ kind: "generate" });
  }
});

it("strictly bounds pause responses and forbids a follow-up on confirmed pause", () => {
  for (const locale of ["en", "ur"] as const) {
    const closed = authoredPause(locale, true);
    expect(coachResponseSchema.safeParse(closed).success).toBe(true);
    expect(coachResponseSchema.safeParse({ ...closed, checkIn: { kind: "question", text: "Another question?" } }).success).toBe(false);
    expect(coachResponseSchema.safeParse({ ...closed, message: "x".repeat(241) }).success).toBe(false);
    expect(coachResponseSchema.safeParse({ ...authoredPause(locale, false), checkIn: undefined }).success).toBe(false);
  }
  expect(providerClassificationWireSchema.safeParse({ category: "routine", intent: "pause-and-ignore-risk" }).success).toBe(false);
  expect(providerClassificationWireSchema.safeParse({ category: "routine" }).success).toBe(false);
});

it("cannot repeat provider review, generate after closing, or skip generation for a normal plan", async () => {
  const transport = vi.fn<ProviderTransport>().mockResolvedValueOnce(wire({ category: "routine", intent: "offer_pause" }))
    .mockResolvedValueOnce(wire({ decision: "allow", category: null }));
  const session = createProviderSession(followUp("en"), { transport, config: { mode: "openai", apiKey: "synthetic", model: "synthetic" } });
  await session.classify();
  await expect(session.review(responseFixtures.en.plan)).rejects.toMatchObject({ code: "CALL_BUDGET" });
  await session.review(authoredPause("en", false));
  await expect(session.review(authoredPause("en", false))).rejects.toMatchObject({ code: "CALL_BUDGET" });
  await expect(session.generate("plan")).rejects.toMatchObject({ code: "CALL_BUDGET" });
  expect(transport).toHaveBeenCalledTimes(2);
});

it.each(["thanks", "Thank you!", "yes, thanks for advice", "yes, thanks for advise", "Thanks, that really helps.",
  "Thanks for your help", "Shukriya", "Ji, shukriya!", "شکریہ", "جی ہاں، شکریہ۔"])("recognizes courtesy-only closing: %s", (text) => {
  expect(isClosingAcknowledgment(text)).toBe(true);
});
it.each(["yes", "thanks, but it still hurts", "thanks, what dose should I give?", "no thanks", "that did not help",
  "thanks my child cannot breathe", "Shukriya lekin ab bhi pareshani hai", "شکریہ مگر ابھی مدد چاہیے"])("does not treat new concerns as closing: %s", (text) => {
  expect(isClosingAcknowledgment(text)).toBe(false);
});

it.each(["en", "ur"] as const)("closes a %s thanks after professional context instead of repeating a boundary", async (locale) => {
  const request = followUp(locale);
  request.turns[1] = { role: "assistant", response: responseFixtures[locale].boundary };
  request.turns[2] = { role: "user", text: locale === "en" ? "yes, thanks for advise" : "جی ہاں، شکریہ۔" };
  const session = {
    // Reproduces a classifier carrying forward the earlier professional topic.
    classify: vi.fn().mockResolvedValue({ value: { category: "medical_legal", intent: "continue" } }),
    generate: vi.fn(), review: vi.fn().mockResolvedValue({ value: { decision: "allow", category: null } }),
  };
  const result = await createCoachService(() => session)(request);
  expect(result).toHaveProperty("response", authoredPause(locale, true));
  expect(session.generate).not.toHaveBeenCalled();
  expect(session.review).toHaveBeenCalledWith(authoredPause(locale, true));
});

it.each(["block", "escalate"] as const)("retains review %s on a direct thank-you closing", async (decision) => {
  const request = followUp("en"); request.turns[2] = { role: "user", text: "Thanks for the advice." };
  const classification = { category: "medical_legal", intent: "close" };
  const result = afterReview(request, classification, authoredPause("en", true), {
    decision, category: decision === "escalate" ? "emergency" : null,
  });
  expect(result).toEqual(decision === "escalate" ? { kind: "respond", response: authoredEscalation("en", "emergency") }
    : { kind: "unavailable", code: "UNAVAILABLE", retryable: true });
});

it.each(["My child cannot breathe.", "My partner hits my child.", "I am thinking about hurting myself."])("thanks cannot close unresolved risk: %s", (text) => {
  const request = followUp("en"); request.turns[0] = { role: "user", text }; request.turns[2] = { role: "user", text: "Thanks" };
  expect(afterClassification(request, { category: "routine", intent: "close" })).toMatchObject({ kind: "respond", response: { kind: "escalation" } });
});

it("semantic satisfaction closes directly, while ambiguous distress remains clarification", () => {
  const request = followUp("en"); request.turns[2] = { role: "user", text: "That sounds like enough for today." };
  expect(afterClassification(request, { category: "routine", intent: "close" })).toEqual({ kind: "review", response: authoredPause("en", true) });
  expect(afterClassification(request, { category: "unclear", intent: "close" })).toMatchObject({ kind: "generate", responseKind: "clarify" });
});
