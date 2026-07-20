import { cube, halftone, plotLine } from "./geometry";
import styles from "./BranchCardMark.module.css";

/* The card's graphic DNA in miniature — the same three glyphs as the lead
   progression, one per branch, ~90px and pinned top-right of the card:
     point → a halftone dot cluster
     line  → a short plotted line with a crosshair end
     cube  → an isometric wireframe cube
   Everything is drawn in `currentColor`, so nokta.css can flip the mark from
   the branch accent to the card foreground on hover, riding the same 0.35s
   colour transition as the rest of the card. Static + deterministic (SSR-safe);
   no motion. */

type Variant = "point" | "line" | "cube";

// Precomputed once at module load — deterministic, so identical every render.
const DOTS = halftone({ size: 88, step: 15, maxR: 5.2 });
const PLOT = plotLine({ width: 76, height: 40, count: 7, seed: 3, amp: 26 });
const CUBE = cube({ x: 14, y: 26, side: 40, dx: 22, dy: -22 });

export default function BranchCardMark({ variant }: { variant: Variant }) {
  return (
    <svg
      className={`${styles.mark} nk-branch-card__mark`}
      viewBox="0 0 88 88"
      aria-hidden="true"
    >
      {variant === "point" &&
        DOTS.map((d, i) => (
          <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} fill="currentColor" />
        ))}

      {variant === "line" && (
        <g transform="translate(6 24)">
          <path d={PLOT.d} fill="none" stroke="currentColor" className={styles.stroke} />
          <circle cx={PLOT.start.x.toFixed(1)} cy={PLOT.start.y.toFixed(1)} r="3" fill="currentColor" />
          <path
            d="M-5 0h10M0-5v10"
            transform={`translate(${PLOT.end.x.toFixed(1)} ${PLOT.end.y.toFixed(1)})`}
            fill="none"
            stroke="currentColor"
            className={styles.tick}
          />
        </g>
      )}

      {variant === "cube" && (
        <>
          <path d={CUBE.visible} fill="none" stroke="currentColor" className={styles.stroke} />
          <path d={CUBE.hidden} fill="none" stroke="currentColor" className={`${styles.stroke} ${styles.hidden}`} />
        </>
      )}
    </svg>
  );
}
