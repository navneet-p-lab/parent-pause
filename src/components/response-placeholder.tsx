"use client";

import { useEffect, useState } from "react";
import type { ResponseLabels } from "@/lib/contracts";
import styles from "./conversation.module.css";

/** Waiting copy, not measured progress through provider stages. Announced once by Conversation. */
export function ResponsePlaceholder({ labels }: { labels: ResponseLabels }) {
  const [hint, setHint] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setHint((index) => (index + 1) % labels.loadingHints.length), 3_000);
    return () => clearInterval(timer);
  }, [labels.loadingHints]);
  return <div className={styles.placeholder} aria-busy="true">
    <p className={styles.role}>{labels.loading}</p>
    <p className={styles.loadingHint} aria-hidden="true">{labels.loadingHints[hint]}</p>
    <div className={styles.skeleton} aria-hidden="true">
      <span /><span /><span />
      <div className={styles.skeletonCheckIn}><span /><span /></div>
    </div>
  </div>;
}
