import styles from "./DotField.module.css";

/* Poster 2 — a field of ink dots that hangs straight at the top and drapes
   into waves toward the bottom (moodbook: dot-matrix drape), with the center
   column set in the brand red as a single "thread". Deterministic: seeded
   mulberry32 PRNG, so the SVG is identical on every render (SSR-stable).
   ~1,100 dots ≈ 40 KB of SVG — acceptable for the one page that uses it. */
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

export default function DotField() {
  const rand = mulberry32(9);
  const dots: { x: number; y: number; red: boolean }[] = [];
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
      dots.push({ x: x0 + wave * 0.3, y: y0 + wave + fall, red: col === center });
    }
  }
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg}>
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x.toFixed(1)}
            cy={d.y.toFixed(1)}
            r={R}
            fill={d.red ? "#b83636" : "var(--ink)"}
            opacity={d.red ? 0.9 : 0.82}
          />
        ))}
      </svg>
    </div>
  );
}
