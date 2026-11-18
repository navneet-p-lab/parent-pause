// @vitest-environment jsdom
import { StrictMode } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CoachResponse } from "@/components/coach-response";
import { Conversation } from "@/components/conversation";
import type { CoachResponse as Response, ConversationProps, Locale, ResponseLabels, Turn } from "@/lib/contracts";
import { failureCodeSchema } from "@/lib/contracts";
import { responseFixtures } from "@/test/fixtures/contracts";

afterEach(cleanup);

// Renderer-only labels: T02 owns the actual dictionaries and can run in parallel.
const labels: Record<Locale, ResponseLabels> = {
  en: {
    user: "You", coach: "ParentPause coach", planHeading: "A small plan", summaryHeading: "Your plan so far",
    clarificationHeading: "A little more context", boundaryHeading: "Professional support",
    escalationHeading: "Get support now", checkInHeading: "Check-in", loading: "Preparing a reply…",
    pauseOfferHeading: "Breathing room", pausedHeading: "Paused",
    loadingHints: ["Thinking…", "Considering…", "Preparing…"],
    errors: {
      INVALID_INPUT: "Check your message.", PAYLOAD_TOO_LARGE: "Your message is too long.",
      RATE_LIMITED: "Please wait before trying again.", UNAVAILABLE: "A reply is unavailable.",
      CONFIGURATION_ERROR: "The service is unavailable.",
    },
  },
  ur: {
    user: "آپ", coach: "پرینٹ پاز رہنما", planHeading: "ایک چھوٹا منصوبہ", summaryHeading: "اب تک کا منصوبہ",
    clarificationHeading: "تھوڑی مزید وضاحت", boundaryHeading: "ماہرانہ مدد",
    escalationHeading: "ابھی مدد حاصل کریں", checkInHeading: "ایک سوال", loading: "جواب تیار ہو رہا ہے۔",
    pauseOfferHeading: "ذرا ٹھہریں", pausedHeading: "وقفہ",
    loadingHints: ["سوچ رہے ہیں…", "غور ہو رہا ہے…", "تیار ہو رہا ہے…"],
    errors: {
      INVALID_INPUT: "اپنا پیغام دیکھیں۔", PAYLOAD_TOO_LARGE: "پیغام بہت طویل ہے۔",
      RATE_LIMITED: "دوبارہ کوشش سے پہلے انتظار کریں۔", UNAVAILABLE: "جواب دستیاب نہیں۔",
      CONFIGURATION_ERROR: "سروس دستیاب نہیں۔",
    },
  },
};

const headingFor = (response: Response) => ({
  plan: labels[response.locale].planHeading,
  summary: labels[response.locale].summaryHeading,
  clarify: labels[response.locale].clarificationHeading,
  boundary: labels[response.locale].boundaryHeading,
  escalation: labels[response.locale].escalationHeading,
  pause_offer: labels[response.locale].pauseOfferHeading,
  paused: labels[response.locale].pausedHeading,
})[response.kind];

describe.each(["en", "ur"] as const)("%s response cards", (locale) => {
  test.each(["plan", "clarify", "boundary", "escalation"] as const)("renders %s with one check-in and its own locale", (kind) => {
    const response = responseFixtures[locale][kind];
    const { container } = render(<CoachResponse response={response} labels={labels[locale]} />);
    const article = screen.getByRole("article", { name: headingFor(response) });
    expect(article).toHaveAttribute("lang", locale);
    expect(article).toHaveAttribute("dir", locale === "ur" ? "rtl" : "ltr");
    expect(within(article).getByText(labels[locale].coach)).toBeVisible();
    const checkIn = within(article).getAllByRole("group", { name: labels[locale].checkInHeading });
    expect(checkIn).toHaveLength(1);
    expect(within(checkIn[0]).getByText(response.checkIn.text)).toBeVisible();
    expect(container.querySelectorAll('[aria-live], [role="alert"], [role="status"]')).toHaveLength(0);
    if (kind === "plan") {
      const list = article.querySelector("ol")!;
      expect(within(list).getAllByRole("listitem").map((item) => item.textContent)).toEqual(responseFixtures[locale].plan.steps);
      expect(article.querySelector("ul")).toBeNull();
    } else if (kind === "escalation") {
      expect(article.querySelector("ol")).toBeNull();
      expect(within(article).queryByRole("heading", { name: labels[locale].planHeading })).toBeNull();
      expect(within(article.querySelector("ul")!).getAllByRole("listitem").map((item) => item.textContent)).toEqual(responseFixtures[locale].escalation.actions);
      expect(article.querySelector('[aria-hidden="true"]')).toHaveTextContent("⚠");
    } else {
      expect(article.querySelector("ol, ul")).toBeNull();
    }
    if (response.kind === "boundary") expect(within(article).getByText(response.alternative)).toBeVisible();
    const mainText = "acknowledgment" in response ? response.acknowledgment : response.message;
    expect(within(article).getByText(mainText)).toBeVisible();
  });

  test.each(["emergency", "abuse", "self_harm"] as const)("keeps %s escalation as unnumbered support", (category) => {
    const response = { ...responseFixtures[locale].escalation, category };
    const { container } = render(<CoachResponse response={response} labels={labels[locale]} />);
    expect(screen.getByRole("article", { name: labels[locale].escalationHeading })).toBeVisible();
    expect(container.querySelector("ol")).toBeNull();
    expect(container.querySelector("ul")).not.toBeNull();
  });
});

test.each(["plan", "clarify", "boundary", "escalation"] as const)("renders hostile %s fields as literal text", (kind) => {
  const hostile = '<img src=x onerror="window.pwned=true"><script>alert(1)</script> [help](https://evil.invalid)';
  const base = responseFixtures.en[kind];
  let response: Response;
  switch (base.kind) {
    case "plan": response = { ...base, acknowledgment: hostile, steps: [hostile, hostile], checkIn: { kind: "question", text: hostile } }; break;
    case "clarify": response = { ...base, acknowledgment: hostile, checkIn: { kind: "question", text: hostile } }; break;
    case "boundary": response = { ...base, message: hostile, alternative: hostile, checkIn: { kind: "question", text: hostile } }; break;
    case "escalation": response = { ...base, message: hostile, actions: [hostile], checkIn: { kind: "question", text: hostile } }; break;
  }
  const { container } = render(<CoachResponse response={response} labels={labels.en} />);
  expect(screen.getAllByText(hostile).length).toBeGreaterThan(1);
  expect(container.querySelector("img, script, a")).toBeNull();
});

const transcript: Turn[] = [
  { role: "user", text: "Bedtime at 8:30 مشکل ہے۔" },
  { role: "assistant", response: responseFixtures.en.plan },
  { role: "user", text: "اب ۹:۱۵ ہے، I tried it." },
  { role: "assistant", response: responseFixtures.ur.clarify },
];
const conversationProps: ConversationProps = { turns: transcript, uiLocale: "en", labels, status: { kind: "idle" }, announcement: null };

test("repeated parents and check-ins retain heading context without creating duplicate navigation landmarks", () => {
  render(<Conversation {...conversationProps} turns={[
    { role: "user", text: "First concern." },
    { role: "assistant", response: responseFixtures.en.plan },
    { role: "user", text: "Second concern." },
    { role: "assistant", response: responseFixtures.en.plan },
  ]} />);
  expect(screen.getAllByRole("group", { name: labels.en.user })).toHaveLength(2);
  expect(screen.getAllByRole("group", { name: labels.en.checkInHeading })).toHaveLength(2);
  expect(screen.getAllByRole("heading", { name: labels.en.checkInHeading })).toHaveLength(2);
  expect(screen.queryAllByRole("region")).toHaveLength(0);
});

test("preserves chronology, original parent text and historical response locales after a UI language switch", () => {
  const { container, rerender } = render(<Conversation {...conversationProps} />);
  const before = Array.from(container.querySelectorAll("article"));
  const firstParent = screen.getByText("Bedtime at 8:30 مشکل ہے۔");
  const secondParent = screen.getByText("اب ۹:۱۵ ہے، I tried it.");
  expect(firstParent).toHaveAttribute("dir", "auto");
  expect(secondParent).toHaveAttribute("dir", "auto");
  expect(firstParent.compareDocumentPosition(before[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(before[0].compareDocumentPosition(secondParent) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(secondParent.compareDocumentPosition(before[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  rerender(<Conversation {...conversationProps} uiLocale="ur" />);
  expect(screen.getAllByRole("heading", { name: labels.ur.user })).toHaveLength(2);
  expect(before[0]).toHaveAttribute("lang", "en");
  expect(before[0]).toHaveAttribute("dir", "ltr");
  expect(before[1]).toHaveAttribute("lang", "ur");
  expect(before[1]).toHaveAttribute("dir", "rtl");
  expect(within(before[0]).getByText(labels.en.coach)).toBeVisible();
  expect(within(before[1]).getByText(labels.ur.coach)).toBeVisible();
  expect(firstParent.textContent).toBe("Bedtime at 8:30 مشکل ہے۔");
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("preserves long Urdu, joining characters, newlines and mixed digits without truncation", () => {
  const text = "بچے کے ساتھ بات 8:30 پر ہوئی، اب ۹:۱۵ ہے۔\n".repeat(20) + "می\u200cں";
  render(<Conversation {...conversationProps} turns={[{ role: "user", text }]} uiLocale="ur" />);
  const parent = screen.getByRole("heading", { name: labels.ur.user }).nextElementSibling!;
  expect(parent).toHaveAttribute("dir", "auto");
  expect(parent.textContent).toBe(text);
});

test("preserves long Urdu response fields and embedded English/digits in their response direction", () => {
  const acknowledgment = "آپ نے بچے کے ساتھ 8:30 پر بات کی۔ ".repeat(4);
  const step = "مل کر ایک چھوٹا قدم طے کریں، وقت ۹:۱۵ ہے۔ ".repeat(3);
  const response: Response = {
    ...responseFixtures.ur.plan,
    acknowledgment,
    steps: [step, "Bedtime پر پُرسکون سرگرمی چننے دیں۔"],
  };
  render(<CoachResponse response={response} labels={labels.ur} />);
  const article = screen.getByRole("article", { name: labels.ur.planHeading });
  expect(article).toHaveAttribute("dir", "rtl");
  expect(within(article).getByText(acknowledgment.trim())).toHaveTextContent(acknowledgment.trim());
  const items = within(article).getAllByRole("listitem");
  expect(items[0].textContent).toBe(step);
  expect(items[1].textContent).toBe(response.steps[1]);
});

test.each(["en", "ur"] as const)("shows localized %s loading and every failure without creating coach turns or automatic duplicate alerts", (uiLocale) => {
  const { container, rerender } = render(<Conversation {...conversationProps} turns={[]} uiLocale={uiLocale} status={{ kind: "loading" }} />);
  expect(screen.getByText(labels[uiLocale].loading)).toBeVisible();
  for (const code of failureCodeSchema.options) {
    rerender(<Conversation {...conversationProps} turns={[]} uiLocale={uiLocale} status={{ kind: "error", code }} />);
    expect(screen.getByText(labels[uiLocale].errors[code])).toBeVisible();
    expect(container.querySelector("article")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText(labels[uiLocale].loading)).toBeNull();
  }
});

test("announces each explicit event once, without rereading history on rerenders, locale changes or repeated IDs", () => {
  const { container, rerender } = render(<Conversation {...conversationProps} />);
  const live = container.querySelector('[aria-live]')!;
  const replace = vi.spyOn(live, "replaceChildren");
  const event = { id: "reply-1", text: "A reply is ready.", urgency: "polite" as const };
  rerender(<Conversation {...conversationProps} announcement={event} />);
  expect(screen.getByRole("status")).toHaveTextContent(event.text);
  expect(live).toHaveAttribute("lang", "en");
  expect(replace).toHaveBeenCalledTimes(1);
  rerender(<Conversation {...conversationProps} uiLocale="ur" turns={[...transcript]} announcement={{ ...event }} />);
  rerender(<Conversation {...conversationProps} announcement={{ ...event, text: "Changed text for the same event." }} />);
  expect(replace).toHaveBeenCalledTimes(1);
  expect(live.textContent).toBe(event.text);
  expect(live).toHaveAttribute("lang", "en");
  // Identical copy is still a new announcement if its event ID changes.
  rerender(<Conversation {...conversationProps} announcement={{ ...event, id: "reply-2" }} />);
  expect(replace).toHaveBeenCalledTimes(2);
  rerender(<Conversation {...conversationProps} uiLocale="ur" announcement={{ id: "reply-ur", text: "جواب تیار ہے۔", urgency: "polite" }} />);
  expect(live).toHaveAttribute("lang", "ur");
  expect(live).toHaveAttribute("dir", "rtl");
  rerender(<Conversation {...conversationProps} announcement={{ id: "risk-1", text: "Get support now.", urgency: "assertive" }} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Get support now.");
  expect(container.querySelectorAll('[aria-live]')).toHaveLength(1);
  expect(replace).toHaveBeenCalledTimes(4);
  rerender(<Conversation {...conversationProps} announcement={null} />);
  expect(live.textContent).toBe("");
  rerender(<Conversation {...conversationProps} announcement={event} />);
  expect(live.textContent).toBe("");
});

test("does not repeat an announcement when React checks effects twice in Strict Mode", () => {
  const replace = vi.spyOn(Element.prototype, "replaceChildren");
  const { container } = render(<StrictMode><Conversation {...conversationProps} announcement={{ id: "strict-1", text: "Ready.", urgency: "polite" }} /></StrictMode>);
  expect(screen.getByRole("status")).toHaveTextContent("Ready.");
  expect(container.querySelectorAll('[aria-live]')).toHaveLength(1);
  expect(replace.mock.contexts.filter((node) => node instanceof Element && node.hasAttribute("aria-live"))).toHaveLength(1);
});
