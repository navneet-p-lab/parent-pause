// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CoachShell } from "@/components/coach-shell";
import { ResponsePlaceholder } from "@/components/response-placeholder";
import { CoachResponse } from "@/components/coach-response";
import type { sendCoach } from "@/lib/client/coach-client";
import { authoredPause } from "@/lib/server/safety/templates";
import { en } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";
import { responseFixtures } from "@/test/fixtures/contracts";
import { summaryFixtures } from "@/test/fixtures/summary";

afterEach(() => { cleanup(); vi.useRealTimers(); document.documentElement.lang = "en"; document.documentElement.dir = "ltr"; });

it.each(["en", "ur"] as const)("offers a %s recap without overwriting a draft, renders no question and resumes", async (locale) => {
  const copy = locale === "en" ? en : ur;
  const client = vi.fn<typeof sendCoach>().mockImplementation(async (request) => ({ requestId: request.requestId,
    response: client.mock.calls.length === 2 ? summaryFixtures[locale] : responseFixtures[locale].plan }));
  render(<CoachShell client={client} />);
  if (locale === "ur") fireEvent.click(screen.getByRole("button", { name: "اردو" }));
  expect(screen.queryByRole("button", { name: copy.summarize })).toBeNull();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Bedtime feels hard" } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: copy.send })));
  const button = screen.getByRole("button", { name: copy.summarize });
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "An unfinished update" } });
  expect(button).toBeDisabled();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } });
  await act(async () => fireEvent.click(button));
  expect(client.mock.calls[1][0].turns.at(-1)).toEqual({ role: "user", text: copy.summaryMessage });
  expect(client.mock.calls[1][0].turns).toHaveLength(3);
  const summary = screen.getByRole("article", { name: copy.response.summaryHeading });
  expect(summary).toHaveAttribute("dir", locale === "ur" ? "rtl" : "ltr");
  expect(within(summary).queryByRole("group")).toBeNull();
  expect(within(summary).getAllByRole("listitem").map((item) => item.textContent)).toEqual(summaryFixtures[locale].steps);
  expect(screen.queryByRole("button", { name: copy.summarize })).toBeNull();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "A new update" } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: copy.send })));
  expect(client.mock.calls[2][0].turns.at(-2)).toEqual({ role: "assistant", response: summaryFixtures[locale] });
  expect(screen.getByRole("button", { name: copy.summarize })).toBeEnabled();
});

it.each(["en", "ur"] as const)("asks to pause, closes without a question and accepts an update in %s", async (locale) => {
  const copy = locale === "en" ? en : ur;
  let turn = 0;
  const client = vi.fn<typeof sendCoach>().mockImplementation(async (request) => ({ requestId: request.requestId,
    response: [responseFixtures[locale].plan, authoredPause(locale, false), authoredPause(locale, true), responseFixtures[locale].plan][turn++] }));
  render(<CoachShell client={client} />);
  if (locale === "ur") fireEvent.click(screen.getByRole("button", { name: "اردو" }));
  for (const text of ["Bedtime feels hard", "Maybe I would like a break."]) {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: copy.send })));
  }
  expect(screen.getByRole("article", { name: copy.response.pauseOfferHeading })).toBeVisible();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: copy.pause })));
  expect(client.mock.calls[2][0].turns.at(-1)).toEqual({ role: "user", text: copy.pauseMessage });
  const paused = screen.getByRole("article", { name: copy.response.pausedHeading });
  expect(within(paused).queryByRole("group")).toBeNull();
  expect(within(paused).getByText((authoredPause(locale, true) as { message: string }).message)).toBeVisible();
  expect(screen.queryByRole("button", { name: copy.pause })).toBeNull();
  expect(screen.getByRole("textbox", { name: copy.updateLabel })).not.toHaveAttribute("readonly");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Here is an update" } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: copy.send })));
  expect(client.mock.calls[3][0].turns).toHaveLength(7);
  expect(client.mock.calls[3][0].turns.at(-2)).toMatchObject({ role: "assistant", response: { kind: "paused" } });
  expect(screen.getByRole("textbox", { name: copy.followUpLabel })).toHaveValue("");
});

it("keeps the pause offer optional", async () => {
  const client = vi.fn<typeof sendCoach>().mockImplementation(async (request) => ({ requestId: request.requestId,
    response: client.mock.calls.length === 1 ? responseFixtures.en.plan : client.mock.calls.length === 2 ? authoredPause("en", false) : responseFixtures.en.clarify }));
  render(<CoachShell client={client} />);
  for (const text of ["Bedtime", "Maybe I would like a break."]) {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: en.send })));
  }
  await act(async () => fireEvent.click(screen.getByRole("button", { name: en.continueTalking })));
  expect(client.mock.calls[2][0].turns.at(-1)).toEqual({ role: "user", text: en.continueMessage });
  expect(screen.queryByRole("article", { name: en.response.pausedHeading })).toBeNull();
});

it.each(["en", "ur"] as const)("renders a question-free %s closing as plain text", (locale) => {
  const copy = locale === "en" ? en : ur;
  render(<CoachResponse response={authoredPause(locale, true)} labels={copy.response} />);
  const closing = screen.getByRole("article", { name: copy.response.pausedHeading });
  expect(closing).toHaveAttribute("dir", locale === "en" ? "ltr" : "rtl");
  expect(within(closing).queryByRole("heading", { level: 3 })).toBeNull();
  expect(closing.textContent).not.toMatch(/[?؟]/);
});

it("rotates waiting hints with several decorative placeholders and clears its timer", () => {
  vi.useFakeTimers();
  const { container, unmount } = render(<ResponsePlaceholder labels={en.response} />);
  expect(screen.getByText(en.response.loading)).toBeVisible();
  expect(screen.getByText(en.response.loadingHints[0])).toBeVisible();
  expect(container.querySelectorAll('[aria-hidden="true"] span')).toHaveLength(5);
  act(() => vi.advanceTimersByTime(3_000));
  expect(screen.getByText(en.response.loadingHints[1])).toBeVisible();
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();
  unmount(); expect(vi.getTimerCount()).toBe(0);
});
