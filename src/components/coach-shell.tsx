"use client";

import { useEffect, useId, useReducer, useRef, useState } from "react";
import type { Locale } from "@/lib/contracts";
import { conversationReducer, initialConversation, MAX_EXCHANGES } from "@/lib/client/conversation-reducer";
import { CoachClientError, sendCoach } from "@/lib/client/coach-client";
import { useConversationStorage } from "@/lib/client/use-conversation-storage";
import { en } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";
import { LocalizedShell } from "./localized-shell";
import { Conversation } from "./conversation";
import { Composer } from "./composer";
import { ConversationHistory } from "./conversation-history";
import styles from "./coach-shell.module.css";

export function CoachShell({ demo = false, client = sendCoach }: { demo?: boolean; client?: typeof sendCoach }) {
  const [state, dispatch] = useReducer(conversationReducer, undefined, initialConversation);
  const storage = useConversationStorage(state, dispatch);
  const [confirming, setConfirming] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const keepAll = useRef<HTMLButtonElement>(null);
  const [tab, setTab] = useState<"chat" | "history">("chat");
  const tabId = useId();
  const active = useRef<{ requestId: string; controller: AbortController } | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const copy = state.locale === "en" ? en : ur;
  const limited = state.turns.length / 2 >= MAX_EXCHANGES;
  const last = state.turns.at(-1);
  const lastKind = last?.role === "assistant" ? last.response.kind : null;
  const started = state.turns.length > 0 || state.pending !== null;

  const invalidate = () => { const previous = active.current; active.current = null; previous?.controller.abort(); };
  useEffect(() => () => { const previous = active.current; active.current = null; previous?.controller.abort(); }, []);
  useEffect(() => { if (confirmingAll) keepAll.current?.focus(); }, [confirmingAll]);
  useEffect(() => {
    if (confirming) { keep.current?.focus({ preventScroll: true }); return; }
    if (state.event?.kind === "cleared" || (["reply", "cancelled"].includes(state.event?.kind ?? "") && textarea.current?.form?.contains(document.activeElement))) {
      textarea.current?.focus({ preventScroll: true });
    }
  }, [confirming, state.event]);

  async function send(text?: string) {
    if (!storage.ready || active.current || state.pending || confirming || limited) return;
    const requestId = crypto.randomUUID();
    const prepared = text === undefined ? state : conversationReducer(state, { type: "draft", text });
    const next = conversationReducer(prepared, { type: "start", requestId });
    if (text !== undefined) dispatch({ type: "draft", text });
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
  const openHistory = (id: string) => {
    invalidate(); setConfirming(false);
    dispatch({ type: "open", id, eventId: crypto.randomUUID() });
    setTab("chat");
  };
  const focusComposer = useRef(false);
  useEffect(() => {
    if (tab === "chat" && focusComposer.current) { textarea.current?.focus({ preventScroll: true }); focusComposer.current = false; }
  }, [tab]);
  const event = state.event;
  const eventText = event?.kind === "loading" ? copy.response.loading : event?.kind === "reply" ? `${event.urgent ? `${copy.response.escalationHeading}. ` : ""}${copy.replyReady}`
    : event?.kind === "error" && state.failure ? copy.response.errors[state.failure.code]
    : event?.kind === "cancelled" ? copy.cancelled : event?.kind === "cleared" ? copy.cleared : "";
  return (
    <LocalizedShell locale={state.locale} onLocaleChange={changeLocale} demo={demo}>
      <div className={styles.tabs} role="tablist" aria-label={copy.tabsLabel} onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? "chat" : event.key === "End" ? "history" : tab === "chat" ? "history" : "chat";
        setTab(next); setConfirming(false); setConfirmingAll(false);
        document.getElementById(`${tabId}-${next}-tab`)?.focus();
      }}>
        <button id={`${tabId}-chat-tab`} type="button" role="tab" aria-selected={tab === "chat"} aria-controls={`${tabId}-chat-panel`} tabIndex={tab === "chat" ? 0 : -1} onClick={() => { setTab("chat"); setConfirming(false); setConfirmingAll(false); }}>{copy.chatTab}</button>
        <button id={`${tabId}-history-tab`} type="button" role="tab" aria-selected={tab === "history"} aria-controls={`${tabId}-history-panel`} tabIndex={tab === "history" ? 0 : -1} onClick={() => { setTab("history"); setConfirming(false); }}>{copy.historyTab}{state.history.length > 0 && <span className={styles.historyCount}>{state.history.length}</span>}</button>
      </div>
      {storage.notice && <p role="status" className={styles.confirmation}>{storage.notice === "invalid" ? copy.storageInvalid : storage.notice === "conflict" ? copy.storageConflict : storage.notice === "delete-failed" ? copy.storageDeleteFailed : copy.storageUnavailable}</p>}
      <div id={`${tabId}-chat-panel`} role="tabpanel" aria-labelledby={`${tabId}-chat-tab`} hidden={tab !== "chat"}>
      <div className={started ? styles.threadHeader : styles.welcome}>
        {!started && <p className={styles.eyebrow}>{copy.welcomeEyebrow}</p>}
        <h1>{started ? copy.threadHeading : copy.emptyHeading}</h1>
      {!started && <>
        <p className={styles.description}>{copy.emptyDescription}</p>
        <p className={styles.primer}>{copy.welcomePrompt}</p>
        <div className={styles.suggestions}>
          {copy.suggestions.map((text, index) => <button key={text} type="button" disabled={confirming} onClick={() => { dispatch({ type: "draft", text }); textarea.current?.focus({ preventScroll: true }); }}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={[
              "M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z",
              "M4 5h16v11H4z M9 20h6 M12 16v4",
              "M20.8 5.6a5.3 5.3 0 0 0-7.5 0L12 6.9l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 22l8.8-8.9a5.3 5.3 0 0 0 0-7.5Z",
            ][index]} /></svg><span>{text}</span>
          </button>)}
        </div>
      </>}
      </div>
      <Conversation turns={state.pending?.turns ?? state.turns} uiLocale={state.locale} labels={{ en: en.response, ur: ur.response }}
        status={state.pending ? { kind: "loading" } : state.failure ? { kind: "error", code: state.failure.code } : { kind: "idle" }}
        announcement={event ? { id: event.id, text: eventText, urgency: event.urgent ? "assertive" : "polite" } : null} />
      {lastKind === "pause_offer" && !state.pending && !state.failure && !limited && <div className={styles.suggestions}>
        <button type="button" disabled={confirming} onClick={() => { void send(copy.pauseMessage); }}>{copy.pause}</button>
        <button type="button" disabled={confirming} onClick={() => { void send(copy.continueMessage); }}>{copy.continueTalking}</button>
      </div>}
      {lastKind && lastKind !== "summary" && lastKind !== "escalation" && !state.pending && !state.failure && !limited && <div className={styles.suggestions}>
        <button type="button" disabled={confirming || !storage.ready || state.draft.length > 0} onClick={() => { void send(copy.summaryMessage); }}>{copy.summarize}</button>
      </div>}
      <Composer copy={copy} draft={state.draft} followUp={state.turns.length > 0} busy={state.pending !== null} limited={limited}
        paused={lastKind === "paused"}
        confirming={confirming || !storage.ready} retry={state.failure?.retryable === true} validation={state.validation} inputRef={textarea}
        onDraft={(text) => dispatch({ type: "draft", text })} onSend={() => { void send(); }} onCancel={cancel} />
      {(state.draft || state.turns.length || state.pending) && !confirming ? <button className={styles.clear} type="button" onClick={() => setConfirming(true)}>{copy.clear}</button> : null}
      {confirming && <section role="group" className={styles.confirmation} aria-labelledby="clear-heading">
        <h2 id="clear-heading">{copy.clearHeading}</h2><p>{copy.clearDescription}</p>
        <div className={styles.suggestions}>
          <button ref={keep} type="button" onClick={() => { setConfirming(false); textarea.current?.focus({ preventScroll: true }); }}>{copy.keep}</button>
          <button type="button" onClick={clear}>{copy.confirmClear}</button>
        </div>
      </section>}
      </div>
      <div id={`${tabId}-history-panel`} role="tabpanel" aria-labelledby={`${tabId}-history-tab`} hidden={tab !== "history"}>
        {tab === "history" && <ConversationHistory history={state.history} copy={copy}
          onOpen={(id) => { focusComposer.current = true; openHistory(id); }} onDelete={(id) => dispatch({ type: "delete-history", id })} />}
        {!confirmingAll ? <button type="button" className={styles.clear} disabled={!storage.ready} onClick={() => setConfirmingAll(true)}>{copy.clearAll}</button>
          : <section role="group" className={styles.confirmation} aria-labelledby={`${tabId}-clear-all-heading`}>
            <h2 id={`${tabId}-clear-all-heading`}>{copy.clearAllHeading}</h2><p>{copy.clearAllDescription}</p>
            <div className={styles.suggestions}>
              <button ref={keepAll} type="button" onClick={() => { setConfirmingAll(false); document.getElementById(`${tabId}-history-tab`)?.focus(); }}>{copy.keepHistory}</button>
              <button type="button" onClick={() => { invalidate(); storage.clearSaved(); setConfirmingAll(false); document.getElementById(`${tabId}-history-tab`)?.focus(); }}>{copy.clearAll}</button>
            </div>
          </section>}
      </div>
    </LocalizedShell>
  );
}
