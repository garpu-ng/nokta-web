import styles from "./SectionRule.module.css";

/* ── Registerband ─────────────────────────────────────────────────────
   The rule that opens every section of the homepage: the section's name
   standing in the middle of a band of moiré, with its folio at the left.

   It does two jobs at once, which is why it exists as one component rather
   than as a divider and a heading. The folio and the label are the CLARITY —
   the page becomes a numbered register, and a reader can tell at a glance
   where they are and how much is left. The band is the ANIMATION, and it is
   the cheapest honest interference on the site: two line screens ruled at
   14px and 15px, laid over each other, is literally how moiré happens on a
   press when two screens are at the wrong pitch. Nothing here is simulated.
   Two gradients overlap and the beat pattern is real.

   THE KNOCKOUT. The screens do not run behind the type. Both the folio and
   the label are laid over the band carrying the page's own ground, with real
   air either side, so the ruling stops dead at their edges and starts again
   after them — which is exactly what a knockout is on a press, and exactly
   what the homepage plate does to the studio's motto.

   It is a cleared BOX here rather than the glyph-shaped dodge the big plate
   uses, and that is the right answer at this size, not a cheaper one: at
   13px, lines threading the counters of an "E" and between every letter read
   as dirt on the sheet, not as craft. A printer knocking a caption out of a
   rule clears a box. So does this.

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
      {/* The band carries no information the folio and label don't, so it is
          decoration and stays out of the accessibility tree. */}
      <span className={styles.band} aria-hidden="true">
        <span className={styles.screen} />
        <span className={`${styles.screen} ${styles.screenTurned}`} />
      </span>
      <span className={styles.folio}>{folio}</span>
      {/* The section's real heading, centred in its own clearing. */}
      <h2 id={id} className={styles.label}>
        {label}
      </h2>
    </div>
  );
}
