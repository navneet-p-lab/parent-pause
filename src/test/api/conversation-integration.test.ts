import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { POST } from "@/app/api/coach/route";
import { sendCoach } from "@/lib/client/coach-client";
import { conversationReducer, initialConversation } from "@/lib/client/conversation-reducer";

afterEach(() => vi.unstubAllEnvs());
it.each(["en", "ur"] as const)("round-trips %s through client, actual POST, service and server fixture", async (locale) => {
  const origin = "http://127.0.0.1:3000";
  vi.stubEnv("APP_ORIGIN", origin); vi.stubEnv("COACH_PROVIDER", "fixtures"); vi.stubEnv("NODE_ENV", "test");
  const bridge: typeof fetch = async (url, init) => POST(new Request(`${origin}${String(url)}`, {
    ...init, headers: { ...init?.headers, Origin: origin },
  }));
  let state = conversationReducer(initialConversation(), { type: "locale", locale });
  for (const text of ["Bedtime feels hard.", "What happened next?"]) {
    const requestId = crypto.randomUUID(); state = conversationReducer(state, { type: "draft", text });
    state = conversationReducer(state, { type: "start", requestId });
    const reply = await sendCoach(state.pending!, new AbortController().signal, bridge);
    expect(reply.response).toMatchObject({ kind: "clarify", locale });
    state = conversationReducer(state, { type: "success", requestId, value: reply });
  }
  expect(state.turns).toHaveLength(4); expect(state.draft).toBe("");
  expect(state.turns[1]).toMatchObject({ role: "assistant", response: { locale } });
});
