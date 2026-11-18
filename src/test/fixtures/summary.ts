import type { CoachResponse, Locale } from "@/lib/contracts";

export const summaryFixtures: Record<Locale, Extract<CoachResponse, { kind: "summary" }>> = {
  en: { kind: "summary", locale: "en", acknowledgment: "You’re welcome — here’s the plan so far.", steps: [
    "Choose one quiet activity together before bedtime.",
    "Agree on one small bedtime step together.",
  ] },
  ur: { kind: "summary", locale: "ur", acknowledgment: "کوئی بات نہیں، اب تک کے مشوروں کا خلاصہ یہ ہے۔", steps: [
    "سونے سے پہلے مل کر ایک پُرسکون سرگرمی چنیں۔",
    "مل کر سونے کی تیاری کا ایک چھوٹا قدم طے کریں۔",
  ] },
};
