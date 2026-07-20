import type { CSSProperties } from "react";
import PlotterReveal from "@/components/PlotterReveal";
import styles from "./DotField.module.css";

/* Poster 2 — a field of ink dots that hangs straight at the top and drapes
   into waves toward the bottom (moodbook: dot-matrix drape), with the center
   column set in the brand red as a single "thread". Deterministic: seeded
   mulberry32 PRNG, so the SVG is identical on every render (SSR-stable).
   ~1,100 dots ≈ 80 KB of inline SVG (compresses well over the wire) —
   acceptable for the one page that uses it.

   When it scrolls into view the drape assembles the way a plotter lays it down:
   top to bottom, one row at a time, and the red thread lands last (see
   PlotterReveal + the stylesheet). Row-based delays keep it cheap — 20 <g>
   wrappers each carry one shared delay rather than a style per circle. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLS = 56;
const ROWS = 20;
const W = 1120;
const H = 460;
const R = 3.4; // dot radius
const ROW_STEP_MS = 28; // per-row stagger: the drape settles top → bottom
const THREAD_DELAY_MS = 600; // the red thread lands after the last row settles

export default function DotField() {
  const rand = mulberry32(9);
  // Ink dots bucketed by row (each row draws in together); the red thread is
  // pulled into its own bucket so it can land last, the drape's final stitch.
  const rows: { x: number; y: number }[][] = Array.from({ length: ROWS }, () => []);
  const thread: { x: number; y: number }[] = [];
  const phase = Array.from({ length: COLS }, () => rand() * Math.PI * 2);
  const center = Math.floor(COLS / 2);
  for (let row = 0; row < ROWS; row++) {
    const depth = row / (ROWS - 1); // 0 top → 1 bottom
    const sag = depth * depth; // drape grows quadratically
    for (let col = 0; col < COLS; col++) {
      const x0 = (col + 0.5) * (W / COLS);
      const y0 = (row + 0.5) * (H / ROWS);
      const wave = Math.sin(x0 / 90 + phase[col] * 0.35) * 26 * sag;
      const fall = Math.cos(col / 3.1) * 18 * sag;
      const dot = { x: x0 + wave * 0.3, y: y0 + wave + fall };
      if (col === center) thread.push(dot);
      else rows[row].push(dot);
    }
  }
  return (
    <PlotterReveal
      className={styles.wrap}
      armedClassName={styles.armed}
      animateClassName={styles.animate}
    >
      {/* Server-rendered and shipped once; PlotterReveal only observes it and
          toggles the draw-in classes. Colour + opacity live in the stylesheet
          now, so the classes can animate opacity per row. */}
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} aria-hidden="true">
        {rows.map((rowDots, row) => (
          <g
            key={row}
            className={styles.ink}
            style={{ "--nk-row-delay": `${row * ROW_STEP_MS}ms` } as CSSProperties}
          >
            {rowDots.map((d, i) => (
              <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={R} />
            ))}
          </g>
        ))}
        <g
          className={styles.thread}
          style={{ "--nk-row-delay": `${THREAD_DELAY_MS}ms` } as CSSProperties}
        >
          {thread.map((d, i) => (
            <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={R} />
          ))}
        </g>
      </svg>
    </PlotterReveal>
  );
}
