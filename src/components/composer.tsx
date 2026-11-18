"use client";

import { useId, useRef, type RefObject } from "react";
import { countCodePoints, LIMITS } from "@/lib/contracts";
import type { UiDictionary } from "@/lib/i18n/en";
import styles from "./composer.module.css";

type ComposerProps = {
  copy: UiDictionary; draft: string; followUp: boolean; paused?: boolean; busy: boolean; limited: boolean;
  confirming: boolean; retry: boolean; validation: "empty" | "overlong" | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onDraft: (value: string) => void; onSend: () => void; onCancel: () => void;
};
export function Composer({ copy, draft, followUp, paused, busy, limited, confirming, retry, validation, inputRef, onDraft, onSend, onCancel }: ComposerProps) {
  const id = useId();
  const composing = useRef(false);
  return (
    <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); if (!busy && !limited && !confirming && !composing.current) onSend(); }}>
      <label className={styles.label} htmlFor={id}>{paused ? copy.updateLabel : followUp ? copy.followUpLabel : copy.composerLabel}</label>
      <p id={`${id}-language`} className={styles.hint}>{copy.replyLanguage}</p>
      <textarea id={id} ref={inputRef} value={draft} dir="auto" readOnly={busy || limited || confirming} rows={3}
        placeholder={!busy && !followUp ? copy.inputPlaceholder : undefined}
        aria-invalid={validation !== null} aria-describedby={`${id}-language ${id}-count ${id}-keyboard${validation ? ` ${id}-error` : ""}${limited ? ` ${id}-limit` : ""}`}
        onChange={(event) => onDraft(event.target.value)}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
            event.preventDefault(); if (!busy && !limited && !confirming) onSend();
          }
        }} />
      <div className={styles.inputMeta}>
        <p id={`${id}-count`} className={styles.hint}><bdi dir="ltr">{countCodePoints(draft)} / {LIMITS.userCodePoints}</bdi> {copy.characters}</p>
      </div>
      {validation && <p id={`${id}-error`} role="alert" className={styles.error}>{validation === "empty" ? copy.emptyInput : copy.overlongInput}</p>}
      {limited && <p id={`${id}-limit`}>{copy.limit}</p>}
      <div className={styles.actions}>
        <p id={`${id}-keyboard`} className={styles.hint}>{copy.keyboardHint}</p>
        <div className={styles.buttons}>
        {busy && <button type="button" onClick={onCancel}>{copy.cancel}</button>}
        <button className={styles.primary} type="submit" disabled={busy || limited || confirming}>{retry ? copy.retry : copy.send}
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
        </button>
        </div>
      </div>
    </form>
  );
}
