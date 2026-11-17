import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  test(`bilingual cards, font and controls at ${width}px`, async ({ page, baseURL }) => {
    const failures: string[] = [];
    const origin = new URL(baseURL!).origin;
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("requestfailed", (request) => failures.push(`Failed: ${request.url()}`));
    page.on("response", (response) => {
      if (response.status() >= 400) failures.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== origin) failures.push(`External: ${request.url()}`);
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (const locale of ["en", "ur"] as const) {
      await page.getByRole("button", { name: locale === "en" ? "English" : "اردو", exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute("dir", locale === "ur" ? "rtl" : "ltr");
      await expect(page.locator("article")).toHaveCount(8);
      await expect(page.locator('article[lang="en"][dir="ltr"]')).toHaveCount(4);
      await expect(page.locator('article[lang="ur"][dir="rtl"]')).toHaveCount(4);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const button of await page.getByRole("button").all()) {
        const box = await button.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.width).toBeGreaterThanOrEqual(44);
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
    const localArabicFont = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].some((font) => font.family.includes("Noto Sans Arabic") && font.status === "loaded");
    });
    expect(localArabicFont).toBe(true);
    expect(failures).toEqual([]);
  });
}

test("Urdu remains readable with enlarged text and visible keyboard focus", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "اردو", exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  const originalSize = await page.locator('article[lang="ur"]').first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
  for (const scale of [2, 4]) {
    await page.addStyleTag({ content: `:root { font-size: ${scale * 100}%; }` });
    const enlargedSize = await page.locator('article[lang="ur"]').first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    expect(enlargedSize).toBeGreaterThanOrEqual(originalSize * scale);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.addStyleTag({ content: ":root { font-size: 100%; } * { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; } p { margin-block-end:2em !important; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "English", exact: true }).focus();
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(page.getByRole("button", { name: "اردو", exact: true })).toBeFocused();
  const outline = await page.getByRole("button", { name: "اردو", exact: true }).evaluate((node) => {
    const style = getComputedStyle(node);
    return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
  });
  expect(outline.width, browserName).toBeGreaterThanOrEqual(2);
  expect(outline.style).not.toBe("none");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
