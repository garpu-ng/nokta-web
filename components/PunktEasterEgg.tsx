"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import styles from "./PunktEasterEgg.module.css";

// The brand's three discipline colours. The living dot cycles through them on
// click; a ripple fires from the centre on each tap.
const PALETTE: [number, number, number][] = [
  [174, 106, 78], // clay   #ae6a4e
  [92, 110, 130], // slate  #5c6e82
  [110, 122, 84], // green  #6e7a54
];

/**
 * Easter egg reached by clicking the dot in the header wordmark: a giant,
 * organically wobbling nokta dot that reacts to mouse movement (its motion
 * energises the wobble, it reaches and drifts toward the cursor) and cycles
 * through the three brand colours on click, with "nokta." resting on it.
 * Rendered through a portal to <body> so it covers the whole viewport,
 * header included.
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

    let ci = Math.floor(Math.random() * PALETTE.length);
    const col = PALETTE[ci].slice() as [number, number, number];
    let tgt = PALETTE[ci].slice() as [number, number, number];

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    // smoothed target the blob eases toward, plus a movement "energy"
    const eased = { x: mouse.x, y: mouse.y };
    let lastX = mouse.x;
    let lastY = mouse.y;
    let energy = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
      energy = Math.min(1, energy + speed * 0.008);
    };
    const ripples: { r: number; a: number }[] = [];
    const onDown = () => {
      ci = (ci + 1) % PALETTE.length;
      tgt = PALETTE[ci].slice() as [number, number, number];
      ripples.push({ r: 0, a: 0.5 });
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onDown);

    // Lock page scroll while the takeover is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const N = 72;
    const baseAmp = reduce ? 0.4 : 1;
    let t = 0;
    let raf = 0;
    let sinceRipple = 0;
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    const frame = () => {
      t += reduce ? 0.006 : 0.016;
      energy *= 0.93; // decay
      for (let k = 0; k < 3; k++) col[k] = lerp(col[k], tgt[k], 0.06);

      // ease the follow-point toward the cursor (snappier when moving fast)
      const follow = 0.08 + energy * 0.12;
      eased.x = lerp(eased.x, mouse.x, follow);
      eased.y = lerp(eased.y, mouse.y, follow);

      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const base = Math.min(W, H) * 0.3;
      const mx = eased.x * dpr;
      const my = eased.y * dpr;
      // blob drifts toward the cursor (more with energy)
      const ox = (mx - cx) * (0.09 + energy * 0.06);
      const oy = (my - cy) * (0.09 + energy * 0.06);
      const ang = Math.atan2(my - cy, mx - cx);
      const dist = Math.hypot(mx - cx, my - cy);
      const pull = Math.min(1, dist / (base * 1.5));
      const amp = baseAmp * (1 + energy * 1.1);

      const pts: [number, number][] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        let r =
          base *
          (1 +
            amp * 0.055 * Math.sin(3 * a + t * 0.8) +
            amp * 0.04 * Math.sin(5 * a - t * 1.1) +
            amp * 0.03 * Math.sin(2 * a + t * 0.5) +
            amp * 0.03 * Math.sin(7 * a + t * 1.7));
        // a broad bulge that reaches toward the cursor, stronger with movement
        let d = Math.cos(a - ang);
        if (d < 0) d = 0;
        r += base * (0.16 + energy * 0.22) * d * d * pull;
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

      // faint ripples trailing quick movement
      sinceRipple++;
      if (energy > 0.55 && sinceRipple > 6) {
        ripples.push({ r: 0, a: 0.14 });
        sinceRipple = 0;
      }
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
