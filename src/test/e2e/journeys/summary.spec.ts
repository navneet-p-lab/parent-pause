import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { en } from "../../../lib/i18n/en";
import { ur } from "../../../lib/i18n/ur";

for (const locale of ["en", "ur"] as const) {
  for (const method of ["typed", "button"] as const) {
    test(`${locale} ${method} recap handles gratitude, persists and resumes`, async ({ page }) => {
      const copy = locale === "en" ? en : ur;
      await page.setViewportSize({ width: locale === "en" ? 1120 : 390, height: 900 });
      await page.setExtraHTTPHeaders({ "x-e2e-scenario": "summary-flow", "x-e2e-client": randomUUID() });
      await page.goto("/");
      if (locale === "ur") await page.getByRole("button", { name: "اردو", exact: true }).click();
      const textbox = page.getByRole("textbox");
      await textbox.fill("Bedtime is difficult.");
      const first = page.waitForResponse((r) => r.url().endsWith("/api/coach") && r.request().method() === "POST");
      await page.getByRole("button", { name: copy.send, exact: true }).click();
      expect((await first).status()).toBe(200);
      await expect(page.getByRole("article", { name: copy.response.planHeading })).toBeVisible();
      const recap = page.waitForResponse((r) => r.url().endsWith("/api/coach") && r.request().method() === "POST");
      if (method === "typed") {
        await textbox.fill(locale === "en"
          ? "I dont know to be honest, but thanks for all the advise so far, cna you summarise the things i should do till now?"
          : "شکریہ، اب تک کی گفتگو کا خلاصہ کر دیں۔");
        await page.getByRole("button", { name: copy.send, exact: true }).click();
      } else {
        await page.getByRole("button", { name: copy.summarize, exact: true }).click();
      }
      const response = await recap;
      expect(response.status()).toBe(200);
      expect((await response.json()).response.kind).toBe("summary");
      const summary = page.getByRole("article", { name: copy.response.summaryHeading });
      await expect(summary).toBeVisible();
      await expect(summary.getByRole("listitem")).toHaveCount(2);
      await expect(summary.getByRole("group")).toHaveCount(0);
      await expect(page.getByRole("article", { name: copy.response.boundaryHeading })).toHaveCount(0);
      await expect(page.getByRole("article", { name: copy.response.pausedHeading })).toHaveCount(0);
      await expect(page.getByRole("button", { name: copy.summarize, exact: true })).toHaveCount(0);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.reload();
      await expect(summary).toBeVisible();
      await textbox.fill("An update: we tried a quiet activity.");
      const resumed = page.waitForResponse((r) => r.url().endsWith("/api/coach") && r.request().method() === "POST");
      await page.getByRole("button", { name: copy.send, exact: true }).click();
      const result = await resumed;
      expect((await result.json()).response.kind).toBe("plan");
      const body = result.request().postDataJSON();
      expect(body.turns.at(-2).response.kind).toBe("summary");
      await expect(page.getByRole("article")).toHaveCount(3);
    });
  }
}
