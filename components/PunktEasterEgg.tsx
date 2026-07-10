"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import styles from "./PunktEasterEgg.module.css";

// Each brand colour maps to a form — "Vom Punkt zur Linie zur Form":
//   0 sand     #e8d5b5 → round blob
//   1 blue     #384ed1 → rounded square
//   2 lavender #918cb7 → rounded triangle
const PALETTE: [number, number, number][] = [
  [232, 213, 181],
  [56, 78, 209],
  [145, 140, 183],
];

// Normalised polar radius of the current form at angle `a` (before wobble).
// The midpoint-quadratic drawing rounds the corners into a hand-drawn look.
function shapeRadius(shape: number, a: number): number {
  if (shape === 1) {
    // rounded square (superellipse, n=4)
    const n = 4;
    return (
      0.92 /
      Math.pow(
        Math.pow(Math.abs(Math.cos(a)), n) + Math.pow(Math.abs(Math.sin(a)), n),
        1 / n,
      )
    );
  }
  if (shape === 2) {
    // equilateral triangle pointing up (regular-polygon polar formula)
    const m = 3;
    const off = -Math.PI / 2;
    const seg = (2 * Math.PI) / m;
    const aa = (((a - off) % seg) + seg) % seg;
    return (1.32 * Math.cos(Math.PI / m)) / Math.cos(aa - Math.PI / m);
  }
  return 1; // round blob
}

/**
 * Easter egg reached by clicking the dot in the header wordmark: a giant,
 * organically wobbling nokta form that gently reaches toward the cursor and,
 * on click, morphs to the next brand colour + form (dot → square → triangle)
 * with a ripple. "nokta." rests on it. Portalled to <body> so it covers the
 * whole viewport, header included.
 */
export default function PunktEasterEgg() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    let ci = 0;
    const col = PALETTE[0].slice() as [number, number, number];
    let tgtCol = PALETTE[0].slice() as [number, number, number];

    const N = 120;
    // current (morphing) shape radius factor per point
    const rad = new Array(N).fill(1);
    for (let i = 0; i < N; i++) rad[i] = shapeRadius(0, (i / N) * Math.PI * 2);

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const ripples: { r: number; a: number }[] = [];
    const onDown = () => {
      ci = (ci + 1) % PALETTE.length;
      tgtCol = PALETTE[ci].slice() as [number, number, number];
      ripples.push({ r: 0, a: 0.5 });
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onDown);

    // Lock page scroll while the takeover is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const amp = reduce ? 0.4 : 1;
    let t = 0;
    let raf = 0;
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    const frame = () => {
      t += reduce ? 0.006 : 0.016;
      for (let k = 0; k < 3; k++) col[k] = lerp(col[k], tgtCol[k], 0.06);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const base = Math.min(W, H) * 0.28;
      const mx = mouse.x * dpr;
      const my = mouse.y * dpr;
      const ox = (mx - cx) * 0.05;
      const oy = (my - cy) * 0.05;
      const ang = Math.atan2(my - cy, mx - cx);
      const dist = Math.hypot(mx - cx, my - cy);
      const pull = Math.min(1, dist / (base * 1.5));

      const pts: [number, number][] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        // morph the form radius toward the current shape
        rad[i] = lerp(rad[i], shapeRadius(ci, a), 0.08);
        let r =
          base *
          rad[i] *
          (1 +
            amp * 0.035 * Math.sin(3 * a + t * 0.8) +
            amp * 0.028 * Math.sin(5 * a - t * 1.1) +
            amp * 0.022 * Math.sin(2 * a + t * 0.5));
        // gentle, localised reach toward the cursor
        let d = Math.cos(a - ang);
        if (d < 0) d = 0;
        r += base * 0.16 * d * d * d * pull;
        pts.push([cx + ox + Math.cos(a) * r, cy + oy + Math.sin(a) * r]);
      }

      ctx.beginPath();
      ctx.moveTo((pts[0][0] + pts[N - 1][0]) / 2, (pts[0][1] + pts[N - 1][1]) / 2);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const n = pts[(i + 1) % N];
        ctx.quadraticCurveTo(p[0], p[1], (p[0] + n[0]) / 2, (p[1] + n[1]) / 2);
      }
      ctx.closePath();
      const rgb = `${Math.round(col[0])},${Math.round(col[1])},${Math.round(col[2])}`;
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.fill();

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += W * 0.004;
        rp.a *= 0.96;
        if (rp.a < 0.02) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, base + rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb},${rp.a})`;
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
      }

      raf = window.requestAnimationFrame(frame);
    };
    frame();

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div ref={rootRef} className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <Link href="/" className={styles.back}>
        ← zurück
      </Link>
      <div className={styles.center}>
        <span className={styles.word}>
          nokta
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nokta_dot_black.webp" alt="" aria-hidden="true" />
        </span>
      </div>
    </div>,
    document.body,
  );
}
