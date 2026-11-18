// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import type { Locale } from "@/lib/contracts";
import { LocalizedShell } from "@/components/localized-shell";
import { directionForLocale } from "@/lib/client/direction";
import { en } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";

function Demo() {
  const [locale, setLocale] = useState<Locale>("en");
  return <LocalizedShell locale={locale} onLocaleChange={setLocale}><h1>{locale === "en" ? en.emptyHeading : ur.emptyHeading}</h1><p dir="auto">میرا بچہ 12 ABC دوستوں کے ساتھ ہے</p></LocalizedShell>;
}

afterEach(() => {
  cleanup();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

function keys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => typeof child === "object" && child !== null ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`]);
}

test("keeps the complete static dictionary and response-error key sets in parity", () => {
  expect(keys(ur).sort()).toEqual(keys(en).sort());
  expect(directionForLocale("en")).toBe("ltr");
  expect(directionForLocale("ur")).toBe("rtl");
});

test("switches explicit EN/UR choice, document direction and static labels without altering parent text", async () => {
  const user = userEvent.setup();
  render(<Demo />);
  const parentText = "میرا بچہ 12 ABC دوستوں کے ساتھ ہے";
  expect(document.documentElement).toHaveAttribute("lang", "en");
  expect(document.documentElement).toHaveAttribute("dir", "ltr");
  expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "اردو" }));
  expect(document.documentElement).toHaveAttribute("lang", "ur");
  expect(document.documentElement).toHaveAttribute("dir", "rtl");
  expect(screen.getByRole("group", { name: ur.languageLabel })).toBeVisible();
  expect(screen.getByRole("button", { name: "اردو" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("heading", { name: ur.emptyHeading })).toBeVisible();
  expect(screen.getByText(parentText)).toHaveAttribute("dir", "auto");
  expect(screen.getByText(parentText).textContent).toBe(parentText);
  expect(screen.getByRole("complementary", { name: ur.emergencyLabel })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "English" }));
  expect(document.documentElement).toHaveAttribute("lang", "en");
  expect(document.documentElement).toHaveAttribute("dir", "ltr");
  expect(screen.getByRole("heading", { name: en.emptyHeading })).toBeVisible();
});

test("offers keyboard navigation, a translated skip target and persistent disclosures", async () => {
  const user = userEvent.setup();
  render(<Demo />);
  const skip = screen.getByRole("link", { name: en.skipToMain });
  const main = screen.getByRole("main", { name: en.mainLabel });
  await user.tab();
  expect(skip).toHaveFocus();
  expect(skip).toHaveAttribute("href", `#${main.id}`);
  expect(main).toHaveAttribute("tabindex", "-1");
  await user.tab();
  expect(screen.getByRole("button", { name: "English" })).toHaveFocus();
  await user.tab();
  const urButton = screen.getByRole("button", { name: "اردو" });
  expect(urButton).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(urButton).toHaveFocus();
  expect(screen.getByRole("link", { name: ur.skipToMain })).toHaveAttribute("href", `#${main.id}`);
  expect(screen.queryByText(ur.preview)).toBeNull();
  expect(screen.getByText(ur.privacy)).toBeVisible();
  expect(screen.getByText("OpenAI")).toHaveAttribute("dir", "ltr");
  expect(screen.getByText("ParentPause")).toHaveAttribute("dir", "ltr");
  expect(screen.getByRole("complementary", { name: ur.emergencyLabel })).not.toHaveAttribute("aria-live");
});

test("is controlled by its caller and never persists the selected locale", async () => {
  const user = userEvent.setup();
  const changes: Locale[] = [];
  render(<LocalizedShell locale="en" onLocaleChange={(locale) => changes.push(locale)}><h1>Preview</h1></LocalizedShell>);
  await user.click(screen.getByRole("button", { name: "اردو" }));
  expect(changes).toEqual(["ur"]);
  expect(document.documentElement).toHaveAttribute("lang", "en");
  expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
});
