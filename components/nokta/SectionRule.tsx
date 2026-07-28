import styles from "./SectionRule.module.css";

/* ── Registerband ─────────────────────────────────────────────────────
   The rule that opens every section of the homepage: the section's name
   standing in the middle of a band of moiré.

   It does two jobs at once, which is why it exists as one component rather
   than as a divider and a heading. The name is the CLARITY — a reader can
   tell at a glance which part of the page they are standing in, and the rule
   is where one part ends and the next begins. The band is the ANIMATION, and
   it is the cheapest honest interference on the site: two line screens ruled
   at 14px and 15px, laid over each other, is literally how moiré happens on a
   press when two screens are at the wrong pitch. Nothing here is simulated.
   Two gradients overlap and the beat pattern is real.

   THE KNOCKOUT. The screens do not run behind the type. The name is laid over
   the band carrying the page's own ground, the full depth of the band, so the
   ruling stops dead at its edge and starts again after it — a break in the
   rule rather than a label floating on top of one. That is what a knockout is
   on a press, and it is what the homepage plate does to the studio's motto.

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
  label,
}: {
  /** id of the rendered heading — the section points at it with
      aria-labelledby, so the band names its section for a screen reader. */
  id: string;
  /** The section's name, in the reader's language. */
  label: string;
}) {
  return (
    <div className={styles.rule}>
      {/* The band carries no information the name doesn't, so it is decoration
          and stays out of the accessibility tree. */}
      <span className={styles.band} aria-hidden="true">
        <span className={styles.screen} />
        <span className={`${styles.screen} ${styles.screenTurned}`} />
      </span>
      {/* The section's real heading, standing in the break it makes. */}
      <h2 id={id} className={styles.label}>
        {label}
      </h2>
    </div>
  );
}
