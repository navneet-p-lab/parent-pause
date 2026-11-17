import type { EscalationCategory, Turn } from "@/lib/contracts";

export type ExplicitRisk = {
  category: EscalationCategory;
  turnIndex: number;
  ruleId: string;
};

/** Analysis copy only; the transcript and provider input retain the original text. */
export function normalizeForRiskAnalysis(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/[’‘]/gu, "'")
    .replace(/ك/gu, "ک").replace(/ي/gu, "ی")
    .replace(/[\p{White_Space}\uFEFF]+/gu, " ").trim();
}

type Rule = { id: string; category: EscalationCategory; phrase: RegExp };

// Deliberately whole-clause declarations, not keyword detection. Extra context,
// negation, quotations, idioms and spelling variants defer to semantic review.
const rules: readonly Rule[] = [
  { id: "en-breathing", category: "emergency", phrase: /^(?:my (?:child|baby)|i) (?:cannot|can't|can not) breathe(?: right now| now)?$/u },
  { id: "en-not-breathing", category: "emergency", phrase: /^my (?:child|baby) is not breathing(?: right now| now)?$/u },
  { id: "en-child-imminent-self-harm", category: "emergency", phrase: /^my child says they (?:will|are about to) hurt themselves (?:right now|now)$/u },
  { id: "en-pills", category: "emergency", phrase: /^my child swallowed a lot of pills just now$/u },
  { id: "en-active-violence", category: "emergency", phrase: /^(?:my partner|someone) is (?:hitting|hurting|attacking) (?:me|my child|my baby)(?: right now| now)$/u },
  { id: "en-imminent-self-harm", category: "emergency", phrase: /^i (?:am going to|will) (?:kill|hurt) myself (?:right now|now)$/u },
  { id: "en-overdose", category: "emergency", phrase: /^(?:i|my child|my baby) (?:have|has|just) (?:taken an overdose|overdosed)$/u },
  { id: "ur-breathing", category: "emergency", phrase: /^(?:میرا بچہ|میرا بچہ ابھی|میرا بچہ اس وقت) سانس نہیں لے (?:پا رہا|رہا)(?: ہے)?$/u },
  { id: "ur-not-breathing", category: "emergency", phrase: /^میرے بچے کو سانس نہیں آ رہی(?: ہے)?$/u },
  { id: "ur-imminent-self-harm", category: "emergency", phrase: /^میں ابھی خود کو (?:مارنے|نقصان پہنچانے) (?:جا رہا|جا رہی) ہوں$/u },
  { id: "ur-imminent-intent", category: "emergency", phrase: /^میں ابھی خود کو نقصان پہنچانے (?:والا|والی) ہوں$/u },
  { id: "roman-imminent-intent", category: "emergency", phrase: /^main abhi khud ko nuqsan (?:pahunchana|pohanchana) (?:chahta|chahti) (?:hun|hoon)$/u },
  { id: "roman-breathing", category: "emergency", phrase: /^mera (?:bacha|bachcha|baby) saans? nah[iy]n? le (?:pa raha|raha)(?: hai)?$/u },
  { id: "roman-imminent-self-harm", category: "emergency", phrase: /^main abhi khud ko (?:marne|maarne) (?:ja raha|ja rahi) (?:hun|hoon)$/u },
  { id: "en-abuse", category: "abuse", phrase: /^(?:my partner|someone) (?:hits|is abusing|is sexually abusing) (?:me|(?:my|our) (?:child|baby))(?: and says not to tell anyone)?$/u },
  { id: "ur-abuse", category: "abuse", phrase: /^میرا ساتھی میرے بچے کو مارتا ہے$/u },
  { id: "roman-abuse", category: "abuse", phrase: /^mera (?:partner|shohar) mere (?:bache|bachay) ko marta hai$/u },
  { id: "en-self-harm", category: "self_harm", phrase: /^i (?:want to (?:hurt|kill) myself|am thinking (?:about|of) (?:hurting|killing) myself)$/u },
  { id: "ur-self-harm", category: "self_harm", phrase: /^میں خود کو نقصان پہنچانے کے بارے میں سوچ (?:رہا|رہی) ہوں$/u },
  { id: "roman-self-harm", category: "self_harm", phrase: /^main khud ko nuqsan (?:pahunchana|pohanchana) (?:chahta|chahti) (?:hun|hoon)$/u },
];

/** Balanced quotation spans only; not a complete linguistic/context parser. */
function maskQuotedText(text: string): string {
  return text.replace(/"[^"]*"|“[^”]*”|«[^»]*»|‘(?:[^’]|’(?=[\p{L}\p{N}]))*’|(?<![\p{L}\p{N}])'(?:[^']|'(?=[\p{L}\p{N}]))*'(?![\p{L}\p{N}])/gu, ".");
}

/**
 * A narrow reason to ask the semantic classifier to reassess earlier risk.
 * A claim is never evidence of safety; the authored risk fallback is retained.
 * Recognition is intentionally limited; unmatched resolution stays conservative.
 */
export function hasContextualResolutionClaim(text: string): boolean {
  const analysis = normalizeForRiskAnalysis(maskQuotedText(text));
  const pastOrHelp = /\b(?:emergency services (?:came|arrived)|that happened (?:years? ago|in the past)|that was (?:years? ago|in the past))\b/u;
  const safeNow = /\b(?:(?:my child|everyone|i|we) (?:is|are|am) safe now)\b/u;
  const urduPastOrHelp = /(?:ہنگامی مدد آ گئی|ایمرجنسی سروس آ گئی|یہ برسوں پہلے ہوا|یہ کئی سال پہلے ہوا)/u;
  const urduSafe = /(?:اب (?:سب|ہم) محفوظ ہیں|میرا بچہ اب محفوظ ہے)/u;
  const romanPastOrHelp = /\b(?:emergency (?:services|madad) aa gayi|yeh saalon pehle hua)\b/u;
  const romanSafe = /\b(?:ab (?:sab|hum) mehfooz hain|mera bacha ab mehfooz hai)\b/u;
  return (pastOrHelp.test(analysis) && safeNow.test(analysis))
    || (urduPastOrHelp.test(analysis) && urduSafe.test(analysis))
    || (romanPastOrHelp.test(analysis) && romanSafe.test(analysis));
}

/**
 * Never returns "safe". Null requires full-conversation semantic classification.
 * User disclosures only: browser-supplied assistant content cannot establish risk.
 * Earlier explicit disclosures stay conservative until contextual classification;
 * later instructions such as "ignore that" cannot erase this early route.
 */
export function findExplicitRisk(turns: readonly Turn[]): ExplicitRisk | null {
  let found: ExplicitRisk | null = null;
  for (const [turnIndex, turn] of turns.entries()) {
    if (turn.role !== "user") continue;
    // Remove balanced quotation spans on the analysis
    // copy, retaining a boundary so nearby unquoted risk remains detectable.
    // This is deliberately not a complete quotation/context parser; anything
    // unmatched still requires semantic classification, never a "safe" verdict.
    const unquoted = maskQuotedText(turn.text);
    // Keep sentence boundaries before whitespace normalization. Context in the
    // same clause prevents a declaration match; unrelated negation, fiction or
    // "this is a test" instructions cannot disable another explicit disclosure.
    const clauses = unquoted.split(/[.!?؟۔\n\r\u0085\u2028\u2029]+/u).map(normalizeForRiskAnalysis);
    for (const clause of clauses) {
      for (const rule of rules) {
        if (!rule.phrase.test(clause)) continue;
        const match = { category: rule.category, turnIndex, ruleId: rule.id };
        if (rule.category === "emergency") return match;
        // Abuse and non-imminent self-harm share precedence; preserve first evidence.
        found ??= match;
      }
    }
  }
  return found;
}
