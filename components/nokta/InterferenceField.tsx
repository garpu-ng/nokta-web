"use client";

import { useEffect, useRef } from "react";
import styles from "./InterferenceField.module.css";

/* ── Interferenz ──────────────────────────────────────────────────────
   The homepage's abstract plate: a halftone raster with two wave sources
   running through it.

   The idea is the studio's own, taken literally. nokta is the dot; the wall
   is made of dots; so the plate is a lattice of dots and nothing else. What
   moves is not the dots — they never leave their grid positions — but their
   SIZE, which is exactly how a halftone screen carries a tone: constant ink,
   varying dot. Two sources emit circular waves, the waves cross, and where
   two crests meet the dots open up and the raster turns to paper. It is the
   oldest trick in offset printing driven by the oldest equation in physics,
   and it is the reason the plate reads as printed rather than as rendered.

   The lattice is laid at 15°, because that is the screen angle a printer
   gives a single-colour halftone: on the square it moires against the paper's
   own grid, at 15° it doesn't. Nobody will name the angle. Everybody sees
   that it sits right.

   ONE dot is red — the lattice point nearest a third, slower focus, redrawn
   at a fixed size so it stays a mark while the field around it breathes. That
   is the studio's point, living inside the raster. It obeys the house rule
   without an exception: the accent is a dot here, never a surface.

   Craft notes, in the order they matter:
     · Every dot is one entry in a single Path2D and the whole raster is ONE
       fill() per frame — not eleven hundred. Radius carries the tone, so no
       per-dot alpha and no per-dot state is needed.
     · The loop runs only when the plate is actually on screen AND the tab is
       actually visible. Off-screen it is not throttled, it is stopped.
     · prefers-reduced-motion draws exactly one frame and never starts a loop.
       The plate is still a plate; it simply holds its breath.
     · Nothing here is in the accessibility tree and nothing takes a pointer
       event: it is decoration, and it says so. */

/** Screen angle of the raster. A printer's answer, in radians. */
const SCREEN_ANGLE = (15 * Math.PI) / 180;
/** Lattice pitch in CSS px — the distance between two dot centres. */
const PITCH = 21;
/** Biggest a field dot may grow, as a fraction of the pitch. Below 0.5 the
    dots never touch, so the raster stays a raster even at full crest. */
const MAX_DOT = 0.4;
/** Wavelength of the interference, in CSS px. */
const WAVELENGTH = 112;
/** Tone curve. Above 1 the troughs flatten out, which keeps the plate mostly
    dark and open — the fringes read as light on ink instead of as mush. */
const GAMMA = 1.7;
/** Never rasterise more than this — a retina 4K plate would otherwise ask for
    four times the fill rate it needs to look identical. */
const MAX_DPR = 2;

export default function InterferenceField({
  className,
}: {
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The two colours are read off the cascade rather than hardcoded, so the
    // plate can never drift out of sync with tokens.css.
    const css = getComputedStyle(canvas);
    const paper = css.getPropertyValue("--nk-field-ink").trim() || "#e9e0ce";
    const accent = css.getPropertyValue("--nk-field-mark").trim() || "#b83636";

    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    const cos = Math.cos(SCREEN_ANGLE);
    const sin = Math.sin(SCREEN_ANGLE);
    const k = (2 * Math.PI) / WAVELENGTH;

    /** One frame of the plate at time `t` (seconds). */
    const draw = (t: number) => {
      if (width === 0 || height === 0) return;
      const cx = width / 2;
      const cy = height / 2;

      // The two wave sources, on slow Lissajous paths whose frequencies share
      // no common factor — so the pattern never repeats inside a visit.
      const ax = cx + 0.34 * width * Math.cos(t * 0.11);
      const ay = cy + 0.30 * height * Math.sin(t * 0.17);
      const bx = cx + 0.30 * width * Math.cos(t * 0.13 + 2.1);
      const by = cy + 0.34 * height * Math.sin(t * 0.09 + 1.3);
      // The point: a third focus, slower than both, that the red dot follows.
      const fx = cx + 0.38 * width * Math.cos(t * 0.05 + 0.7);
      const fy = cy + 0.33 * height * Math.sin(t * 0.07);

      ctx.clearRect(0, 0, width, height);

      const path = new Path2D();
      const maxR = PITCH * MAX_DOT;
      // The lattice is rotated, so it has to be generated over a disc wide
      // enough to still cover the corners once turned.
      const reach = Math.ceil((Math.hypot(width, height) / 2 + PITCH) / PITCH);

      let markX = 0;
      let markY = 0;
      let markBest = Infinity;

      for (let iy = -reach; iy <= reach; iy++) {
        for (let ix = -reach; ix <= reach; ix++) {
          const x = cx + ix * PITCH * cos - iy * PITCH * sin;
          const y = cy + ix * PITCH * sin + iy * PITCH * cos;
          if (x < -PITCH || x > width + PITCH) continue;
          if (y < -PITCH || y > height + PITCH) continue;

          const da = Math.hypot(x - ax, y - ay);
          const db = Math.hypot(x - bx, y - by);
          // Two crests summed, mapped from [-1,1] to [0,1].
          const amp =
            (Math.sin(k * da - t * 1.1) + Math.sin(k * db - t * 0.9) + 2) / 4;
          const r = maxR * Math.pow(amp, GAMMA);

          if (r > 0.18) {
            path.moveTo(x + r, y);
            path.arc(x, y, r, 0, Math.PI * 2);
          }

          const fd = (x - fx) * (x - fx) + (y - fy) * (y - fy);
          if (fd < markBest) {
            markBest = fd;
            markX = x;
            markY = y;
          }
        }
      }

      // The whole raster, in one fill.
      ctx.fillStyle = paper;
      ctx.globalAlpha = 0.82;
      ctx.fill(path);

      // The point. Fixed radius, full strength — a mark, not a member of the
      // field. Drawn last so the raster never crosses it.
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(markX, markY, PITCH * 0.44, 0, Math.PI * 2);
      ctx.fill();
    };

    // ── Sizing ────────────────────────────────────────────────────────
    let raf = 0;
    let running = false;
    let start = 0;
    /** Seconds of plate-time already played, carried across a pause. */
    let elapsed = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Draw in CSS pixels; the transform carries the device ratio.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) draw(still ? 0 : (performance.now() - start) / 1000);
    };

    // ── The loop ──────────────────────────────────────────────────────
    const frame = (now: number) => {
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };

    const play = () => {
      if (running || still) return;
      running = true;
      // Rebase the clock so a plate that has been paused resumes where it
      // stopped instead of jumping forward by the length of the pause.
      start = performance.now() - elapsed * 1000;
      raf = requestAnimationFrame(frame);
    };

    const pause = () => {
      if (!running) return;
      running = false;
      elapsed = (performance.now() - start) / 1000;
      cancelAnimationFrame(raf);
    };

    start = performance.now();
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // On screen or not — the only question that decides whether we burn a
    // frame budget on this.
    let visible = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible = entry.isIntersecting;
        if (visible && !document.hidden) play();
        else pause();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (!document.hidden && visible) play();
      else pause();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={`${styles.field}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
