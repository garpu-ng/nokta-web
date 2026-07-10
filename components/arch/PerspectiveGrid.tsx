"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./PerspectiveGrid.module.css";

/* Poster 3 — full-bleed cobalt band with a white one-point-perspective floor
   grid (moodbook: the blue hologram poster; also literally an architect's
   perspective construction). Lines draw in once the band scrolls into view;
   under prefers-reduced-motion they render complete immediately. */
const W = 1600;
const H = 640;
const VPX = W / 2;   // vanishing point
const VPY = -140;
const HORIZON = 240; // y where the floor starts

/* Receding verticals fan wide enough that even under `xMidYMax slice` — which
   crops to the centre third on a 375px phone — the outermost lines still reach
   the top corners instead of leaving cobalt gaps near the horizon (±12, not
   ±10). The floor's longest line then runs ~2184px, so the dash length in the
   stylesheet is sized above that. */
function floorLines(): string[] {
  const d: string[] = [];
  for (let i = -12; i <= 12; i++) {
    const xb = VPX + i * 170;
    d.push(`M ${VPX} ${VPY} L ${xb} ${H}`);
  }
  // Horizontals: geometric spacing away from the horizon (perspective depth).
  let y = HORIZON, step = 14;
  while (y < H + 60) {
    d.push(`M 0 ${y.toFixed(1)} L ${W} ${y.toFixed(1)}`);
    step *= 1.38;
    y += step;
  }
  return d;
}

export default function PerspectiveGrid({
  tagline,
  cta,
}: {
  tagline: string;
  cta: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (reduceMotion || !el || typeof IntersectionObserver === "undefined") {
      // Render complete immediately. Deferred out of the effect body so the
      // set isn't synchronous (the reduced-motion CSS already pins the lines
      // to their drawn state, so there is nothing to flash).
      const raf = requestAnimationFrame(() => setDrawn(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && (setDrawn(true), io.disconnect()),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const lines = floorLines();
  return (
    <div ref={ref} className={`${styles.band} nk-grain`}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} aria-hidden="true" preserveAspectRatio="xMidYMax slice">
        {lines.map((d, i) => (
          <path
            key={i}
            d={d}
            className={`${styles.line}${drawn ? " " + styles.lineDrawn : ""}`}
            style={{ transitionDelay: `${i * 28}ms` }}
          />
        ))}
      </svg>
      <div className={styles.content}>
        <p className={styles.tagline}>{tagline}</p>
        <Link href="/kontakt" className={styles.cta}>{cta}</Link>
      </div>
    </div>
  );
}
