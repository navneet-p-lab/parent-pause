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
  welcomeEyebrow: string;
  welcomePrompt: string;
  threadHeading: string;
  inputPlaceholder: string;
  suggestions: readonly [string, string, string];
  composerLabel: string;
  followUpLabel: string;
  updateLabel: string;
  summarize: string;
  summaryMessage: string;
  pause: string;
  continueTalking: string;
  pauseMessage: string;
  continueMessage: string;
  replyLanguage: string;
  send: string;
  cancel: string;
  retry: string;
  clear: string;
  chatTab: string;
  historyTab: string;
  tabsLabel: string;
  historyHeading: string;
  historyDescription: string;
  historyEmpty: string;
  openConversation: string;
  deleteConversation: string;
  deleteHeading: string;
  deleteDescription: string;
  keepHistory: string;
  replies: string;
  reply: string;
  draftOnly: string;
  clearAll: string;
  clearAllHeading: string;
  clearAllDescription: string;
  storageUnavailable: string;
  storageInvalid: string;
  storageConflict: string;
  storageDeleteFailed: string;
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
  descriptor: "One moment. One small next step.",
  languageLabel: "Language",
  preview: "Assessment demo — brief support, not professional or emergency care.",
  privacy: "Chats and drafts are saved in this browser on this device. Clear saved conversations in History to remove them. Avoid names and identifying details.",
  providerPrivacy: "For AI replies, messages are sent to OpenAI. Provider retention policies may apply.",
  emergencyLabel: "Emergency guidance",
  emergency: "If anyone is in immediate danger, contact local emergency help now. This app cannot provide emergency care.",
  emptyHeading: "Parenting can feel like a lot.",
  emptyDescription: "You don’t have to figure it all out at once. Let’s find one small next step together.",
  welcomeEyebrow: "A LITTLE SPACE FOR YOU",
  welcomePrompt: "Share what happened, how you’re feeling, or what you’d like to try. A few words are enough to begin.",
  threadHeading: "Your conversation",
  inputPlaceholder: "For example, bedtime has been difficult and I’m feeling worn out…",
  suggestions: ["Bedtime feels difficult", "We argue about screens", "I lost my patience"],
  composerLabel: "What is on your mind?",
  followUpLabel: "What happened next?",
  updateLabel: "Share an update whenever you’re ready",
  summarize: "Summarize so far",
  summaryMessage: "Please summarize the advice so far.",
  pause: "Pause here",
  continueTalking: "Keep talking",
  pauseMessage: "Yes, let’s pause here.",
  continueMessage: "I’d like to keep talking.",
  replyLanguage: "Replies will be in English. You can write in English, Urdu or Roman Urdu.",
  send: "Find a next step",
  cancel: "Cancel",
  retry: "Try again",
  clear: "New conversation",
  chatTab: "Conversation",
  historyTab: "History",
  tabsLabel: "Conversation views",
  historyHeading: "A little space to look back",
  historyDescription: "Saved in this browser on this device. Open an earlier conversation to read it or continue where you left off.",
  historyEmpty: "No earlier conversations yet. Starting a new conversation moves your current one here.",
  openConversation: "Open conversation",
  deleteConversation: "Delete",
  deleteHeading: "Delete this conversation?",
  deleteDescription: "Its messages and unsent text will be removed from this page.",
  keepHistory: "Keep it",
  replies: "replies",
  reply: "reply",
  draftOnly: "Unsent draft",
  clearAll: "Clear saved conversations",
  clearAllHeading: "Clear all saved conversations?",
  clearAllDescription: "This deletes every conversation and draft from this browser, including your current chat.",
  storageUnavailable: "This browser could not save your latest changes. Keep this page open; recent messages may be lost after reload. Free browser storage or delete older chats, then try again.",
  storageInvalid: "Saved history could not be opened. It has not been overwritten. Clear saved conversations to reset it; new chats will stay only on this page until then.",
  storageConflict: "Saved history changed in another tab. This page has stopped saving to avoid overwriting it. Reload to open the latest saved version; unsaved changes on this page will be lost.",
  storageDeleteFailed: "This browser could not delete saved history. Remove this site’s data in your browser settings to finish deleting it.",
  limit: "This short conversation has reached its limit. Start a new conversation to continue.",
  emptyInput: "Write a little about your concern before sending.",
  overlongInput: "Please keep your message within the character limit.",
  characters: "characters",
  keyboardHint: "Enter adds a new line. Ctrl or Command + Enter sends.",
  clearHeading: "Start a new conversation?",
  clearDescription: "Your messages and unsent text will move to History, saved in this browser on this device.",
  keep: "Keep conversation",
  confirmClear: "Start new conversation",
  replyReady: "Your response is ready below.",
  cancelled: "Request cancelled. Your unsent text is still here.",
  cleared: "New conversation started. Your earlier conversation is in History.",
  demoNotice: "Demo responses — no AI call.",
  demoProviderPrivacy: "Messages are sent to this app’s server for a demo response, without an OpenAI call.",
  response: {
    user: "You",
    coach: "ParentPause",
    summaryHeading: "Your plan so far",
    planHeading: "A small next step",
    clarificationHeading: "Let’s understand a little more",
    boundaryHeading: "Support within limits",
    escalationHeading: "Get support now",
    pauseOfferHeading: "A little breathing room",
    pausedHeading: "Here whenever you need a moment",
    checkInHeading: "A quick check-in",
    loading: "Preparing your response…",
    loadingHints: ["Taking a moment with what you shared…", "Thinking through a helpful next step…", "Putting a thoughtful reply together…"],
    errors: {
      INVALID_INPUT: "Please check your message and try again.",
      PAYLOAD_TOO_LARGE: "This conversation is too long to send. Start a new conversation.",
      RATE_LIMITED: "Too many requests. Please wait a little before trying again.",
      UNAVAILABLE: "I can’t make a reliable plan right now. Please try again. If anyone is in immediate danger, contact local emergency help now.",
      CONFIGURATION_ERROR: "Coaching is unavailable right now. If anyone is in immediate danger, contact local emergency help now.",
    },
  },
} satisfies UiDictionary;
