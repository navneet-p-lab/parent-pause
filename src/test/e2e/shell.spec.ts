import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  test(`shell is accessible and self-contained at ${width}px`, async ({ page, browserName, baseURL }) => {
    const failures: string[] = [];
    const origin = new URL(baseURL!).origin;
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("requestfailed", (request) => failures.push(`Failed resource: ${request.url()}`));
    page.on("response", (response) => {
      if (response.status() >= 400) failures.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.protocol.startsWith("http") && url.origin !== origin) failures.push(`External request: ${url}`);
      if (request.method() !== "GET") failures.push(`Unexpected ${request.method()}: ${url}`);
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page).toHaveTitle("ParentPause");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator('link[rel="stylesheet"]')).not.toHaveCount(0);
    const heading = page.getByRole("heading", { name: "Parenting can feel like a lot.", level: 1 });
    await expect(heading).toBeVisible();
    // Safari on macOS uses Option-Tab for links with default keyboard settings.
    // https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac
    const nextLinkKey = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
    await page.keyboard.press(nextLinkKey);
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    await expect(page.getByText(/Assessment demo/)).toHaveCount(0);
    await expect(page.getByText(/A few words are enough/)).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(failures).toEqual([]);
  });
}

test("narrow layout supports enlarged text and user text spacing", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.addStyleTag({ content: ":root { font-size: 200%; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Emergency guidance" })).toBeVisible();
  // Check text-spacing overrides separately from the text-resize check.
  await page.addStyleTag({ content: `
    :root { font-size: 100%; }
    * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }
    p { margin-block-end: 2em !important; }
  ` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
