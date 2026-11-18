import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createCoachHandler } from "@/lib/server/coach-handler";
import { createCoachService } from "@/lib/server/coach-service";
import { createProviderSession, type ProviderTransport } from "@/lib/server/provider";
import { CoachClientError, sendCoach } from "@/lib/client/coach-client";
import { conversationReducer, initialConversation, type ConversationState } from "@/lib/client/conversation-reducer";
import { responseFixtures } from "@/test/fixtures/contracts";

afterEach(() => vi.unstubAllEnvs());
const origin = "http://127.0.0.1:3000";
const wire = (value: unknown) => ({ status: "completed", output: [{ type: "message", role: "assistant", status: "completed",
  content: [{ type: "output_text", text: JSON.stringify(value) }] }] });

it.each(["en", "ur"] as const)("retains %s follow-up context across a review block and a successful single-detail retry", async (locale) => {
  const first = responseFixtures[locale].plan;
  const compound = { ...first, checkIn: { kind: "question" as const, text: locale === "en"
    ? "How old is your child, and when do they usually need to wake?" : "آپ کے بچے کی عمر کیا ہے اور اسے کب جاگنا ہوتا ہے؟" } };
  const single = { ...first, checkIn: { kind: "question" as const, text: locale === "en" ? "How old is your child?" : "آپ کے بچے کی عمر کیا ہے؟" } };
  const transport = vi.fn<ProviderTransport>();
  for (const [candidate, decision] of [[compound, "block"], [single, "allow"]] as const) {
    transport.mockResolvedValueOnce(wire({ category: "routine" }))
      .mockResolvedValueOnce(wire({ response: candidate }))
      .mockResolvedValueOnce(wire({ decision, category: null }));
  }
  const service = createCoachService((request, signal) => createProviderSession(request, {
    signal, transport, config: { mode: "openai", apiKey: "synthetic", model: "synthetic" },
  }));
  const handler = createCoachHandler({ service, env: () => ({ APP_ORIGIN: origin }) });
  const bridge: typeof fetch = async (url, init) => handler(new Request(`${origin}${url}`, {
    ...init, headers: { ...init?.headers, Origin: origin },
  }));
  const history = [{ role: "user" as const, text: "Bedtime feels difficult" }, { role: "assistant" as const, response: first }];
  const draft = "What is a good time for bedtime?";
  let state: ConversationState = { ...initialConversation(), locale, turns: history, draft };
  const blockedId = crypto.randomUUID();
  state = conversationReducer(state, { type: "start", requestId: blockedId });
  const blocked = await sendCoach(state.pending!, new AbortController().signal, bridge).catch((error: unknown) => error);
  expect(blocked).toBeInstanceOf(CoachClientError);
  const error = blocked as CoachClientError;
  expect(error.failure.code).toBe("UNAVAILABLE");
  state = conversationReducer(state, { type: "failure", requestId: blockedId, failure: error.failure });
  expect(state.turns).toEqual(history); expect(state.draft).toBe(draft);
  // A rejected candidate is never appended to the next request's trusted transcript.
  const retryId = crypto.randomUUID();
  state = conversationReducer(state, { type: "start", requestId: retryId });
  const reply = await sendCoach(state.pending!, new AbortController().signal, bridge);
  state = conversationReducer(state, { type: "success", requestId: retryId, value: reply });
  expect(state.turns).toEqual([...history, { role: "user", text: draft }, { role: "assistant", response: single }]);
  expect(state.draft).toBe(""); expect(state.failure).toBeNull();
  expect(transport).toHaveBeenCalledTimes(6);
  // Classify, generate and review all receive the same complete conversation.
  for (const [body] of transport.mock.calls) {
    const input = body.input as { role: string; content: string }[];
    expect(JSON.parse(input[0].content).turns).toEqual([...history, { role: "user", text: draft }]);
  }
});

it.each(["development", "production"])("reports review blocks without conversation data in %s", async (mode) => {
  vi.stubEnv("NODE_ENV", mode);
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const service = createCoachService(() => ({
    classify: async () => ({ value: { category: "routine" } }),
    generate: async () => ({ value: responseFixtures.en.plan }),
    review: async () => ({ value: { decision: "block", category: null } }),
  }));
  expect(await service({ requestId: crypto.randomUUID(), locale: "en", turns: [{ role: "user", text: "SECRET synthetic parent text" }] }))
    .toMatchObject({ code: "UNAVAILABLE" });
  if (mode === "development") expect(warn.mock.calls).toEqual([["[ParentPause service failure]", { stage: "review", reason: "POLICY_UNAVAILABLE" }]]);
  else expect(warn).not.toHaveBeenCalled();
  expect(JSON.stringify(warn.mock.calls)).not.toContain("SECRET");
});
