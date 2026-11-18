import { expect, it } from "vitest";
import { restoreConversation, serializeConversation } from "@/lib/client/conversation-storage";
import { conversationReducer as reduce, initialConversation } from "@/lib/client/conversation-reducer";
import { REQUEST_ID, responseFixtures } from "@/test/fixtures/contracts";

it("round trips mixed-locale accepted turns, archives and exact drafts without transient state", () => {
  let state = reduce(initialConversation(), { type: "draft", text: "  اردو concern  " });
  state = reduce(state, { type: "start", requestId: REQUEST_ID });
  state = reduce(state, { type: "success", requestId: REQUEST_ID, value: { requestId: REQUEST_ID, response: responseFixtures.en.escalation } });
  state = reduce(state, { type: "locale", locale: "ur" });
  state = reduce(state, { type: "draft", text: "Exact draft\n" });
  state = reduce(state, { type: "clear", eventId: "archive" });
  state = reduce(state, { type: "draft", text: "Current draft" });
  const restored = restoreConversation(serializeConversation(state));
  expect(restored).toEqual({ ...state, event: null });
  expect(restored.history[0].turns[1]).toMatchObject({ response: { locale: "en", kind: "escalation" } });
});

it("saves pending input as a retryable draft without inventing a completed exchange", () => {
  let state = reduce(initialConversation(), { type: "draft", text: "Pending concern" });
  state = reduce(state, { type: "start", requestId: REQUEST_ID });
  const restored = restoreConversation(serializeConversation(state));
  expect(restored).toMatchObject({ pending: null, turns: [], draft: "Pending concern", failure: null, event: null });
  expect(serializeConversation(initialConversation())).toBeNull();
});

it.each([
  "{", JSON.stringify({ version: 2 }),
  JSON.stringify({ version: 1, locale: "en", turns: [{ role: "user", text: "Incomplete" }], draft: "", history: [] }),
  JSON.stringify({ version: 1, locale: "en", turns: [], draft: "", history: [{ id: "duplicate", turns: [], draft: "one" }, { id: "duplicate", turns: [], draft: "two" }] }),
  JSON.stringify({ version: 1, locale: "en", turns: [{ role: "system", text: "Untrusted" }], draft: "", history: [] }),
])("rejects malformed, incompatible or incomplete history: %s", (raw) => {
  expect(() => restoreConversation(raw)).toThrow();
});

it("retains all eight complete exchanges and rejects oversized data", () => {
  const state = initialConversation();
  for (let index = 0; index < 8; index++) state.turns.push({ role: "user", text: `Question ${index}` }, { role: "assistant", response: responseFixtures.en.plan });
  expect(restoreConversation(serializeConversation(state)).turns).toHaveLength(16);
  expect(() => restoreConversation(" ".repeat(4_000_001))).toThrow();
});
