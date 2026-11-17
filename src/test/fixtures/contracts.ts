import type { CoachRequest, CoachResponse, Locale } from "@/lib/contracts";

export const REQUEST_ID = "8fb7f12a-e62b-4b45-a072-7f88d7811e64";
type ResponseFixtures = { [K in CoachResponse["kind"]]: Extract<CoachResponse, { kind: K }> };

/** Synthetic examples, not reviewed coaching/safety templates. Urdu is draft. */
export const responseFixtures = {
  en: {
    plan: {
      kind: "plan", locale: "en", acknowledgment: "Bedtime sounds tiring for both of you.",
      steps: ["Offer two quiet activities to choose from.", "Agree on one small bedtime step together."],
      checkIn: { kind: "question", text: "Which quiet activity might work tonight?" },
    },
    clarify: {
      kind: "clarify", locale: "en", acknowledgment: "It sounds like a difficult moment.",
      checkIn: { kind: "question", text: "What happened just before the disagreement?" },
    },
    boundary: {
      kind: "boundary", locale: "en", message: "I cannot diagnose or recommend medication. Please ask a qualified clinician.",
      alternative: "I can help you organize observations and questions for that conversation.",
      checkIn: { kind: "question", text: "What would you like to ask the clinician?" },
    },
    escalation: {
      kind: "escalation", locale: "en", category: "emergency",
      message: "I’m glad you told me. This needs immediate human help; I can’t provide emergency care.",
      actions: ["Contact your local emergency service now. Don’t wait for a reply here.", "If safe, ask a trusted person nearby to stay with you or your child."],
      checkIn: { kind: "question", text: "Can you contact emergency help now?" },
    },
  },
  ur: {
    plan: {
      kind: "plan", locale: "ur", acknowledgment: "سونے کا وقت آپ دونوں کے لیے تھکا دینے والا لگتا ہے۔",
      steps: ["دو پُرسکون سرگرمیوں میں سے ایک چننے دیں۔", "مل کر سونے کی تیاری کا ایک چھوٹا قدم طے کریں۔"],
      checkIn: { kind: "question", text: "آج رات کون سی پُرسکون سرگرمی مدد دے سکتی ہے؟" },
    },
    clarify: {
      kind: "clarify", locale: "ur", acknowledgment: "یہ ایک مشکل لمحہ لگتا ہے۔",
      checkIn: { kind: "question", text: "اختلاف سے ذرا پہلے کیا ہوا تھا؟" },
    },
    boundary: {
      kind: "boundary", locale: "ur", message: "میں تشخیص یا دوا کا مشورہ نہیں دے سکتا۔ کسی مستند معالج سے بات کریں۔",
      alternative: "میں اس گفتگو کے لیے مشاہدات اور سوالات ترتیب دینے میں مدد کر سکتا ہوں۔",
      checkIn: { kind: "question", text: "آپ معالج سے کیا پوچھنا چاہیں گے؟" },
    },
    escalation: {
      kind: "escalation", locale: "ur", category: "emergency",
      message: "آپ نے بتایا، یہ اہم ہے۔ اس صورت حال میں فوری انسانی مدد کی ضرورت ہے۔ میں ہنگامی مدد فراہم نہیں کر سکتا۔",
      actions: ["ابھی اپنی مقامی ایمرجنسی سروس سے رابطہ کریں۔ یہاں جواب کا انتظار نہ کریں۔", "اگر محفوظ ہو تو کسی قابلِ اعتماد قریبی شخص کو اپنے یا اپنے بچے کے پاس رہنے کے لیے بلائیں۔"],
      checkIn: { kind: "question", text: "کیا آپ ابھی ہنگامی مدد سے رابطہ کر سکتے ہیں؟" },
    },
  },
} satisfies Record<Locale, ResponseFixtures>;

export const requestFixtures = {
  en: { requestId: REQUEST_ID, locale: "en", turns: [{ role: "user", text: "Bedtime is difficult. سونے کا وقت مشکل ہے۔" }] },
  ur: { requestId: REQUEST_ID, locale: "ur", turns: [{ role: "user", text: "Mera bacha bedtime par pareshan hota hai، وقت 8:30 ہے۔" }] },
} satisfies Record<Locale, CoachRequest>;
