import { cube, plotLine } from "./geometry";
import styles from "./ProgressionMark.module.css";

/* The motto drawn as one diagram: a filled point → a plotted line → a wireframe
   cube, read left-to-right and linked by faint paper rules. It restates, in
   marks, the coloured words in the lead ("Vom Punkt zur Linie zur Form"). The
   three glyph colours are handed in by the caller from lib/branches.ts so they
   stay in sync with those words and with the branch heroes.

   Composed for a WIDE stage: this now spans the full pillar width beneath the
   centred motto, so the viewBox is a long 8:1 band (1200×150) with real
   horizontal breathing room between the three glyphs and a long plotted line in
   the middle — redrawn wide, not just a scaled-up half-width mark. Strokes use
   vector-effect:non-scaling-stroke (in the module CSS) so they stay crisp at any
   render width, from the ~1300px desktop diagram down to the ~350px mobile one.

   Static by design: nothing animates here — the page already carries the flood
   + fade — so it is reduced-motion-safe and needs no client JS. The plot is the
   only random-looking part and it is seeded, so the SVG is SSR-stable. */

const B = 75; // shared baseline the three glyphs sit on (mid of the 150-tall band)

// The line zone: a long Catmull–Rom plot, then placed on the baseline. Seed 1890
// lands both endpoints within ~1px of the box centre, so the plot reads
// continuously with the paper connector rules on either side, while keeping a
// lively vertical range (~70 units) across its 560-wide run.
const PLOT = plotLine({ width: 560, height: 104, count: 13, seed: 1890, amp: 76, calm: 3 });
const PLOT_X = 290;
const PLOT_Y = B - 52; // 104-tall box centred on the baseline

// The form zone: a wireframe cube whose bounding box also centres on B, parked
// near the right edge (right-most vertex at x≈1144, clear of the 1200 viewBox).
const CUBE = cube({ x: 1050, y: 62, side: 60, dx: 34, dy: -34 });

export default function ProgressionMark({
  colors,
}: {
  colors: { point: string; line: string; form: string };
}) {
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 1200 150"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Faint paper rules bridging the three glyphs across the wide gaps:
          point → plot, then plot → cube. */}
      <path d={`M86 ${B}H274 M866 ${B}H1034`} className={styles.link} />

      {/* point — a single filled dot */}
      <circle cx="60" cy={B} r="13" fill={colors.point} />

      {/* line — a seeded plot: filled start dot, crosshair at the end */}
      <g transform={`translate(${PLOT_X} ${PLOT_Y})`}>
        <path d={PLOT.d} fill="none" stroke={colors.line} className={styles.plot} />
        <circle cx={PLOT.start.x.toFixed(1)} cy={PLOT.start.y.toFixed(1)} r="5" fill={colors.line} />
        <g
          transform={`translate(${PLOT.end.x.toFixed(1)} ${PLOT.end.y.toFixed(1)})`}
          stroke={colors.line}
          className={styles.tick}
        >
          <circle r="3.4" fill="none" />
          <path d="M-10 0h20M0-10v20" fill="none" />
        </g>
      </g>

      {/* form — a wireframe cube, hidden edges dashed as construction lines */}
      <path d={CUBE.visible} fill="none" stroke={colors.form} className={styles.cube} />
      <path d={CUBE.hidden} fill="none" stroke={colors.form} className={`${styles.cube} ${styles.cubeHidden}`} />
    </svg>
  );
}
