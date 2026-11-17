import { describe, expect, it } from "vitest";
import { conversationReducer as reduce, draftProblem, initialConversation } from "@/lib/client/conversation-reducer";
import { responseFixtures, REQUEST_ID } from "@/test/fixtures/contracts";

const pending = () => reduce(reduce(initialConversation(), { type: "draft", text: "Bedtime is hard." }), { type: "start", requestId: REQUEST_ID });
describe("memory-only conversation reducer", () => {
  it.each(["", " \u0085\uFEFF"])("rejects blank drafts %j", (text) => expect(draftProblem(text)).toBe("empty"));
  it("counts Unicode code points without truncating or normalizing", () => {
    expect(draftProblem("😀".repeat(2000))).toBeNull(); expect(draftProblem("😀".repeat(2001))).toBe("overlong");
    const state = reduce(initialConversation(), { type: "draft", text: "  اردو\u200c  " });
    expect(reduce(state, { type: "start", requestId: REQUEST_ID }).pending?.turns[0]).toEqual({ role: "user", text: "  اردو\u200c  " });
  });
  it("keeps accepted history separate, freezes draft while pending and rejects duplicate sends", () => {
    const state = pending(); expect(state.turns).toEqual([]); expect(state.draft).toBe("Bedtime is hard.");
    expect(reduce(state, { type: "start", requestId: crypto.randomUUID() })).toBe(state);
    expect(reduce(state, { type: "draft", text: "lost" })).toBe(state);
  });
  it("retains draft on failure and retry includes the parent exactly once", () => {
    const failed = reduce(pending(), { type: "failure", requestId: REQUEST_ID, failure: { requestId: null, code: "RATE_LIMITED", retryable: true } });
    expect(failed.draft).toBe("Bedtime is hard."); expect(failed.turns).toEqual([]);
    const retry = reduce(failed, { type: "start", requestId: crypto.randomUUID() });
    expect(retry.pending?.turns).toHaveLength(1);
    expect(reduce(retry, { type: "success", requestId: REQUEST_ID, value: { requestId: REQUEST_ID, response: responseFixtures.en.plan } })).toBe(retry);
  });
  it.each(["cancel", "locale", "clear"] as const)("%s discards old replies and errors", (type) => {
    const start = pending();
    const state = type === "cancel" ? reduce(start, { type, requestId: REQUEST_ID }) : type === "locale" ? reduce(start, { type, locale: "ur" }) : reduce(start, { type, eventId: "clear" });
    expect(state.pending).toBeNull();
    expect(reduce(state, { type: "success", requestId: REQUEST_ID, value: { requestId: REQUEST_ID, response: responseFixtures.en.plan } })).toBe(state);
    expect(reduce(state, { type: "failure", requestId: REQUEST_ID, failure: { requestId: REQUEST_ID, code: "UNAVAILABLE", retryable: true } })).toBe(state);
    expect(state.draft).toBe(type === "clear" ? "" : "Bedtime is hard.");
  });
  it("validates final reply locale and request ID", () => {
    const state = pending();
    for (const value of [{ requestId: REQUEST_ID, response: responseFixtures.ur.plan }, { requestId: crypto.randomUUID(), response: responseFixtures.en.plan }]) {
      const failed = reduce(state, { type: "success", requestId: REQUEST_ID, value });
      expect(failed.turns).toEqual([]); expect(failed.failure?.code).toBe("UNAVAILABLE"); expect(failed.draft).toBe(state.draft);
    }
  });
  it("retains historical locales and stops after eight exchanges without truncation", () => {
    let state = initialConversation();
    for (let n = 0; n < 8; n++) {
      const id = crypto.randomUUID();
      const locale = n % 2 ? "ur" : "en";
      state = reduce(state, { type: "locale", locale }); state = reduce(state, { type: "draft", text: `Concern ${n}` });
      state = reduce(state, { type: "start", requestId: id }); expect(state.pending?.turns).toHaveLength(2 * n + 1);
      state = reduce(state, { type: "success", requestId: id, value: { requestId: id, response: responseFixtures[locale].plan } });
    }
    expect(state.turns).toHaveLength(16); expect(state.turns[1]).toMatchObject({ response: { locale: "en" } });
    expect(state.turns[3]).toMatchObject({ response: { locale: "ur" } }); expect(state.draft).toBe("");
    expect(reduce(state, { type: "start", requestId: crypto.randomUUID() })).toBe(state);
    expect(initialConversation()).toMatchObject({ draft: "", turns: [], locale: "en" });
  });
});
