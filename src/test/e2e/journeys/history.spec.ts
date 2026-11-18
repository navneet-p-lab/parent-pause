import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { en } from "../../../lib/i18n/en";
import { ur } from "../../../lib/i18n/ur";

for (const locale of ["en", "ur"] as const) {
  test(`${locale} history restores exact context, isolates other chats and confirms deletion`, async ({ page }, testInfo) => {
    const copy = locale === "en" ? en : ur;
    await page.setViewportSize({ width: locale === "en" ? 1120 : 320, height: 900 });
    await page.setExtraHTTPHeaders({ "x-e2e-scenario": "plan", "x-e2e-client": randomUUID() });
    await page.goto("/");
    if (locale === "ur") await page.getByRole("button", { name: "اردو", exact: true }).click();
    const text = locale === "en" ? "A synthetic bedtime concern." : "سونے کے وقت کی ایک فرضی پریشانی۔";
    await page.getByRole("textbox").fill(text);
    const reply = page.waitForResponse((r) => r.url().endsWith("/api/coach") && r.request().method() === "POST");
    await page.getByRole("button", { name: copy.send, exact: true }).click();
    const firstReply = await (await reply).json();
    await expect(page.getByRole("textbox")).toBeEditable();
    await page.getByRole("textbox").fill("An exact unsent update");
    await page.getByRole("button", { name: copy.clear, exact: true }).click();
    await page.getByRole("button", { name: copy.confirmClear, exact: true }).click();
    await expect(page.getByRole("textbox")).toHaveValue("");
    await page.getByRole("textbox").fill("A separate draft");
    await page.getByRole("tab", { name: new RegExp(copy.historyTab) }).click();
    const open = page.getByRole("button", { name: new RegExp(`^${text}.*${copy.openConversation}`) });
    await expect(open).toBeVisible();
    await expect(page.getByRole("complementary", { name: copy.emergencyLabel })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath(`history-${locale}.png`), fullPage: true, animations: "disabled", style: "nextjs-portal { visibility: hidden !important; }" });
    await page.reload();
    await expect(page.getByRole("textbox")).toHaveValue("A separate draft");
    await page.getByRole("tab", { name: new RegExp(copy.historyTab) }).click();
    await open.click();
    await expect(page.getByRole("textbox")).toHaveValue("An exact unsent update");
    await expect(page.getByRole("textbox")).toBeFocused();
    const resumed = page.waitForResponse((r) => r.url().endsWith("/api/coach") && r.request().method() === "POST");
    await page.getByRole("button", { name: copy.send, exact: true }).click();
    expect((await resumed).request().postDataJSON().turns).toEqual([
      { role: "user", text }, { role: "assistant", response: firstReply.response }, { role: "user", text: "An exact unsent update" },
    ]);
    await expect(page.getByRole("article")).toHaveCount(2);
    await page.getByRole("tab", { name: new RegExp(copy.historyTab) }).click();
    await page.getByRole("button", { name: `${copy.deleteConversation}: A separate draft`, exact: true }).click();
    await expect(page.getByRole("button", { name: copy.keepHistory, exact: true })).toBeFocused();
    await page.getByRole("group", { name: copy.deleteHeading }).getByRole("button", { name: copy.deleteConversation, exact: true }).click();
    await expect(page.getByText(copy.historyEmpty)).toBeVisible();
    await expect(page.getByRole("heading", { name: copy.historyHeading })).toBeFocused();
    await page.getByRole("tab", { name: copy.chatTab, exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(2);
    await page.getByRole("tab", { name: new RegExp(copy.historyTab) }).click();
    await page.getByRole("button", { name: copy.clearAll, exact: true }).click();
    await page.getByRole("group", { name: copy.clearAllHeading }).getByRole("button", { name: copy.clearAll, exact: true }).click();
    expect(await page.evaluate(() => localStorage.getItem("parentpause.conversations.v1"))).toBeNull();
    await page.reload();
    await expect(page.getByRole("textbox")).toHaveValue("");
    await expect(page.getByRole("article")).toHaveCount(0);
  });
}

test("history keyboard tabs and long mixed-script titles fit a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.getByRole("textbox").fill("اردو ABC ".repeat(200));
  await page.getByRole("button", { name: en.clear, exact: true }).click();
  await page.getByRole("button", { name: en.confirmClear, exact: true }).click();
  await page.getByRole("tab", { name: en.chatTab, exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /History/ })).toBeFocused();
  await expect(page.getByRole("tab", { name: /History/ })).toHaveAttribute("aria-selected", "true");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: en.chatTab, exact: true })).toBeFocused();
  await expect(page.getByRole("textbox")).toHaveValue("");
});
