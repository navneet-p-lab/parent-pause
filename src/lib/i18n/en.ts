import type { ResponseLabels } from "@/lib/contracts";

export type UiDictionary = {
  skipToMain: string;
  mainLabel: string;
  descriptor: string;
  languageLabel: string;
  preview: string;
  privacy: string;
  providerPrivacy: string;
  emergencyLabel: string;
  emergency: string;
  emptyHeading: string;
  emptyDescription: string;
  suggestions: readonly [string, string, string];
  composerLabel: string;
  followUpLabel: string;
  replyLanguage: string;
  send: string;
  cancel: string;
  retry: string;
  clear: string;
  limit: string;
  emptyInput: string;
  overlongInput: string;
  characters: string;
  keyboardHint: string;
  clearHeading: string;
  clearDescription: string;
  keep: string;
  confirmClear: string;
  replyReady: string;
  cancelled: string;
  cleared: string;
  demoNotice: string;
  demoProviderPrivacy: string;
  response: ResponseLabels;
};

export const en = {
  skipToMain: "Skip to main content",
  mainLabel: "Parenting support",
  descriptor: "A little space for your next step",
  languageLabel: "Language",
  preview: "Assessment demo — brief support, not professional or emergency care.",
  privacy: "This page keeps your chat only until you reload or clear it. Avoid names and identifying details.",
  providerPrivacy: "For AI replies, messages are sent to OpenAI. Provider retention policies may apply.",
  emergencyLabel: "Emergency guidance",
  emergency: "If anyone is in immediate danger, contact local emergency help now. This app cannot provide emergency care.",
  emptyHeading: "Parenting can feel like a lot.",
  emptyDescription: "Take a breath. A small, practical next step can help.",
  suggestions: ["Bedtime feels difficult", "We argue about screens", "I lost my patience"],
  composerLabel: "What is on your mind?",
  followUpLabel: "What happened next?",
  replyLanguage: "Replies will be in English. You can write in English, Urdu or Roman Urdu.",
  send: "Find a next step",
  cancel: "Cancel",
  retry: "Try again",
  clear: "New conversation",
  limit: "This short conversation has reached its limit. Start a new conversation to continue.",
  emptyInput: "Write a little about your concern before sending.",
  overlongInput: "Please keep your message within the character limit.",
  characters: "characters",
  keyboardHint: "Enter adds a new line. Ctrl or Command + Enter sends.",
  clearHeading: "Start a new conversation?",
  clearDescription: "This clears these messages and your unsent text from this page.",
  keep: "Keep conversation",
  confirmClear: "Clear conversation",
  replyReady: "Your response is ready below.",
  cancelled: "Request cancelled. Your unsent text is still here.",
  cleared: "Conversation cleared.",
  demoNotice: "Demo responses — no AI call.",
  demoProviderPrivacy: "Messages are sent to this app’s server for a demo response, without an OpenAI call.",
  response: {
    user: "You",
    coach: "ParentPause",
    planHeading: "A small next step",
    clarificationHeading: "Let’s understand a little more",
    boundaryHeading: "Support within limits",
    escalationHeading: "Get support now",
    checkInHeading: "A quick check-in",
    loading: "Preparing your response…",
    errors: {
      INVALID_INPUT: "Please check your message and try again.",
      PAYLOAD_TOO_LARGE: "This conversation is too long to send. Start a new conversation.",
      RATE_LIMITED: "Too many requests. Please wait a little before trying again.",
      UNAVAILABLE: "I can’t make a reliable plan right now. Please try again. If anyone is in immediate danger, contact local emergency help now.",
      CONFIGURATION_ERROR: "Coaching is unavailable right now. If anyone is in immediate danger, contact local emergency help now.",
    },
  },
} satisfies UiDictionary;
