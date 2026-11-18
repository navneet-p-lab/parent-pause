/** Courtesy + recap-only requests. Never match arbitrary medical/help requests. */
export function isSummaryRequest(text: string): boolean {
  const value = text.normalize("NFKC").toLowerCase().trim().replace(/\s+/gu, " ")
    .replace(/^i (?:don't|don’t|dont|do not) know(?: to be honest)?[, .]*(?:but )?/u, "")
    .replace(/^(?:thanks|thank you)(?: for (?:all )?(?:the |your )?(?:advice|advise|help|support|tips)(?: so far)?)?[, .!]*(?:and |but )?/u, "");
  return [
    /^(?:(?:can|cna|could|would) you (?:please )?|please )?(?:summari[sz]e|recap)(?: (?:so far|(?:the |our )?(?:conversation|discussion|plan|advice|steps)(?: so far)?|what (?:we(?:'ve|’ve| have) discussed|i should do)(?: (?:so far|till now))?|the things i should do(?: (?:so far|till now))?))?(?: please)?[?.!]*$/u,
    /^(?:shukriya[, .!]* )?(?:ab tak ki (?:baat|baaton|guftagu|salah) ka )?khulasa (?:kar dein|bata dein)[?.!]*$/u,
    /^(?:شکریہ[،,۔ !]* )?(?:اب تک کی (?:باتوں|گفتگو|تجاویز) کا )?خلاصہ (?:کر دیں|بتا دیں)[؟۔.!]*$/u,
  ].some((pattern) => pattern.test(value));
}
