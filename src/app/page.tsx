import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-heading">Skip to main content</a>
      <header className={styles.header}>
        <bdi className={styles.brand}>ParentPause</bdi>
        <span>A little space for your next step</span>
      </header>
      <main className={styles.main} aria-labelledby="main-heading">
        <p className={styles.eyebrow}>A moment to pause</p>
        <h1 id="main-heading" tabIndex={-1}>Parenting can feel like a lot.</h1>
        <p>Take a breath. A small, practical next step can help.</p>
        <section className={styles.card} aria-labelledby="preview-heading">
          <h2 id="preview-heading">A calmer place to begin</h2>
          <p>Coaching is not available in this preview.</p>
          <p className={styles.note}>Preview — no AI call. No messages are collected.</p>
        </section>
        <aside className={styles.safety} aria-label="Emergency guidance">
          If anyone is in immediate danger, contact local emergency help now.
          This app cannot provide emergency care.
        </aside>
      </main>
    </div>
  );
}
