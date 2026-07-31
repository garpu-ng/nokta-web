"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { KIND_FIELD, RED } from "@/lib/colors";
import Dot from "./Dot";
import styles from "./PunktEasterEgg.module.css";

// Each brand colour maps to a form — "Vom Punkt zur Linie zur Form":
//   0 the studio's red → round blob
//   1 cobalt           → rounded square
//   2 green            → rounded triangle
//
// The frame loop lerps between colours channel by channel, so the palette has
// to be RGB triples rather than the hex the rest of the site speaks. They are
// parsed out of lib/colors.ts — the one sanctioned literal mirror — instead of
// typed out again here: typing them out is how the cobalt and the green came
// to sit behind the darkening pass that gave the doors their 4.5:1, the green
// by 6 per channel.
const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const PALETTE: [number, number, number][] = [
  rgb(RED),
  rgb(KIND_FIELD.rendering),
  rgb(KIND_FIELD.cad),
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

  // The standard SSR gate for a portal: document.body only exists after mount,
  // so this one cascading render is the point, not an accident.
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
    /* The angles never change and neither does a shape's radius at one of
       them, so both are tables. The morph target used to be re-derived from
       trigonometry — three pows and two trig calls for the square alone —
       120 times a frame, to look up one of three fixed answers. */
    const ANG = new Float64Array(N);
    for (let i = 0; i < N; i++) ANG[i] = (i / N) * Math.PI * 2;
    const SHAPES = [0, 1, 2].map((shape) => {
      const table = new Float64Array(N);
      for (let i = 0; i < N; i++) table[i] = shapeRadius(shape, ANG[i]);
      return table;
    });
    const COS = new Float64Array(N);
    const SIN = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      COS[i] = Math.cos(ANG[i]);
      SIN[i] = Math.sin(ANG[i]);
    }
    /* One pair of buffers for the outline instead of 120 fresh two-element
       arrays every frame. */
    const px = new Float64Array(N);
    const py = new Float64Array(N);
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

      const target = SHAPES[ci % SHAPES.length];
      for (let i = 0; i < N; i++) {
        const a = ANG[i];
        // morph the form radius toward the current shape
        rad[i] = lerp(rad[i], target[i], 0.08);
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
        px[i] = cx + ox + COS[i] * r;
        py[i] = cy + oy + SIN[i] * r;
      }

      ctx.beginPath();
      ctx.moveTo((px[0] + px[N - 1]) / 2, (py[0] + py[N - 1]) / 2);
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        ctx.quadraticCurveTo(px[i], py[i], (px[i] + px[j]) / 2, (py[i] + py[j]) / 2);
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
          <Dot />
        </span>
      </div>
    </div>,
    document.body,
  );
}
