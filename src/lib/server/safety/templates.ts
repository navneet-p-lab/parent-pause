import {
  coachResponseSchema,
  type CoachResponse,
  type EscalationCategory,
  type Locale,
} from "@/lib/contracts";

type Escalation = Extract<CoachResponse, { kind: "escalation" }>;
type Boundary = Extract<CoachResponse, { kind: "boundary" }>;

/** Authored from planning/05-safety.md. Urdu remains a native-review draft. */
const escalations = {
  en: {
    emergency: {
      kind: "escalation", locale: "en", category: "emergency",
      message: "I’m glad you told me. This needs immediate human help; I can’t provide emergency care.",
      actions: [
        "Contact your local emergency service now. Don’t wait for a reply here.",
        "If safe, ask a trusted person nearby to stay with you or your child.",
      ],
      checkIn: { kind: "question", text: "Can you contact emergency help now?" },
    },
    abuse: {
      kind: "escalation", locale: "en", category: "abuse",
      message: "Thank you for telling me. You and your child deserve support. I can’t provide safeguarding care.",
      actions: [
        "If anyone is in immediate danger, contact your local emergency service now. Don’t wait here.",
        "Seek a trusted local safeguarding or child-protection professional promptly.",
        "Avoid confronting the person causing harm; seek support where it is safe.",
      ],
      checkIn: { kind: "question", text: "Are you and your child safe right now?" },
    },
    self_harm: {
      kind: "escalation", locale: "en", category: "self_harm",
      message: "I’m glad you told me. You deserve support with this. I can’t provide crisis care.",
      actions: [
        "Contact a trusted person and qualified local crisis or mental-health support now.",
        "If you or anyone else is in immediate danger, contact your local emergency service now. Don’t wait here.",
      ],
      checkIn: { kind: "question", text: "Are you safe right now?" },
    },
  },
  ur: {
    emergency: {
      kind: "escalation", locale: "ur", category: "emergency",
      message: "آپ نے بتایا، یہ اہم ہے۔ اس صورت حال میں فوری انسانی مدد کی ضرورت ہے۔ میں ہنگامی مدد فراہم نہیں کر سکتا۔",
      actions: [
        "ابھی اپنی مقامی ایمرجنسی سروس سے رابطہ کریں۔ یہاں جواب کا انتظار نہ کریں۔",
        "اگر محفوظ ہو تو کسی قابلِ اعتماد قریبی شخص کو اپنے یا اپنے بچے کے پاس رہنے کے لیے بلائیں۔",
      ],
      checkIn: { kind: "question", text: "کیا آپ ابھی ہنگامی مدد سے رابطہ کر سکتے ہیں؟" },
    },
    abuse: {
      kind: "escalation", locale: "ur", category: "abuse",
      message: "یہ بات بتانے کا شکریہ۔ آپ اور آپ کا بچہ مدد کے حق دار ہیں۔ میں تحفظ کے ماہر کی جگہ نہیں لے سکتا۔",
      actions: [
        "اگر کسی کو فوری خطرہ ہے تو ابھی مقامی ایمرجنسی سروس سے رابطہ کریں۔ یہاں انتظار نہ کریں۔",
        "جلد کسی قابلِ اعتماد مقامی ماہر سے رابطہ کریں جو بچوں کے تحفظ کے لیے کام کرتا ہو۔",
        "نقصان پہنچانے والے شخص کا سامنا کرنے سے گریز کریں؛ جہاں محفوظ ہو وہاں مدد لیں۔",
      ],
      checkIn: { kind: "question", text: "کیا آپ اور آپ کا بچہ اس وقت محفوظ ہیں؟" },
    },
    self_harm: {
      kind: "escalation", locale: "ur", category: "self_harm",
      message: "آپ نے بتایا، یہ اہم ہے۔ آپ مدد کے حق دار ہیں۔ میں بحران میں انسانی مدد کی جگہ نہیں لے سکتا۔",
      actions: [
        "ابھی کسی قابلِ اعتماد شخص اور مقامی مستند ذہنی صحت یا بحران میں مدد دینے والے ماہر سے رابطہ کریں۔",
        "اگر آپ یا کسی اور کو فوری خطرہ ہے تو ابھی مقامی ایمرجنسی سروس سے رابطہ کریں۔ یہاں انتظار نہ کریں۔",
      ],
      checkIn: { kind: "question", text: "کیا آپ اس وقت محفوظ ہیں؟" },
    },
  },
} satisfies Record<Locale, Record<EscalationCategory, Escalation>>;

const boundaries = {
  en: {
    kind: "boundary", locale: "en",
    message: "I can’t diagnose, recommend medication, or give medical or legal instructions. Please speak with a qualified clinician or legal professional as appropriate.",
    alternative: "I can help you organize observations and questions for that conversation.",
    checkIn: { kind: "question", text: "What would you like to ask a qualified professional?" },
  },
  ur: {
    kind: "boundary", locale: "ur",
    message: "میں تشخیص، دوا کا مشورہ یا طبی اور قانونی ہدایات نہیں دے سکتا۔ ضرورت کے مطابق کسی مستند معالج یا قانونی ماہر سے بات کریں۔",
    alternative: "میں اس گفتگو کے لیے مشاہدات اور سوالات ترتیب دینے میں مدد کر سکتا ہوں۔",
    checkIn: { kind: "question", text: "آپ مستند ماہر سے کیا پوچھنا چاہیں گے؟" },
  },
} satisfies Record<Locale, Boundary>;

/** Failure is UI guidance, never a fabricated assistant turn or generated text. */
export const failureGuidance = {
  en: "I can’t make a reliable plan right now. Please try again. If anyone is in immediate danger, contact local emergency help now.",
  ur: "میں اس وقت قابلِ اعتماد منصوبہ نہیں بنا سکتا۔ دوبارہ کوشش کریں۔ اگر کسی کو فوری خطرہ ہے تو ابھی مقامی ہنگامی مدد سے رابطہ کریں۔",
} satisfies Record<Locale, string>;

// Parse on retrieval to enforce the complete contract and return an independent copy.
export function authoredEscalation(locale: Locale, category: EscalationCategory): Escalation {
  return coachResponseSchema.parse(escalations[locale][category]) as Escalation;
}

export function authoredBoundary(locale: Locale): Boundary {
  return coachResponseSchema.parse(boundaries[locale]) as Boundary;
}

/** Conversation control copy; pausing does not schedule updates or monitor a conversation. */
export function authoredPause(locale: Locale, confirmed: boolean): Extract<CoachResponse, { kind: "pause_offer" | "paused" }> {
  const response = confirmed
    ? { kind: "paused", locale, message: locale === "en"
      ? "We can leave it here for now. You’re welcome to share an update in this conversation whenever you like."
      : "فی الحال یہیں ٹھہرتے ہیں۔ جب چاہیں، اسی گفتگو میں نئی بات بتا سکتے ہیں۔" }
    : { kind: "pause_offer", locale, acknowledgment: locale === "en"
      ? "I’m glad this feels helpful. There’s no pressure to keep going."
      : "خوشی ہے کہ یہ بات مددگار لگی۔ گفتگو جاری رکھنا ضروری نہیں۔",
      checkIn: { kind: "question", text: locale === "en" ? "Would you like to pause here?" : "کیا آپ یہیں وقفہ لینا چاہیں گے؟" } };
  return coachResponseSchema.parse(response) as Extract<CoachResponse, { kind: "pause_offer" | "paused" }>;
}
