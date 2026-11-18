import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { en } from "../../../lib/i18n/en";
import { ur } from "../../../lib/i18n/ur";
import AxeBuilder from "@axe-core/playwright";

// Locale cases run independently in Chromium and WebKit.
for (const locale of ["en", "ur"] as const) {
  test(`${locale} thanks closes professional context directly in left/right chat`, async ({ page }, testInfo) => {
    const copy = locale === "en" ? en : ur;
    await page.setViewportSize({ width: locale === "en" ? 1120 : 390, height: 1000 });
    await page.setExtraHTTPHeaders({ "x-e2e-scenario": "medical-thanks", "x-e2e-client": randomUUID() });
    await page.goto("/");
    if (locale === "ur") await page.getByRole("button", { name: "اردو", exact: true }).click();
    await expect(page.getByText(copy.preview, { exact: true })).toHaveCount(0);
    await expect(page.getByText(copy.welcomePrompt)).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath(`welcome-${locale}.png`), fullPage: true, animations: "disabled", style: "nextjs-portal { visibility: hidden !important; }" });
    for (const text of ["Help me prepare questions for a professional.", locale === "en" ? "yes, thanks for advise" : "جی ہاں، شکریہ۔"]) {
      await page.getByRole("textbox").fill(text);
      const pending = page.waitForResponse((r) => r.url().endsWith("/api/coach") && r.request().method() === "POST");
      await page.getByRole("button", { name: copy.send, exact: true }).click();
      expect((await pending).status()).toBe(200);
      await expect(page.getByRole("textbox")).toBeEditable();
    }
    const closing = page.getByRole("article", { name: copy.response.pausedHeading });
    await expect(closing).toBeVisible();
    await expect(closing.getByRole("group")).toHaveCount(0);
    await expect(page.getByRole("button", { name: copy.pause, exact: true })).toHaveCount(0);
    await expect(page.getByRole("article", { name: copy.response.boundaryHeading })).toHaveCount(1);
    const parent = await page.getByRole("group", { name: copy.response.user, exact: true }).last().boundingBox();
    const coach = await closing.boundingBox();
    expect(parent!.x).toBeGreaterThan(coach!.x);
    expect(parent!.x + parent!.width).toBeGreaterThan(coach!.x + coach!.width);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`chat-${locale}.png`), fullPage: true, animations: "disabled", style: "nextjs-portal { visibility: hidden !important; }" });
  });
  test(`${locale} an uncertain break request offers a pause, confirmation closes, updates resume`, async ({ page }) => {
    const copy = locale === "en" ? en : ur;
    await page.setExtraHTTPHeaders({ "x-e2e-scenario": "pause-flow", "x-e2e-client": randomUUID() });
    await page.goto("/");
    if (locale === "ur") await page.getByRole("button", { name: "اردو", exact: true }).click();
    const textbox = page.getByRole("textbox");
    for (const text of ["Bedtime is difficult.", "Maybe I would like a break."]) {
      await textbox.fill(text);
      const response = page.waitForResponse((r) => r.url().endsWith("/api/coach") && r.request().method() === "POST");
      await page.getByRole("button", { name: copy.send, exact: true }).click();
      expect((await response).status()).toBe(200);
      await expect(textbox).toHaveValue("");
      await expect(textbox).toBeEditable();
    }
    await expect(page.getByRole("article", { name: copy.response.pauseOfferHeading })).toBeVisible();
    const confirmation = page.waitForResponse((r) => r.url().endsWith("/api/coach") && r.request().method() === "POST");
    await page.getByRole("button", { name: copy.pause, exact: true }).click();
    const result = await confirmation;
    expect(result.status()).toBe(200);
    const response = (await result.json()).response;
    expect(response.kind).toBe("paused"); expect(response).not.toHaveProperty("checkIn");
    const closing = page.getByRole("article", { name: copy.response.pausedHeading });
    await expect(closing).toBeVisible();
    await expect(closing.getByRole("group")).toHaveCount(0);
    expect(await closing.textContent()).not.toMatch(/[?؟]/);
    await expect(page.getByRole("textbox", { name: copy.updateLabel })).toBeEditable();
    await textbox.fill("An update: the routine is easier today.");
    const resumed = page.waitForResponse((r) => r.url().endsWith("/api/coach") && r.request().method() === "POST");
    await page.getByRole("button", { name: copy.send, exact: true }).click();
    expect((await (await resumed).json()).response.kind).toBe("plan");
    await expect(page.getByRole("textbox", { name: copy.followUpLabel })).toBeEditable();
    await expect(page.getByRole("article")).toHaveCount(4);
  });
}

test("submitted text appears immediately above multiple placeholders while the composer clears", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setExtraHTTPHeaders({ "x-e2e-scenario": "slow", "x-e2e-client": randomUUID() });
  await page.goto("/");
  const text = "A synthetic screen-time concern.";
  const textbox = page.getByRole("textbox");
  await textbox.fill(text);
  await page.getByRole("button", { name: en.send, exact: true }).click();
  await expect(textbox).toHaveValue("");
  await expect(page.getByRole("group", { name: en.response.user, exact: true }).getByText(text)).toBeVisible();
  const placeholder = page.locator('[aria-busy="true"]');
  await expect(placeholder).toBeVisible();
  await expect(placeholder.locator('[aria-hidden="true"] span')).toHaveCount(5);
  const animation = await placeholder.locator('[aria-hidden="true"]').last().evaluate((node) => getComputedStyle(node).animationName);
  expect(animation).toBe("none");
  await page.getByRole("button", { name: en.cancel, exact: true }).click();
  await expect(textbox).toHaveValue(text);
  await expect(placeholder).toHaveCount(0);
});
