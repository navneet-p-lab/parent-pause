"use client";

import type { Locale } from "@/lib/contracts";
import styles from "./localized-shell.module.css";

type LanguageSwitchProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  label: string;
};

export function LanguageSwitch({ locale, onLocaleChange, label }: LanguageSwitchProps) {
  return (
    <div className={styles.languageSwitch} role="group" aria-label={label}>
      <button type="button" lang="en" dir="ltr" aria-pressed={locale === "en"} onClick={() => onLocaleChange("en")}>English</button>
      <button type="button" lang="ur" dir="rtl" aria-pressed={locale === "ur"} onClick={() => onLocaleChange("ur")}>اردو</button>
    </div>
  );
}
