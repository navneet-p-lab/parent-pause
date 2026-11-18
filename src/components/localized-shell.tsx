"use client";

import { useEffect, useId } from "react";
import type { LocalizedShellProps } from "@/lib/contracts";
import { directionForLocale, updateDocumentLocale } from "@/lib/client/direction";
import { en } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";
import { LanguageSwitch } from "./language-switch";
import { SafetyNotice } from "./safety-notice";
import "@/styles/tokens.css";
import styles from "./localized-shell.module.css";

export function LocalizedShell({ locale, onLocaleChange, children, demo = false }: LocalizedShellProps & { demo?: boolean }) {
  const copy = locale === "ur" ? ur : en;
  const mainId = useId();
  const providerPrivacy = demo ? copy.demoProviderPrivacy : copy.providerPrivacy;
  useEffect(() => updateDocumentLocale(locale), [locale]);

  return (
    <div className={styles.shell} lang={locale} dir={directionForLocale(locale)}>
      <a className={styles.skipLink} href={`#${mainId}`}>{copy.skipToMain}</a>
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.brandMark} aria-hidden="true"><span /><span /></span>
          <div>
            <bdi className={styles.brand} dir="ltr">ParentPause</bdi>
            <p>{copy.descriptor}</p>
          </div>
        </div>
        <LanguageSwitch locale={locale} onLocaleChange={onLocaleChange} label={copy.languageLabel} />
      </header>
      <main id={mainId} className={styles.main} tabIndex={-1} aria-label={copy.mainLabel}>
        {demo && <p className={styles.preview}>{copy.demoNotice}</p>}
        {children}
        <SafetyNotice locale={locale} />
        <footer className={styles.privacy}>
          <p>{copy.privacy}</p>
          <p>{providerPrivacy.split("OpenAI")[0]}<bdi dir="ltr">OpenAI</bdi>{providerPrivacy.split("OpenAI")[1]}</p>
        </footer>
      </main>
    </div>
  );
}
