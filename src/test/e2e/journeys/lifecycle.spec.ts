import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import type { CoachRequest, Success } from "../../../lib/contracts";
import { en } from "../../../lib/i18n/en";
import { ur } from "../../../lib/i18n/ur";

const endpoint = (url: string) => new URL(url).pathname === "/api/coach";
const textarea = (page: Page) => page.getByRole("textbox");

async function scenario(page: Page, value: string, client = randomUUID()) {
  await page.setExtraHTTPHeaders({ "x-e2e-scenario": value, "x-e2e-client": client });
  return client;
}

async function open(page: Page, value = "plan") {
  const client = await scenario(page, value);
  await page.goto("/");
  await expect(page.getByText(en.demoNotice, { exact: true })).toBeVisible();
  await expect(textarea(page)).toBeEditable();
  return client;
}

async function send(page: Page, text: string, button = en.send) {
  // Retrying an unchanged draft must preserve the retry state until Send.
  if (await textarea(page).inputValue() !== text) await textarea(page).fill(text);
  const response = page.waitForResponse((reply) => endpoint(reply.url()) && reply.request().method() === "POST");
  await page.getByRole("button", { name: button, exact: true }).click();
  return response;
}

async function beginSlow(page: Page, text: string) {
  await scenario(page, "slow");
  await textarea(page).fill(text);
  const request = page.waitForRequest((value) => endpoint(value.url()) && value.method() === "POST");
  await page.getByRole("button", { name: en.send, exact: true }).click();
  await request;
  await expect(page.getByRole("button", { name: en.cancel, exact: true })).toBeVisible();
  await expect(textarea(page)).toHaveAttribute("readonly", "");
}

async function pastDelayedCompletion(page: Page) {
  // Provider work ignores abort for 1500ms, while the real handler/client cancel
  // transport. Observe beyond completion for UI stability. Component regressions
  // separately deliver ignored-abort stale client results.
  await page.waitForTimeout(1800);
  await expect(page.getByText("DELAYED_CANDIDATE_MARKER", { exact: true })).toHaveCount(0);
}

test("everyday and follow-up use the real endpoint and accepted chronological context", async ({ page }) => {
  await open(page);
  const firstText = "Bedtime is difficult. سونے کا وقت مشکل ہے۔";
  const first = await send(page, firstText);
  expect(first.status()).toBe(200);
  expect(first.headers()["cache-control"]).toBe("no-store");
  const firstInput = first.request().postDataJSON() as CoachRequest;
  const firstReply = await first.json() as Success;
  expect(firstInput).toMatchObject({ locale: "en", turns: [{ role: "user", text: firstText }] });
  expect(firstReply).toMatchObject({ requestId: firstInput.requestId, response: { kind: "plan", locale: "en" } });
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article").getByRole("listitem")).toHaveCount(2);
  await expect(page.getByRole("article").getByRole("group", { name: en.response.checkInHeading })).toHaveCount(1);
  await expect(textarea(page)).toHaveValue("");
  await expect(textarea(page)).toBeFocused();

  const followUp = "We tried a quiet story at 8:30.";
  const second = await send(page, followUp);
  expect(second.status()).toBe(200);
  const secondInput = second.request().postDataJSON() as CoachRequest;
  expect(secondInput.requestId).not.toBe(firstInput.requestId);
  expect(secondInput.turns).toEqual([
    { role: "user", text: firstText },
    { role: "assistant", response: firstReply.response },
    { role: "user", text: followUp },
  ]);
  await expect(page.getByRole("article")).toHaveCount(2);
  await expect(page.getByRole("group", { name: en.response.user, exact: true })).toHaveCount(2);
  await expect(page.getByRole("textbox", { name: en.followUpLabel })).toBeFocused();
  await expect(page.locator('[aria-live="polite"][role="status"]')).toHaveText(en.replyReady);
  await textarea(page).fill("A new unsent thought");
  await expect(page.locator('[aria-live][role="status"]')).toHaveCount(0);
});

test("retry retains draft, uses a fresh request ID and never duplicates failed turns", async ({ page }) => {
  await open(page, "retry-once");
  const text = "We disagree about screen time.";
  const failed = await send(page, text);
  expect(failed.status()).toBe(503);
  expect(await failed.json()).toMatchObject({ code: "UNAVAILABLE", retryable: true });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(en.response.errors.UNAVAILABLE);
  await expect(textarea(page)).toHaveValue(text);
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: en.emergencyLabel })).toBeVisible();
  const retried = await send(page, text, en.retry);
  expect(retried.status()).toBe(200);
  expect(retried.request().postDataJSON().requestId).not.toBe(failed.request().postDataJSON().requestId);
  expect(retried.request().postDataJSON().turns).toEqual([{ role: "user", text }]);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("group", { name: en.response.user, exact: true })).toHaveCount(1);
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  await expect(textarea(page)).toBeFocused();
  await expect(textarea(page)).toHaveValue("");
});

test("a real server deadline preserves the draft and supports manual retry", async ({ page }) => {
  test.setTimeout(45_000);
  await open(page, "timeout");
  const text = "The evening routine feels tiring.";
  const started = Date.now();
  const timedOut = await send(page, text);
  expect(Date.now() - started).toBeGreaterThanOrEqual(19_000);
  expect(Date.now() - started).toBeLessThan(25_000);
  expect(timedOut.status()).toBe(503);
  expect(await timedOut.json()).toMatchObject({ code: "UNAVAILABLE", retryable: true });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(en.response.errors.UNAVAILABLE);
  await expect(textarea(page)).toHaveValue(text);
  await expect(page.getByRole("article")).toHaveCount(0);
  await scenario(page, "plan");
  expect((await send(page, text, en.retry)).status()).toBe(200);
  await expect(page.getByRole("article")).toHaveCount(1);
});

test("cancel keeps the draft and newer reply stable after delayed server work", async ({ page }) => {
  await open(page);
  const text = "A delayed routine question.";
  await beginSlow(page, text);
  await expect(page.getByRole("button", { name: en.send, exact: true })).toBeDisabled();
  await expect(page.getByRole("complementary", { name: en.emergencyLabel })).toBeVisible();
  await page.getByRole("button", { name: en.cancel, exact: true }).click();
  await expect(textarea(page)).toHaveValue(text);
  await expect(textarea(page)).toBeFocused();
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText(en.cancelled);
  await scenario(page, "plan");
  const result = await send(page, "A newer question about bedtime.");
  expect(result.request().postDataJSON().turns).toEqual([{ role: "user", text: "A newer question about bedtime." }]);
  await expect(page.getByRole("article")).toHaveCount(1);
  await pastDelayedCompletion(page);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("group", { name: en.response.user, exact: true })).toHaveCount(1);
});

test("clear requires confirmation, supports Keep and stays empty after delayed server work", async ({ page }) => {
  await open(page);
  await textarea(page).fill("An unsent concern to clear.");
  await page.getByRole("button", { name: en.clear, exact: true }).click();
  await expect(page.getByRole("button", { name: en.keep, exact: true })).toBeFocused();
  await page.getByRole("button", { name: en.keep, exact: true }).click();
  await expect(textarea(page)).toHaveValue("An unsent concern to clear.");
  await expect(textarea(page)).toBeFocused();
  await beginSlow(page, "An unsent concern to clear.");
  await page.getByRole("button", { name: en.clear, exact: true }).click();
  await page.getByRole("button", { name: en.confirmClear, exact: true }).click();
  await expect(textarea(page)).toHaveValue("");
  await expect(textarea(page)).toBeFocused();
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("group", { name: en.response.user, exact: true })).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText(en.cleared);
  await pastDelayedCompletion(page);
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("language change cancels work, preserves the draft and original response direction", async ({ page }) => {
  await open(page);
  await send(page, "Help with bedtime.");
  await expect(page.getByRole("article")).toHaveCount(1);
  const text = "Mera bacha bedtime par pareshan hota hai، وقت 8:30 ہے۔";
  await beginSlow(page, text);
  await page.getByRole("button", { name: "اردو", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ur");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(textarea(page)).toHaveValue(text);
  await expect(textarea(page)).toBeEditable();
  await expect(page.getByRole("article").first()).toHaveAttribute("lang", "en");
  await expect(page.getByRole("article").first()).toHaveAttribute("dir", "ltr");
  await scenario(page, "plan");
  const result = await send(page, text, ur.send);
  expect(result.request().postDataJSON()).toMatchObject({ locale: "ur" });
  expect(result.request().postDataJSON().turns).toHaveLength(3);
  await expect(page.getByRole("article")).toHaveCount(2);
  await expect(page.getByRole("article").nth(1)).toHaveAttribute("lang", "ur");
  await expect(page.getByRole("article").nth(1)).toHaveAttribute("dir", "rtl");
  await pastDelayedCompletion(page);
  await expect(page.getByRole("article")).toHaveCount(2);
  await expect(page.getByRole("group", { name: ur.response.user, exact: true })).toHaveCount(2);
});

test("reload discards accepted turns, draft and locale without writing chat storage", async ({ page, context }) => {
  await open(page);
  await send(page, "A synthetic bedtime concern.");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "اردو", exact: true }).click();
  await textarea(page).fill("غیر ارسال شدہ عبارت");
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  expect(await context.cookies()).toEqual([]);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(textarea(page)).toHaveValue("");
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("button", { name: en.clear, exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test("eight exchanges retain all history and require explicit new conversation", async ({ page }) => {
  await open(page);
  for (let index = 0; index < 8; index += 1) {
    const result = await send(page, `Synthetic routine question ${index + 1}.`);
    expect(result.status()).toBe(200);
    expect(result.request().postDataJSON().turns).toHaveLength(index * 2 + 1);
    await expect(page.getByRole("article")).toHaveCount(index + 1);
  }
  await expect(page.getByText(en.limit, { exact: true })).toBeVisible();
  await expect(textarea(page)).not.toBeEditable();
  await expect(page.getByRole("button", { name: en.send, exact: true })).toBeDisabled();
  await expect(page.getByRole("group", { name: en.response.user, exact: true })).toHaveCount(8);
  await page.getByRole("button", { name: en.clear, exact: true }).click();
  await page.getByRole("button", { name: en.confirmClear, exact: true }).click();
  await expect(textarea(page)).toBeEditable();
  await expect(page.getByRole("article")).toHaveCount(0);
  const restarted = await send(page, "A fresh concern.");
  expect(restarted.request().postDataJSON().turns).toHaveLength(1);
});

test("keyboard validation, newlines, IME composition and topic chips do not send accidentally", async ({ page }) => {
  await open(page);
  const requests: CoachRequest[] = [];
  page.on("request", (request) => {
    if (endpoint(request.url()) && request.method() === "POST") requests.push(request.postDataJSON() as CoachRequest);
  });
  await page.getByRole("button", { name: en.send, exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(en.emptyInput);
  await textarea(page).fill("x".repeat(2001));
  await textarea(page).press("Control+Enter");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(en.overlongInput);
  expect(requests).toHaveLength(0);
  await page.getByRole("button", { name: en.suggestions[0], exact: true }).click();
  await expect(textarea(page)).toBeFocused();
  await expect(textarea(page)).toHaveValue(en.suggestions[0]);
  await textarea(page).press("End");
  await textarea(page).press("Enter");
  await textarea(page).press("a");
  await expect(textarea(page)).toHaveValue(`${en.suggestions[0]}\na`);
  await textarea(page).dispatchEvent("compositionstart");
  await textarea(page).press("Control+Enter");
  expect(requests).toHaveLength(0);
  await textarea(page).dispatchEvent("compositionend");
  const result = page.waitForResponse((response) => endpoint(response.url()) && response.request().method() === "POST");
  await textarea(page).press("Control+Enter");
  expect((await result).status()).toBe(200);
  await expect(page.getByRole("article")).toHaveCount(1);
  expect(requests).toHaveLength(1);
  expect(requests[0].turns).toEqual([{ role: "user", text: `${en.suggestions[0]}\na` }]);
});
