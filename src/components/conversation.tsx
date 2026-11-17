"use client";

import { useEffect, useId, useRef } from "react";
import type { ConversationProps } from "@/lib/contracts";
import { CoachResponse } from "./coach-response";
import styles from "./conversation.module.css";

export function Conversation({ turns, uiLocale, labels, status, announcement }: ConversationProps) {
  const id = useId();
  const liveRegion = useRef<HTMLDivElement>(null);
  const announced = useRef(new Set<string>());
  const eventId = announcement?.id;
  const eventText = announcement?.text;
  const urgency = announcement?.urgency;

  useEffect(() => {
    const region = liveRegion.current;
    if (!region) return;
    if (eventId === undefined) {
      region.replaceChildren();
      return;
    }
    if (announced.current.has(eventId)) return;
    announced.current.add(eventId);
    // History/status are deliberately not live. Only a new explicit event is
    // inserted here, including when two consecutive events have identical text.
    region.setAttribute("aria-live", urgency ?? "polite");
    region.setAttribute("role", urgency === "assertive" ? "alert" : "status");
    region.setAttribute("lang", uiLocale);
    region.setAttribute("dir", uiLocale === "ur" ? "rtl" : "ltr");
    region.replaceChildren(document.createTextNode(eventText ?? ""));
  }, [eventId, eventText, urgency, uiLocale]);

  return (
    <>
      <div className={styles.transcript}>
        {turns.map((turn, index) => turn.role === "user" ? (
          <section key={index} role="group" className={styles.parent} aria-labelledby={`${id}-user-${index}`}>
            <h2 id={`${id}-user-${index}`} className={styles.role} lang={uiLocale} dir={uiLocale === "ur" ? "rtl" : "ltr"}>
              {labels[uiLocale].user}
            </h2>
            <p className={styles.parentText} dir="auto">{turn.text}</p>
          </section>
        ) : (
          <CoachResponse key={index} response={turn.response} labels={labels[turn.response.locale]} />
        ))}
      </div>
      <div className={styles.feedback} lang={uiLocale} dir={uiLocale === "ur" ? "rtl" : "ltr"}>
        {status.kind === "loading" && <p>{labels[uiLocale].loading}</p>}
        {status.kind === "error" && <p className={styles.error}>{labels[uiLocale].errors[status.code]}</p>}
      </div>
      <div ref={liveRegion} className={styles.visuallyHidden} aria-live="polite" aria-atomic="true" />
    </>
  );
}
