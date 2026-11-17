import type { Locale } from "@/lib/contracts";

export function directionForLocale(locale: Locale): "ltr" | "rtl" {
  return locale === "ur" ? "rtl" : "ltr";
}

/** Call only from the mounted UI; never infer locale from a parent's text. */
export function updateDocumentLocale(locale: Locale, target: Document = document): void {
  target.documentElement.lang = locale;
  target.documentElement.dir = directionForLocale(locale);
}
