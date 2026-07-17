import { getT } from "@/lib/i18n";
import WordmarkHeadline from "@/components/WordmarkHeadline";
import styles from "./LineHero.module.css";

/* Drafting-sheet hero. The paper is ruled as millimeter paper; the wordmark
   is measured by a real dimension line at the A1 sheet width, and the corner
   title block echoes the one engraved on each catalogue print. */
export default async function LineHero() {
  const t = await getT();

  return (
    <section className={`${styles.hero} nk-grain`}>
      <WordmarkHeadline suffix="line" className={styles.title} dotClassName={styles.titleDot} />

      {/* Dimension line: |← 594 mm →| */}
      <svg className={styles.dim} viewBox="0 0 594 44" aria-hidden="true">
        <path d="M1 0v30M593 0v30" className={styles.dimStroke} />
        <path d="M1 22h592" className={styles.dimStroke} />
        <path d="M1 22l10 -4v8zM593 22l-10 -4v8z" className={styles.dimFill} />
        <text x="297" y="14" textAnchor="middle" className={styles.dimLabel}>
          594 mm
        </text>
      </svg>

      <p className={styles.caption}>{t("line.hero.caption")}</p>
      <p className={styles.claim}>{t("line.hero.claim")}</p>

      {/* Schriftfeld — bottom-right, as on the prints themselves. */}
      <dl className={styles.titleBlock} aria-hidden="true">
        <div>
          <dt>{t("line.tb.sheet")}</dt>
          <dd>01 / 04</dd>
        </div>
        <div>
          <dt>{t("line.tb.scale")}</dt>
          <dd>1 : 1</dd>
        </div>
        <div>
          <dt>{t("line.tb.format")}</dt>
          <dd>A1 · 594 × 841</dd>
        </div>
        <div>
          <dt>{t("line.tb.date")}</dt>
          <dd>07 · 2026</dd>
        </div>
      </dl>
    </section>
  );
}
