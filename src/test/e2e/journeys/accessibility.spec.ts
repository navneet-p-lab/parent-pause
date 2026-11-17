import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { coachRequestSchema, successForRequestSchema, type Locale } from "../../../lib/contracts";
import { en } from "../../../lib/i18n/en";
import { ur } from "../../../lib/i18n/ur";
import { responseFixtures } from "../../fixtures/contracts";
import { authoredEscalation } from "../../../lib/server/safety/templates";

const copies = { en, ur };
const mixedInput = "Bedtime 8:30 — سونے کا وقت مشکل ہے۔ Mera bacha pareshan hai.";

async function selectLocale(page: Page, locale: Locale) {
  await page.getByRole("button", { name: locale === "en" ? "English" : "اردو", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator("html")).toHaveAttribute("dir", locale === "ur" ? "rtl" : "ltr");
}

async function sendPlan(page: Page, locale: Locale, text = mixedInput) {
  await page.getByRole("textbox").fill(text);
  const received = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/coach" && response.request().method() === "POST");
  await page.getByRole("button", { name: copies[locale].send, exact: true }).click();
  const response = await received;
  const request = coachRequestSchema.parse(response.request().postDataJSON());
  expect(request.locale).toBe(locale);
  expect(request.turns.at(-1)).toEqual({ role: "user", text });
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  const accepted = successForRequestSchema(request).parse(await response.json());
  expect(accepted.response).toEqual(responseFixtures[locale].plan);
  await expect(page.getByRole("article").last()).toContainText(responseFixtures[locale].plan.acknowledgment);
  await expect(page.getByRole("textbox")).toBeFocused();
  return page.getByRole("article").last();
}

async function readyFonts(page: Page) {
  expect(await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some((font) => font.family.includes("Noto Sans Arabic") && font.status === "loaded");
  })).toBe(true);
}

async function assertLayout(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // Limit touch-target checks to the product; Next development tooling is separate.
  for (const button of await page.locator("header, main").getByRole("button").all()) {
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  // Geometry detects constrained/clipped text boxes, not native glyph quality.
  expect(await page.getByRole("article").evaluateAll((cards) => cards.flatMap((card) => {
    const textNodes = [...card.querySelectorAll("p, h2, h3, li")];
    return textNodes.filter((node) => {
      const style = getComputedStyle(node);
      return [style.overflowX, style.overflowY].some((value) => value === "hidden" || value === "clip")
        && (node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1);
    }).map((node) => node.tagName);
  }))).toEqual([]);
}

async function assertAxe(page: Page, testInfo: TestInfo, label: string) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  await testInfo.attach(`${label}-axe`, { body: JSON.stringify(violations, null, 2), contentType: "application/json" });
  // Require all severities to pass so moderate/minor findings cannot disappear.
  expect(violations).toEqual([]);
}

async function capture(page: Page, testInfo: TestInfo, label: string) {
  const file = testInfo.outputPath(`${label}.png`);
  // Exclude the framework's floating devtools only from the image. All product
  // layout/axe/focus assertions above run against the unchanged rendered app.
  await page.screenshot({ path: file, fullPage: true, animations: "disabled", caret: "hide",
    style: "nextjs-portal { visibility: hidden !important; }" });
  await testInfo.attach(label, { path: file, contentType: "image/png" });
}

for (const width of [320, 390, 768, 1440]) {
  test(`real bilingual exchange remains accessible at ${width}px`, async ({ page, baseURL }, testInfo) => {
    await page.setExtraHTTPHeaders({ "x-e2e-scenario": "plan", "x-e2e-client": crypto.randomUUID() });
    await page.setViewportSize({ width, height: 900 });
    const failures: string[] = [];
    const origin = new URL(baseURL!).origin;
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("requestfailed", (request) => failures.push(`Failed: ${request.url()}`));
    page.on("response", (response) => { if (response.status() >= 400) failures.push(`HTTP ${response.status()}: ${response.url()}`); });
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== origin) failures.push(`External: ${request.url()}`);
    });
    await page.goto("/");
    for (const locale of ["en", "ur"] as const) {
      await selectLocale(page, locale);
      const card = await sendPlan(page, locale);
      await expect(card).toHaveAttribute("lang", locale);
      await expect(card).toHaveAttribute("dir", locale === "ur" ? "rtl" : "ltr");
      await expect(card.locator("ol > li")).toHaveCount(2);
      await expect(page.getByText(mixedInput, { exact: true }).last()).toHaveAttribute("dir", "auto");
      expect(await card.evaluate((node) => getComputedStyle(node).textAlign)).toBe("start");
      await expect(page.getByRole("complementary", { name: copies[locale].emergencyLabel })).toBeVisible();
      await readyFonts(page);
      await assertLayout(page);
      await assertAxe(page, testInfo, locale);
      await capture(page, testInfo, `${locale}-${width}px`);
    }
    await expect(page.locator('article[lang="en"][dir="ltr"]')).toHaveCount(1);
    await expect(page.locator('article[lang="ur"][dir="rtl"]')).toHaveCount(1);
    // Changing UI locale never retranslates or reverses accepted English history.
    await expect(page.getByRole("article").first()).toContainText(responseFixtures.en.plan.acknowledgment);
    expect(failures).toEqual([]);
  });
}

for (const locale of ["en", "ur"] as const) {
  test(`${locale} connected transcript supports text enlargement and spacing`, async ({ page }, testInfo) => {
    await page.setExtraHTTPHeaders({ "x-e2e-scenario": "plan", "x-e2e-client": crypto.randomUUID() });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/");
    await selectLocale(page, locale);
    const card = await sendPlan(page, locale);
    await readyFonts(page);
    const original = await card.evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    for (const scale of [2, 4]) {
      await page.addStyleTag({ content: `:root { font-size: ${scale * 100}%; }` });
      expect(await card.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(original * scale);
      await assertLayout(page);
      await expect(card.getByRole("heading", { name: copies[locale].response.checkInHeading })).toBeVisible();
      await capture(page, testInfo, `${locale}-${scale * 100}percent-text`);
    }
    await page.addStyleTag({ content: ":root { font-size: 100%; } * { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; } p { margin-block-end:2em !important; }" });
    await assertLayout(page);
    await assertAxe(page, testInfo, `${locale}-text-spacing`);
  });
}

test("keyboard focus and new-result announcements survive language changes", async ({ page, browserName }) => {
  await page.setExtraHTTPHeaders({ "x-e2e-scenario": "slow", "x-e2e-client": crypto.randomUUID() });
  await page.goto("/");
  const nextLink = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  await page.keyboard.press(nextLink);
  await expect(page.getByRole("link", { name: en.skipToMain })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.getByRole("button", { name: "English", exact: true }).focus();
  await page.keyboard.press(nextLink);
  const urduButton = page.getByRole("button", { name: "اردو", exact: true });
  await expect(urduButton).toBeFocused();
  const outline = await urduButton.evaluate((node) => ({ width: parseFloat(getComputedStyle(node).outlineWidth), style: getComputedStyle(node).outlineStyle }));
  expect(outline.width).toBeGreaterThanOrEqual(2);
  expect(outline.style).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "ur");
  await page.getByRole("textbox").fill(mixedInput);
  await page.getByRole("textbox").press("Control+Enter");
  const live = page.locator('[aria-live][aria-atomic="true"]');
  await expect(live).toHaveText(ur.response.loading);
  await expect(live).toHaveAttribute("aria-live", "polite");
  await expect(page.getByRole("button", { name: ur.send, exact: true })).toBeDisabled();
  await expect(page.getByRole("complementary", { name: ur.emergencyLabel })).toBeVisible();
  // A deliberate focus change must survive asynchronous completion.
  await urduButton.focus();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(live).toHaveText(ur.replyReady);
  await expect(urduButton).toBeFocused();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(live).toBeEmpty();
  await expect(live).not.toHaveAttribute("role", "alert");
  await expect(page.getByRole("article")).toHaveAttribute("lang", "ur");
});

for (const locale of ["en", "ur"] as const) {
  test(`${locale} original-route emergency remains accessible at 320px`, async ({ page }, testInfo) => {
    await page.setExtraHTTPHeaders({ "x-e2e-scenario": "default", "x-e2e-client": crypto.randomUUID() });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/");
    await selectLocale(page, locale);
    await page.getByRole("textbox").fill("Mera bacha saans nahi le raha.");
    const received = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/coach" && response.request().method() === "POST");
    await page.getByRole("button", { name: copies[locale].send, exact: true }).click();
    const response = await received;
    expect(response.status()).toBe(200);
    const request = coachRequestSchema.parse(response.request().postDataJSON());
    const accepted = successForRequestSchema(request).parse(await response.json());
    expect(accepted.response).toEqual(authoredEscalation(locale, "emergency"));
    const card = page.getByRole("article");
    await expect(card).toContainText(authoredEscalation(locale, "emergency").checkIn.text);
    await expect(card).toHaveAttribute("lang", locale);
    await expect(card).toHaveAttribute("dir", locale === "ur" ? "rtl" : "ltr");
    await expect(card.locator("ol")).toHaveCount(0);
    await expect(page.getByRole("main").getByRole("alert")).toContainText(copies[locale].response.escalationHeading);
    await expect(page.getByRole("complementary", { name: copies[locale].emergencyLabel })).toBeVisible();
    await readyFonts(page);
    await assertLayout(page);
    await assertAxe(page, testInfo, `${locale}-authored-emergency`);
    await capture(page, testInfo, `${locale}-authored-emergency-320px`);
  });
}
