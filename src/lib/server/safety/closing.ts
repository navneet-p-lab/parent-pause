/** Narrow, whole-message courtesy recognition. Classification/review still own safety. */
export function isClosingAcknowledgment(text: string): boolean {
  const value = text.normalize("NFKC").toLowerCase().trim().replace(/\s+/gu, " ")
    .replace(/^i (?:don't|don’t|dont|do not) know(?: to be honest)?[, .]*(?:but )/u, "");
  return [
    /^(?:(?:yes|yeah|ok|okay|great|alright)[, !]+)?(?:thanks|thank you)(?: (?:so much|very much))?(?: for (?:all )?(?:the |your )?(?:advice|advise|help|support|tips)(?: so far)?)?[.!]*$/u,
    /^(?:thanks|thank you)[, !]+(?:that|this) (?:really )?(?:helps|helped|was helpful|sounds good)[.!]*$/u,
    /^(?:ji[, !]+)?(?:shukriya|shukria|bohat shukriya|bohot shukriya)[.!]*$/u,
    /^(?:(?:جی|جی ہاں)[،, !]+)?(?:شکریہ|بہت شکریہ)(?:،? (?:مدد|مشورے) کے لیے شکریہ)?[۔.!]*$/u,
  ].some((pattern) => pattern.test(value));
}
