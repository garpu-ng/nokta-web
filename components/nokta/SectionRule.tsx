import styles from "./SectionRule.module.css";

/* ── Registerband ─────────────────────────────────────────────────────
   The rule that opens every section of the homepage: a folio on the left, the
   section's name on the right, and between them a band of moiré.

   It does two jobs at once, which is why it exists as one component rather
   than as a divider and a heading. The folio and the label are the CLARITY —
   the page becomes a numbered register, and a reader can tell at a glance
   where they are and how much is left. The band is the ANIMATION, and it is
   the cheapest honest interference on the site: two line screens ruled at
   14px and 15px, laid over each other, is literally how moiré happens on a
   press when two screens are at the wrong pitch. Nothing here is simulated.
   Two gradients overlap and the beat pattern is real.

   No JavaScript, no canvas, no element per line: two spans and a CSS
   animation that translates by exactly one line pitch, so the loop closes on
   itself and never jumps. This is a server component and ships zero bytes of
   client bundle. */

export default function SectionRule({
  id,
  folio,
  label,
}: {
  /** id of the rendered heading — the section points at it with
      aria-labelledby, so the band names its section for a screen reader. */
  id: string;
  /** The section's number, already formatted — "01", "02", "03". */
  folio: string;
  /** The section's name, in the reader's language. */
  label: string;
}) {
  return (
    <div className={styles.rule}>
      <span className={styles.folio}>{folio}</span>
      {/* The band carries no information the folio and label don't, so it is
          decoration and stays out of the accessibility tree. */}
      <span className={styles.band} aria-hidden="true">
        <span className={styles.screen} />
        <span className={`${styles.screen} ${styles.screenTurned}`} />
      </span>
      {/* The section's real heading, set at the size a running head is set at.
          Small type is not weak structure: the outline is here, the weight is
          in the section's own content below. */}
      <h2 id={id} className={styles.label}>
        {label}
      </h2>
    </div>
  );
}
