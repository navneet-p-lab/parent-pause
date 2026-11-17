import type { Locale } from "@/lib/contracts";
import { en } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";
import { directionForLocale } from "@/lib/client/direction";
import styles from "./localized-shell.module.css";

export function SafetyNotice({ locale }: { locale: Locale }) {
  const copy = locale === "ur" ? ur : en;
  return <aside className={styles.safety} lang={locale} dir={directionForLocale(locale)} aria-label={copy.emergencyLabel}>{copy.emergency}</aside>;
}
