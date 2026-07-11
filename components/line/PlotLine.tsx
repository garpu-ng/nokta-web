"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PlotLine.module.css";

/* A single pen-plotter path: it begins at a filled nokta and ends beneath a
   red crosshair. The seeded PRNG keeps the SVG byte-stable during SSR. */
const W = 1120;
const H = 280;
const N = 14;

type Point = { x: number; y: number };

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function plotPoints(): Point[] {
  const rand = mulberry32(7);
  return Array.from({ length: N }, (_, i) => ({
    x: 30 + (i * (W - 90)) / (N - 1),
    y: H / 2 + (rand() - 0.5) * (i < 2 ? 20 : 150),
  }));
}

/* Catmull–Rom points converted to cubic Bézier segments. The endpoint points
   are repeated, which gives the continuous plot a gentle, deterministic start
   and finish without introducing random control handles. */
function curvePath(points: Point[]) {
  if (points.length < 2) return "";

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

const POINTS = plotPoints();
const PATH = curvePath(POINTS);
const START = POINTS[0];
const END = POINTS[POINTS.length - 1];

export default function PlotLine() {
  const ref = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const element = ref.current;

    if (reduceMotion || !element || typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setDrawn(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={styles.section}>
      <div className={styles.inner}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={`${styles.plot}${drawn ? ` ${styles.drawn}` : ""}`}
          aria-hidden="true"
        >
          <circle cx={START.x.toFixed(1)} cy={START.y.toFixed(1)} r="5" className={styles.startDot} />
          <path d={PATH} className={styles.path} />
          <g className={styles.crosshair} transform={`translate(${END.x.toFixed(1)} ${END.y.toFixed(1)})`}>
            <circle r="3" className={styles.crosshairRing} />
            <path d="M-8 0h16M0-8v16" className={styles.crosshairLine} />
          </g>
        </svg>
      </div>
    </section>
  );
}
