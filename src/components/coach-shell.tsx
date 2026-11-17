"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { Locale } from "@/lib/contracts";
import { conversationReducer, initialConversation, MAX_EXCHANGES } from "@/lib/client/conversation-reducer";
import { CoachClientError, sendCoach } from "@/lib/client/coach-client";
import { en } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";
import { LocalizedShell } from "./localized-shell";
import { Conversation } from "./conversation";
import { Composer } from "./composer";
import styles from "./coach-shell.module.css";

export function CoachShell({ demo = false, client = sendCoach }: { demo?: boolean; client?: typeof sendCoach }) {
  const [state, dispatch] = useReducer(conversationReducer, undefined, initialConversation);
  const [confirming, setConfirming] = useState(false);
  const active = useRef<{ requestId: string; controller: AbortController } | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const copy = state.locale === "en" ? en : ur;
  const limited = state.turns.length / 2 >= MAX_EXCHANGES;

  const invalidate = () => { const previous = active.current; active.current = null; previous?.controller.abort(); };
  useEffect(() => () => { const previous = active.current; active.current = null; previous?.controller.abort(); }, []);
  useEffect(() => {
    if (confirming) { keep.current?.focus({ preventScroll: true }); return; }
    if (state.event?.kind === "cleared" || (["reply", "cancelled"].includes(state.event?.kind ?? "") && textarea.current?.form?.contains(document.activeElement))) {
      textarea.current?.focus({ preventScroll: true });
    }
  }, [confirming, state.event]);

  async function send() {
    if (active.current || state.pending || confirming || limited) return;
    const requestId = crypto.randomUUID();
    const next = conversationReducer(state, { type: "start", requestId });
    dispatch({ type: "start", requestId });
    if (!next.pending) return;
    // Keep focus in the editing area before the clicked send button disables.
    textarea.current?.focus({ preventScroll: true });
    const controller = new AbortController();
    const current = { requestId, controller };
    active.current = current;
    try {
      const value = await client(next.pending, controller.signal);
      if (active.current !== current || controller.signal.aborted) return;
      dispatch({ type: "success", requestId, value });
    } catch (error) {
      if (active.current !== current || controller.signal.aborted) return;
      dispatch({ type: "failure", requestId, failure: error instanceof CoachClientError ? error.failure
        : { requestId, code: "UNAVAILABLE", retryable: true } });
    } finally { if (active.current === current) active.current = null; }
  }
  const changeLocale = (locale: Locale) => {
    if (locale !== state.locale) { invalidate(); setConfirming(false); dispatch({ type: "locale", locale }); }
  };
  const cancel = () => { const current = active.current; textarea.current?.focus({ preventScroll: true }); invalidate(); if (current) dispatch({ type: "cancel", requestId: current.requestId }); };
  const clear = () => { invalidate(); setConfirming(false); dispatch({ type: "clear", eventId: crypto.randomUUID() }); };
  const event = state.event;
  const eventText = event?.kind === "loading" ? copy.response.loading : event?.kind === "reply" ? `${event.urgent ? `${copy.response.escalationHeading}. ` : ""}${copy.replyReady}`
    : event?.kind === "error" && state.failure ? copy.response.errors[state.failure.code]
    : event?.kind === "cancelled" ? copy.cancelled : event?.kind === "cleared" ? copy.cleared : "";
  return (
    <LocalizedShell locale={state.locale} onLocaleChange={changeLocale} demo={demo}>
      <h1>{copy.emptyHeading}</h1>
      {!state.turns.length && !state.pending && <>
        <p>{copy.emptyDescription}</p>
        <div className={styles.suggestions}>
          {copy.suggestions.map((text) => <button key={text} type="button" disabled={confirming} onClick={() => { dispatch({ type: "draft", text }); textarea.current?.focus({ preventScroll: true }); }}>{text}</button>)}
        </div>
      </>}
      <Conversation turns={state.pending?.turns ?? state.turns} uiLocale={state.locale} labels={{ en: en.response, ur: ur.response }}
        status={state.pending ? { kind: "loading" } : state.failure ? { kind: "error", code: state.failure.code } : { kind: "idle" }}
        announcement={event ? { id: event.id, text: eventText, urgency: event.urgent ? "assertive" : "polite" } : null} />
      <Composer copy={copy} draft={state.draft} followUp={state.turns.length > 0} busy={state.pending !== null} limited={limited}
        confirming={confirming} retry={state.failure?.retryable === true} validation={state.validation} inputRef={textarea}
        onDraft={(text) => dispatch({ type: "draft", text })} onSend={() => { void send(); }} onCancel={cancel} />
      {(state.draft || state.turns.length || state.pending) && !confirming ? <button className={styles.clear} type="button" onClick={() => setConfirming(true)}>{copy.clear}</button> : null}
      {confirming && <section role="group" className={styles.confirmation} aria-labelledby="clear-heading">
        <h2 id="clear-heading">{copy.clearHeading}</h2><p>{copy.clearDescription}</p>
        <div className={styles.suggestions}>
          <button ref={keep} type="button" onClick={() => { setConfirming(false); textarea.current?.focus({ preventScroll: true }); }}>{copy.keep}</button>
          <button type="button" onClick={clear}>{copy.confirmClear}</button>
        </div>
      </section>}
    </LocalizedShell>
  );
}
