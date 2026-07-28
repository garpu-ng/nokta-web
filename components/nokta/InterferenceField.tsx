"use client";

import { useEffect, useRef } from "react";
import styles from "./InterferenceField.module.css";

/* ── Interferenz ──────────────────────────────────────────────────────
   The studio's abstract plate: a halftone raster with wave sources running
   through it. One component, two variants, and the intention is that it
   becomes the house pattern — a page that wants a plate asks for one here
   rather than inventing its own.

   The idea is the studio's own, taken literally. nokta is the dot; the wall
   is made of dots; so the plate is a lattice of dots and nothing else. What
   moves is not the dots — they never leave their grid positions — but their
   SIZE, which is exactly how a halftone screen carries a tone: constant ink,
   varying dot. Sources emit circular waves, the waves cross, and where two
   crests meet the dots open up and the raster turns to paper. It is the
   oldest trick in offset printing driven by the oldest equation in physics,
   and it is the reason the plate reads as printed rather than as rendered.

   The lattice is laid at 15°, because that is the screen angle a printer
   gives a single-colour halftone: on the square it moires against the paper's
   own grid, at 15° it doesn't. Nobody will name the angle. Everybody sees
   that it sits right.

   THE TWO VARIANTS — the same physics, asked a different question:

     "single"  (the homepage plate) — two sources wandering a square field,
       and exactly ONE red dot: the lattice point nearest a third, slower
       focus, redrawn at a fixed size so it stays a mark while the field
       around it breathes. The studio's point, living inside the raster.

     "meeting" (the contact plate) — two sources that approach and part along
       the page's axis, and every dot standing on a true crest of BOTH waves
       is struck in the accent. On the page where two parties are supposed to
       find each other, the red is precisely the set of places where they
       agree. It travels as the sources travel.

   In both variants the accent is dots and only ever dots. The house rule is
   that the red may be a field at most once per page — on /kontakt that ration
   is already spent on the rail's disc — so this plate never spends it.

   Craft notes, in the order they matter:
     · Every dot is one entry in a Path2D and the whole raster is one fill()
       per colour per frame — two fills, not eleven hundred. Radius carries
       the tone, so no per-dot alpha and no per-dot state is needed.
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
/** "meeting" only: how high a dot's amplitude must run before it is struck in
    the accent. High on purpose. Note this cannot be judged by the count it
    selects — at 0.90 it takes under 7% of the dots, which sounds like an
    accent and is not, because amplitude also drives radius: the struck dots
    are always the BIGGEST ones on the plate, so they carry several times the
    ink their number suggests. 0.95 takes about 3%, which is what actually
    reads as a scatter of marks along the crest lines rather than as a wash. */
const AGREEMENT = 0.95;
/** Never rasterise more than this — a retina 4K plate would otherwise ask for
    four times the fill rate it needs to look identical. */
const MAX_DPR = 2;

export type FieldVariant = "single" | "meeting";

export default function InterferenceField({
  variant = "single",
  className,
}: {
  /** Which question the physics is asked — see the note above. */
  variant?: FieldVariant;
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

    const meeting = variant === "meeting";
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

      let ax: number, ay: number, bx: number, by: number;
      if (meeting) {
        // Two parties on the page's own axis, closing and opening again. The
        // separation never reaches zero: they meet, they do not merge.
        const sep = 0.30 + 0.11 * Math.sin(t * 0.085);
        ax = cx - sep * width;
        ay = cy + 0.13 * height * Math.sin(t * 0.13);
        bx = cx + sep * width;
        by = cy - 0.13 * height * Math.sin(t * 0.11 + 0.9);
      } else {
        // Slow Lissajous paths whose frequencies share no common factor — so
        // the pattern never repeats inside a visit.
        ax = cx + 0.34 * width * Math.cos(t * 0.11);
        ay = cy + 0.30 * height * Math.sin(t * 0.17);
        bx = cx + 0.30 * width * Math.cos(t * 0.13 + 2.1);
        by = cy + 0.34 * height * Math.sin(t * 0.09 + 1.3);
      }
      // "single" only — a third focus, slower than both, that the red dot
      // follows through the lattice.
      const fx = cx + 0.38 * width * Math.cos(t * 0.05 + 0.7);
      const fy = cy + 0.33 * height * Math.sin(t * 0.07);

      ctx.clearRect(0, 0, width, height);

      const path = new Path2D();
      const struck = new Path2D();
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
            const into = meeting && amp > AGREEMENT ? struck : path;
            into.moveTo(x + r, y);
            into.arc(x, y, r, 0, Math.PI * 2);
          }

          if (!meeting) {
            const fd = (x - fx) * (x - fx) + (y - fy) * (y - fy);
            if (fd < markBest) {
              markBest = fd;
              markX = x;
              markY = y;
            }
          }
        }
      }

      // The raster, in one fill.
      ctx.fillStyle = paper;
      ctx.globalAlpha = 0.82;
      ctx.fill(path);

      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      if (meeting) {
        // Every place the two waves agree, in one more fill.
        ctx.fill(struck);
      } else {
        // The point. Fixed radius, full strength — a mark, not a member of
        // the field. Drawn last so the raster never crosses it.
        ctx.beginPath();
        ctx.arc(markX, markY, PITCH * 0.44, 0, Math.PI * 2);
        ctx.fill();
      }
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
  }, [variant]);

  return (
    <canvas
      ref={ref}
      className={`${styles.field}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
