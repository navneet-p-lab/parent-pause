import { afterEach, describe, expect, it, vi } from "vitest";
import { CLIENT_DEADLINE_MS, CoachClientError, sendCoach } from "@/lib/client/coach-client";
import { requestFixtures, responseFixtures, REQUEST_ID } from "@/test/fixtures/contracts";
const success = { requestId: REQUEST_ID, response: responseFixtures.en.plan };
const signal = () => new AbortController().signal;
afterEach(() => vi.useRealTimers());
describe("same-origin coach client", () => {
  it("posts plain JSON without caching and validates the complete correlated reply", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(success));
    expect(await sendCoach(requestFixtures.en, signal(), fetcher)).toEqual(success);
    expect(fetcher).toHaveBeenCalledWith("/api/coach", expect.objectContaining({ method: "POST", cache: "no-store", credentials: "same-origin", redirect: "error", body: JSON.stringify(requestFixtures.en) }));
  });
  it.each([
    { status: 200, body: { ...success, requestId: "8fb7f12a-e62b-4b45-a072-7f88d7811e65" } },
    { status: 200, body: { ...success, response: responseFixtures.ur.plan } },
    { status: 500, body: { requestId: REQUEST_ID, code: "UNAVAILABLE", retryable: true } },
    { status: 503, body: { requestId: REQUEST_ID, code: "UNAVAILABLE", retryable: false } },
    { status: 429, body: { requestId: "8fb7f12a-e62b-4b45-a072-7f88d7811e65", code: "RATE_LIMITED", retryable: true } },
  ])("rejects mismatched status/correlation/shape without raw output", async ({ status, body }) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(body, { status }));
    await expect(sendCoach(requestFixtures.en, signal(), fetcher)).rejects.toMatchObject({ message: "UNAVAILABLE", failure: { code: "UNAVAILABLE" } });
  });
  it.each([null, REQUEST_ID])("accepts legitimate failure correlation %s", async (requestId) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ requestId, code: "RATE_LIMITED", retryable: true }, { status: 429 }));
    await expect(sendCoach(requestFixtures.en, signal(), fetcher)).rejects.toMatchObject({ failure: { code: "RATE_LIMITED", retryable: true } });
  });
  it("never exposes HTML, malformed JSON or raw network errors", async () => {
    for (const response of [new Response("SECRET html", { status: 503 }), new Response("SECRET malformed", { headers: { "content-type": "application/json" } })]) {
      await expect(sendCoach(requestFixtures.en, signal(), vi.fn<typeof fetch>().mockResolvedValue(response))).rejects.toThrow("UNAVAILABLE");
    }
    await expect(sendCoach(requestFixtures.en, signal(), vi.fn<typeof fetch>().mockRejectedValue(new Error("SECRET")))).rejects.toThrow("UNAVAILABLE");
  });
  it("cancels an untrusted streaming non-JSON error body", async () => {
    const cancel = vi.fn();
    const response = new Response(new ReadableStream({ cancel }), { status: 503, headers: { "content-type": "text/html" } });
    await expect(sendCoach(requestFixtures.en, signal(), vi.fn<typeof fetch>().mockResolvedValue(response))).rejects.toThrow("UNAVAILABLE");
    expect(cancel).toHaveBeenCalled();
  });
  it("bounds request bytes before sending a large valid transcript", async () => {
    const turns = Array.from({ length: 15 }, (_, n) => n % 2 ? { role: "assistant" as const, response: responseFixtures.en.plan } : { role: "user" as const, text: "😀".repeat(2000) });
    const fetcher = vi.fn<typeof fetch>();
    await expect(sendCoach({ ...requestFixtures.en, turns }, signal(), fetcher)).rejects.toMatchObject({ failure: { code: "PAYLOAD_TOO_LARGE" } });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("times out ignored-signal fetch and cancels stalled response body immediately", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>(() => new Promise(() => {}));
    const first = expect(sendCoach(requestFixtures.en, signal(), fetcher)).rejects.toBeInstanceOf(CoachClientError);
    await vi.advanceTimersByTimeAsync(CLIENT_DEADLINE_MS); await first;
    const cancel = vi.fn(); const controller = new AbortController();
    const response = new Response(new ReadableStream({ cancel }), { headers: { "content-type": "application/json" } });
    const second = expect(sendCoach(requestFixtures.en, controller.signal, vi.fn<typeof fetch>().mockResolvedValue(response))).rejects.toThrow("UNAVAILABLE");
    await vi.advanceTimersByTimeAsync(0); controller.abort("SECRET reason"); await second;
    expect(cancel).toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
});
