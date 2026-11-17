// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CoachShell } from "@/components/coach-shell";
import { CoachClientError, type sendCoach } from "@/lib/client/coach-client";
import { en } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";
import { responseFixtures } from "@/test/fixtures/contracts";
import type { Success } from "@/lib/contracts";

afterEach(() => { cleanup(); document.documentElement.lang = "en"; document.documentElement.dir = "ltr"; });
const textbox = () => screen.getByRole("textbox");
const send = () => screen.getByRole("button", { name: en.send });
function immediate() { return vi.fn<typeof sendCoach>().mockImplementation(async (req) => ({ requestId: req.requestId, response: responseFixtures[req.locale].plan })); }
function deferred() {
  const pending: { resolve: (value: Success) => void; reject: (reason: unknown) => void }[] = [];
  const client = vi.fn<typeof sendCoach>(() => new Promise((resolve, reject) => pending.push({ resolve, reject })));
  return { client, pending };
}
describe("composer and conversation lifecycle", () => {
  it("suggestions populate only, disclosure is accurate and all input starts empty", async () => {
    const client = immediate(); const user = userEvent.setup(); render(<CoachShell demo client={client} />);
    expect(textbox()).toHaveValue(""); expect(screen.getByText(en.demoNotice)).toBeVisible();
    await user.click(screen.getByRole("button", { name: en.suggestions[0] }));
    expect(textbox()).toHaveValue(en.suggestions[0]); expect(textbox()).toHaveFocus(); expect(client).not.toHaveBeenCalled();
    expect(screen.getByText(en.replyLanguage)).toBeVisible(); expect(screen.getByRole("complementary", { name: en.emergencyLabel })).toBeVisible();
  });
  it("validates blank/overlong input and counts Unicode without silently truncating", async () => {
    const client = immediate(); render(<CoachShell client={client} />);
    fireEvent.click(send()); expect(screen.getByRole("alert")).toHaveTextContent(en.emptyInput);
    fireEvent.change(textbox(), { target: { value: "😀".repeat(2001) } }); fireEvent.click(send());
    expect(screen.getByText(en.overlongInput)).toBeVisible(); expect(textbox()).toHaveValue("😀".repeat(2001));
    expect(screen.getByText("2001 / 2000")).toBeVisible(); expect(client).not.toHaveBeenCalled();
  });
  it("Enter adds newline, modified Enter sends, and IME/composition key229 never submits", async () => {
    const client = immediate(); const user = userEvent.setup(); render(<CoachShell client={client} />);
    await user.type(textbox(), "Bedtime{Enter}is hard"); expect(textbox()).toHaveValue("Bedtime\nis hard"); expect(client).not.toHaveBeenCalled();
    fireEvent.compositionStart(textbox()); fireEvent.keyDown(textbox(), { key: "Enter", ctrlKey: true });
    fireEvent.compositionEnd(textbox()); fireEvent.keyDown(textbox(), { key: "Enter", ctrlKey: true, keyCode: 229 });
    fireEvent.keyDown(textbox(), { key: "Enter", metaKey: true, isComposing: true }); expect(client).not.toHaveBeenCalled();
    fireEvent.keyDown(textbox(), { key: "Enter", metaKey: true }); await waitFor(() => expect(client).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(textbox()).toHaveValue("")); expect(textbox()).toHaveFocus();
  });
  it("keeps drafts while loading/error, freezes editing and retries the parent only once", async () => {
    const { client, pending } = deferred(); render(<CoachShell client={client} />);
    fireEvent.change(textbox(), { target: { value: "Bedtime" } }); fireEvent.click(send()); fireEvent.click(send());
    expect(client).toHaveBeenCalledTimes(1); expect(textbox()).toHaveValue("Bedtime"); expect(textbox()).toHaveAttribute("readonly");
    await act(async () => pending[0].reject(new CoachClientError({ requestId: null, code: "UNAVAILABLE", retryable: true })));
    expect(textbox()).toHaveValue("Bedtime"); expect(textbox()).not.toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: en.retry }));
    expect(client.mock.calls[1][0].turns).toEqual([{ role: "user", text: "Bedtime" }]);
    await act(async () => pending[1].resolve({ requestId: client.mock.calls[1][0].requestId, response: responseFixtures.en.plan }));
    expect(screen.getAllByText("Bedtime")).toHaveLength(1); expect(textbox()).toHaveValue("");
  });
  it("mouse send keeps focus through loading/success without reclaiming intentional focus", async () => {
    const { client, pending } = deferred(); const user = userEvent.setup(); render(<CoachShell client={client} />);
    await user.type(textbox(), "Bedtime"); await user.click(send()); expect(textbox()).toHaveFocus();
    await act(async () => pending[0].resolve({ requestId: client.mock.calls[0][0].requestId, response: responseFixtures.en.plan }));
    expect(textbox()).toHaveFocus();
    await user.type(textbox(), "Follow-up"); await user.click(send());
    screen.getByRole("button", { name: en.clear }).focus();
    await act(async () => pending[1].resolve({ requestId: client.mock.calls[1][0].requestId, response: responseFixtures.en.plan }));
    expect(screen.getByRole("button", { name: en.clear })).toHaveFocus();
  });
  it.each(["cancel", "locale", "clear"] as const)("%s aborts and suppresses ignored-abort stale successes and failures", async (mode) => {
    const { client, pending } = deferred(); render(<CoachShell client={client} />);
    fireEvent.change(textbox(), { target: { value: "First concern" } }); fireEvent.click(send());
    if (mode === "cancel") fireEvent.click(screen.getByRole("button", { name: en.cancel }));
    if (mode === "locale") fireEvent.click(screen.getByRole("button", { name: "اردو" }));
    if (mode === "clear") { fireEvent.click(screen.getByRole("button", { name: en.clear })); fireEvent.click(screen.getByRole("button", { name: en.confirmClear })); }
    expect(client.mock.calls[0][1].aborted).toBe(true);
    await act(async () => pending[0].resolve({ requestId: client.mock.calls[0][0].requestId, response: responseFixtures.en.plan }));
    expect(screen.queryByText(responseFixtures.en.plan.acknowledgment)).not.toBeInTheDocument();
    expect(textbox()).toHaveValue(mode === "clear" ? "" : "First concern");
    const button = screen.getByRole("button", { name: mode === "locale" ? ur.send : en.send });
    if (mode === "clear") fireEvent.change(textbox(), { target: { value: "New concern" } });
    fireEvent.click(button); expect(client).toHaveBeenCalledTimes(2);
    await act(async () => pending[1].reject(new Error("SECRET")));
    expect(document.body.textContent).not.toContain("SECRET");
  });
  it("clear confirmation can keep history, then confirmed clear restores focus and draft reset", async () => {
    const user = userEvent.setup(); render(<CoachShell client={immediate()} />);
    await user.type(textbox(), "Some draft"); await user.click(screen.getByRole("button", { name: en.clear }));
    expect(screen.getByRole("group", { name: en.clearHeading })).toBeVisible(); expect(screen.getByRole("button", { name: en.keep })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: en.keep })); expect(textbox()).toHaveValue("Some draft");
    await user.click(screen.getByRole("button", { name: en.clear })); await user.click(screen.getByRole("button", { name: en.confirmClear }));
    expect(textbox()).toHaveValue(""); expect(textbox()).toHaveFocus();
  });
  it.each(["resolve", "reject"] as const)("an old %s cannot overwrite a newer in-flight retry", async (settle) => {
    const { client, pending } = deferred(); render(<CoachShell client={client} />);
    fireEvent.change(textbox(), { target: { value: "Old concern" } }); fireEvent.click(send());
    fireEvent.click(screen.getByRole("button", { name: en.cancel }));
    fireEvent.change(textbox(), { target: { value: "New concern" } }); fireEvent.click(send());
    await act(async () => {
      if (settle === "resolve") pending[0].resolve({ requestId: client.mock.calls[0][0].requestId, response: responseFixtures.en.plan });
      else pending[0].reject(new Error("STALE_SECRET"));
    });
    expect(send()).toBeDisabled(); expect(textbox()).toHaveValue("New concern"); expect(screen.queryAllByRole("article")).toHaveLength(0);
    await act(async () => pending[1].resolve({ requestId: client.mock.calls[1][0].requestId, response: responseFixtures.en.plan }));
    expect(textbox()).toHaveValue(""); expect(screen.getByText("New concern")).toBeVisible(); expect(screen.queryByText("Old concern")).not.toBeInTheDocument();
  });
  it("locale changes keep old replies in their own direction and new requests use new language", async () => {
    const client = immediate(); const user = userEvent.setup(); render(<CoachShell client={client} />);
    await user.type(textbox(), "English concern"); await user.click(send()); await screen.findByText(responseFixtures.en.plan.acknowledgment);
    const english = screen.getByRole("article"); expect(english).toHaveAttribute("lang", "en");
    await user.click(screen.getByRole("button", { name: "اردو" })); expect(english).toHaveAttribute("dir", "ltr");
    expect(document.documentElement).toHaveAttribute("dir", "rtl"); expect(screen.getByText(ur.replyLanguage)).toBeVisible();
    await user.type(textbox(), "Roman Urdu concern"); await user.click(screen.getByRole("button", { name: ur.send }));
    await screen.findByText(responseFixtures.ur.plan.acknowledgment);
    expect(screen.getAllByRole("article")[1]).toHaveAttribute("dir", "rtl"); expect(client.mock.calls[1][0].locale).toBe("ur");
  });
  it("shows context limit after eight exchanges and resets on remount without storage", async () => {
    const client = immediate(); const { unmount } = render(<CoachShell client={client} />);
    for (let n = 0; n < 8; n++) {
      fireEvent.change(textbox(), { target: { value: `Concern ${n}` } }); fireEvent.click(send());
      await waitFor(() => expect(textbox()).toHaveValue(""));
    }
    expect(client).toHaveBeenCalledTimes(8); expect(client.mock.calls[7][0].turns).toHaveLength(15);
    expect(screen.getByText(en.limit)).toBeVisible(); expect(send()).toBeDisabled();
    expect(screen.getByRole("complementary", { name: en.emergencyLabel })).toBeVisible(); unmount(); render(<CoachShell client={client} />);
    expect(textbox()).toHaveValue(""); expect(screen.queryAllByRole("article")).toHaveLength(0); expect(send()).toBeEnabled();
  });
});
