"use client";

import { useEffect, useRef, useState } from "react";
import type { ConversationSnapshot } from "@/lib/client/conversation-reducer";
import type { UiDictionary } from "@/lib/i18n/en";
import styles from "./coach-shell.module.css";

export function ConversationHistory({ history, copy, onOpen, onDelete }: {
  history: ConversationSnapshot[]; copy: UiDictionary;
  onOpen: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (deleting) keep.current?.focus(); }, [deleting]);

  return <section aria-labelledby="history-heading" className={styles.history}>
    <div className={styles.threadHeader}>
      <h1 ref={heading} tabIndex={-1} id="history-heading">{copy.historyHeading}</h1>
      <p className={styles.primer}>{copy.historyDescription}</p>
    </div>
    {history.length === 0 ? <p className={styles.historyEmpty}>{copy.historyEmpty}</p> : <ul className={styles.historyList}>
      {history.map((item) => {
        const first = item.turns[0];
        const title = first?.role === "user" ? first.text : item.draft;
        const replies = item.turns.filter((turn) => turn.role === "assistant").length;
        return <li key={item.id} className={styles.historyCard}>
          <button type="button" className={styles.historyOpen} onClick={() => onOpen(item.id)}>
            <span className={styles.historyTitle} dir="auto">{title}</span>
            <span className={styles.historyMeta}>{replies ? `${replies} ${replies === 1 ? copy.reply : copy.replies}` : copy.draftOnly}<span aria-hidden="true"> · </span>{copy.openConversation}</span>
          </button>
          {deleting === item.id ? <div role="group" aria-label={copy.deleteHeading} className={styles.historyDelete}>
            <p>{copy.deleteDescription}</p>
            <div className={styles.suggestions}>
              <button ref={keep} type="button" onClick={() => { setDeleting(null); heading.current?.focus(); }}>{copy.keepHistory}</button>
              <button type="button" onClick={() => { onDelete(item.id); setDeleting(null); heading.current?.focus(); }}>{copy.deleteConversation}</button>
            </div>
          </div> : <button className={styles.historyRemove} type="button" aria-label={`${copy.deleteConversation}: ${title}`} onClick={() => setDeleting(item.id)}>{copy.deleteConversation}</button>}
        </li>;
      })}
    </ul>}
  </section>;
}
