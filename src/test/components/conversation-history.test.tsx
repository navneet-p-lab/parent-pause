// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { CoachShell } from "@/components/coach-shell";
import type { sendCoach } from "@/lib/client/coach-client";
import type { Success } from "@/lib/contracts";
import { en } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";
import { responseFixtures } from "@/test/fixtures/contracts";
import { HISTORY_STORAGE_KEY } from "@/lib/client/conversation-storage";

afterEach(() => { cleanup(); document.documentElement.lang = "en"; document.documentElement.dir = "ltr"; });
const draft = (text: string) => fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
const archive = (copy = en) => {
  fireEvent.click(screen.getByRole("button", { name: copy.clear }));
  fireEvent.click(screen.getByRole("button", { name: copy.confirmClear }));
};
const historyTab = (copy = en) => screen.getByRole("tab", { name: new RegExp(copy.historyTab) });

it.each(["en", "ur"] as const)("opens and continues older chats with their full original context in %s", async (locale) => {
  const copy = locale === "en" ? en : ur;
  const client = vi.fn<typeof sendCoach>(async (request) => ({ requestId: request.requestId, response: responseFixtures[request.locale].plan }));
  render(<CoachShell client={client} />);
  if (locale === "ur") fireEvent.click(screen.getByRole("button", { name: "اردو" }));
  draft("Bedtime concern");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: copy.send })));
  draft("An unsent update"); archive(copy);
  draft("A different conversation");
  fireEvent.click(historyTab(copy));
  expect(screen.getByText(copy.historyDescription)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^Bedtime concern.*${copy.openConversation}`) }));
  expect(screen.getByRole("textbox")).toHaveValue("An unsent update");
  expect(screen.getByRole("textbox")).toHaveFocus();
  expect(screen.getByRole("article")).toHaveAttribute("lang", locale);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: copy.send })));
  expect(client.mock.calls[1][0].turns).toEqual([
    { role: "user", text: "Bedtime concern" }, { role: "assistant", response: responseFixtures[locale].plan }, { role: "user", text: "An unsent update" },
  ]);
  fireEvent.click(historyTab(copy));
  expect(screen.getByRole("button", { name: new RegExp(`^A different conversation.*${copy.openConversation}`) })).toBeVisible();
});

it("supports tab keyboard navigation and confirms deletion of the selected chat only", () => {
  render(<CoachShell />);
  const chat = screen.getByRole("tab", { name: en.chatTab });
  fireEvent.keyDown(chat, { key: "ArrowRight" });
  expect(historyTab()).toHaveFocus(); expect(historyTab()).toHaveAttribute("aria-selected", "true");
  expect(screen.getByText(en.historyEmpty)).toBeVisible();
  fireEvent.keyDown(historyTab(), { key: "Home" });
  draft("First draft"); archive(); draft("Second draft"); archive();
  fireEvent.click(historyTab());
  fireEvent.click(screen.getByRole("button", { name: "Delete: First draft" }));
  expect(screen.getByRole("button", { name: en.keepHistory })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: en.keepHistory }));
  expect(screen.getByRole("button", { name: /First draft.*Open conversation/ })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Delete: First draft" }));
  const confirmation = screen.getByRole("group", { name: en.deleteHeading });
  fireEvent.click(within(confirmation).getByRole("button", { name: en.deleteConversation }));
  expect(screen.queryByRole("button", { name: /First draft/ })).toBeNull();
  expect(screen.getByRole("button", { name: /Second draft.*Open conversation/ })).toBeVisible();
  expect(screen.getByRole("heading", { name: en.historyHeading })).toHaveFocus();
});

it("browses history during a request and aborts on opening another chat, ignoring stale completion", async () => {
  let resolve!: (value: Success) => void;
  const client = vi.fn<typeof sendCoach>(() => new Promise((done) => { resolve = done; }));
  render(<CoachShell client={client} />);
  draft("Earlier draft"); archive(); draft("Pending concern");
  fireEvent.click(screen.getByRole("button", { name: en.send }));
  fireEvent.click(historyTab());
  expect(client.mock.calls[0][1].aborted).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: /Earlier draft.*Open conversation/ }));
  expect(client.mock.calls[0][1].aborted).toBe(true);
  await act(async () => resolve({ requestId: client.mock.calls[0][0].requestId, response: responseFixtures.en.plan }));
  expect(screen.queryByRole("article")).toBeNull();
  expect(screen.getByRole("textbox")).toHaveValue("Earlier draft");
  fireEvent.click(historyTab());
  fireEvent.click(screen.getByRole("button", { name: /Pending concern.*Open conversation/ }));
  expect(screen.getByRole("textbox")).toHaveValue("Pending concern");
});

it("restores saved chats and drafts after remount, and confirmed clear removes all saved data", () => {
  const first = render(<CoachShell />);
  draft("Archived draft"); archive(); draft("Current draft");
  expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toContain("Archived draft");
  first.unmount(); render(<CoachShell />);
  expect(screen.getByRole("textbox")).toHaveValue("Current draft");
  fireEvent.click(historyTab());
  expect(screen.getByRole("button", { name: /^Archived draft.*Open conversation/ })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: en.clearAll }));
  expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toContain("Archived draft");
  const confirmation = screen.getByRole("group", { name: en.clearAllHeading });
  fireEvent.click(within(confirmation).getByRole("button", { name: en.clearAll }));
  expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBeNull();
  expect(screen.getByText(en.historyEmpty)).toBeVisible();
  fireEvent.click(screen.getByRole("tab", { name: en.chatTab }));
  expect(screen.getByRole("textbox")).toHaveValue("");
});

it("preserves invalid stored history until explicit reset and explains the recovery path", () => {
  localStorage.setItem(HISTORY_STORAGE_KEY, "invalid history");
  render(<CoachShell />);
  expect(screen.getByRole("status")).toHaveTextContent(en.storageInvalid);
  draft("New unsaved draft");
  expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBe("invalid history");
  fireEvent.click(historyTab());
  fireEvent.click(screen.getByRole("button", { name: en.clearAll }));
  fireEvent.click(within(screen.getByRole("group", { name: en.clearAllHeading })).getByRole("button", { name: en.clearAll }));
  expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBeNull();
  expect(screen.queryByText(en.storageInvalid)).toBeNull();
});

it("keeps chats usable when browser storage is unavailable", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Quota", "QuotaExceededError"); });
  render(<CoachShell />);
  draft("A draft kept in memory");
  expect(screen.getByRole("status")).toHaveTextContent(en.storageUnavailable);
  expect(screen.getByRole("textbox")).toHaveValue("A draft kept in memory");
  archive(); fireEvent.click(historyTab());
  expect(screen.getByRole("button", { name: /^A draft kept in memory.*Open conversation/ })).toBeVisible();
});

it("does not overwrite a newer conversation saved by another tab", () => {
  render(<CoachShell />);
  draft("This tab draft");
  localStorage.setItem(HISTORY_STORAGE_KEY, "Different tab data");
  draft("New local change");
  expect(screen.getByRole("status")).toHaveTextContent(en.storageConflict);
  expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBe("Different tab data");
  expect(screen.getByRole("textbox")).toHaveValue("New local change");
});

it("restores history during StrictMode mounting without overwriting it with an empty initial render", () => {
  const saved = JSON.stringify({ version: 1, locale: "en", turns: [], draft: "Saved current draft", history: [{ id: "old", turns: [], draft: "Saved old draft" }] });
  localStorage.setItem(HISTORY_STORAGE_KEY, saved);
  render(<StrictMode><CoachShell /></StrictMode>);
  expect(screen.getByRole("textbox")).toHaveValue("Saved current draft");
  expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBe(saved);
});

it("explains blocked access and failed deletion without claiming saved history was removed", () => {
  localStorage.setItem(HISTORY_STORAGE_KEY, "Saved data");
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
  render(<CoachShell />);
  expect(screen.getByRole("status")).toHaveTextContent(en.storageUnavailable);
  fireEvent.click(historyTab());
  fireEvent.click(screen.getByRole("button", { name: en.clearAll }));
  fireEvent.click(within(screen.getByRole("group", { name: en.clearAllHeading })).getByRole("button", { name: en.clearAll }));
  expect(screen.getByRole("status")).toHaveTextContent(en.storageDeleteFailed);
  vi.restoreAllMocks();
  expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBe("Saved data");
});
