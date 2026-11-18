import { useId } from "react";
import type { CoachResponseProps } from "@/lib/contracts";
import styles from "./coach-response.module.css";

/** Receives an accepted T01 response; untrusted fields remain React text. */
export function CoachResponse({ response, labels }: CoachResponseProps) {
  const headingId = useId();
  const checkInId = useId();
  const heading = {
    plan: labels.planHeading,
    summary: labels.summaryHeading,
    clarify: labels.clarificationHeading,
    boundary: labels.boundaryHeading,
    escalation: labels.escalationHeading,
    pause_offer: labels.pauseOfferHeading,
    paused: labels.pausedHeading,
  }[response.kind];
  const escalation = response.kind === "escalation";

  return (
    <article
      aria-labelledby={headingId}
      className={`${styles.card} ${escalation ? styles.escalation : ""}`}
      lang={response.locale}
      dir={response.locale === "ur" ? "rtl" : "ltr"}
    >
      <p className={styles.role}>{labels.coach}</p>
      <h2 id={headingId} className={styles.heading}>
        {escalation && <span aria-hidden="true">⚠ </span>}
        {heading}
      </h2>
      {"acknowledgment" in response ? (
        <p className={styles.text}>{response.acknowledgment}</p>
      ) : (
        <p className={styles.text}>{response.message}</p>
      )}
      {(response.kind === "plan" || response.kind === "summary") && (
        <ol className={styles.actions}>
          {response.steps.map((step, index) => <li key={index}>{step}</li>)}
        </ol>
      )}
      {response.kind === "boundary" && <p className={styles.text}>{response.alternative}</p>}
      {response.kind === "escalation" && (
        <ul className={styles.actions}>
          {response.actions.map((action, index) => <li key={index}>{action}</li>)}
        </ul>
      )}
      {"checkIn" in response && <section role="group" aria-labelledby={checkInId} className={styles.checkIn}>
        <h3 id={checkInId} className={styles.checkInHeading}>{labels.checkInHeading}</h3>
        <p className={styles.text}>{response.checkIn.text}</p>
      </section>}
    </article>
  );
}
