"use client";

import { useId, useRef, type RefObject } from "react";
import { countCodePoints, LIMITS } from "@/lib/contracts";
import type { UiDictionary } from "@/lib/i18n/en";
import styles from "./composer.module.css";

type ComposerProps = {
  copy: UiDictionary; draft: string; followUp: boolean; busy: boolean; limited: boolean;
  confirming: boolean; retry: boolean; validation: "empty" | "overlong" | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onDraft: (value: string) => void; onSend: () => void; onCancel: () => void;
};
export function Composer({ copy, draft, followUp, busy, limited, confirming, retry, validation, inputRef, onDraft, onSend, onCancel }: ComposerProps) {
  const id = useId();
  const composing = useRef(false);
  return (
    <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); if (!busy && !limited && !confirming && !composing.current) onSend(); }}>
      <label className={styles.label} htmlFor={id}>{followUp ? copy.followUpLabel : copy.composerLabel}</label>
      <p id={`${id}-language`} className={styles.hint}>{copy.replyLanguage}</p>
      <textarea id={id} ref={inputRef} value={draft} dir="auto" readOnly={busy || limited || confirming} rows={5}
        aria-invalid={validation !== null} aria-describedby={`${id}-language ${id}-count ${id}-keyboard${validation ? ` ${id}-error` : ""}${limited ? ` ${id}-limit` : ""}`}
        onChange={(event) => onDraft(event.target.value)}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
            event.preventDefault(); if (!busy && !limited && !confirming) onSend();
          }
        }} />
      <p id={`${id}-count`} className={styles.hint}><bdi dir="ltr">{countCodePoints(draft)} / {LIMITS.userCodePoints}</bdi> {copy.characters}</p>
      <p id={`${id}-keyboard`} className={styles.hint}>{copy.keyboardHint}</p>
      {validation && <p id={`${id}-error`} role="alert" className={styles.error}>{validation === "empty" ? copy.emptyInput : copy.overlongInput}</p>}
      {limited && <p id={`${id}-limit`}>{copy.limit}</p>}
      <div className={styles.actions}>
        <button className={styles.primary} type="submit" disabled={busy || limited || confirming}>{retry ? copy.retry : copy.send}</button>
        {busy && <button type="button" onClick={onCancel}>{copy.cancel}</button>}
      </div>
    </form>
  );
}
