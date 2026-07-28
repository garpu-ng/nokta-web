"use client";

import { useEffect, useRef } from "react";
import styles from "./InterferenceField.module.css";

/* ── Interferenz ──────────────────────────────────────────────────────
   The studio's abstract plate: a halftone raster with wave sources running
   through it. One component, two variants, and the intention is that it is
   the house pattern — a page that wants a plate asks for one here rather than
   inventing its own.

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

     "single" — an open raster, and (with `motto`) the studio's line standing
       in it. No mark of its own: the accent's whole appearance here is the
       sentence's closing period, which is what the red is for on this site.

     "meeting" — two sources that approach and part along the page's axis, and
       every dot standing on a true crest of BOTH waves is struck in the
       accent. On the page where two parties are supposed to find each other,
       the red is precisely the set of places where they agree. It travels as
       the sources travel.

   In both variants the accent is dots, marks and periods, never a surface.

   THE KNOCKOUT. When a `motto` is given, the raster does not run behind the
   type — it gets out of its way. The line is drawn once into an offscreen
   canvas, stroked with a fat round pen before it is filled so the glyphs come
   out dilated by a clear margin, and that canvas is kept as an alpha mask.
   Any lattice position landing inside the mask is simply never drawn. This is
   how the same page would be printed: the type is not laid over the screen,
   it is knocked out of it, and what surrounds a letter is clean paper rather
   than a dot cut in half. The mask is rebuilt only when the plate is resized
   or the webfont finally lands — never per frame — so the cost is a lookup.

   Craft notes, in the order they matter:
     · Every dot is one entry in a Path2D and the whole raster is one fill()
       per colour per frame — two fills, not eleven hundred. Radius carries
       the tone, so no per-dot alpha and no per-dot state is needed.
     · The loop runs only when the plate is actually on screen AND the tab is
       actually visible. Off-screen it is not throttled, it is stopped.
     · prefers-reduced-motion draws exactly one frame and never starts a loop.
       The plate is still a plate; it simply holds its breath.
     · The canvas is decoration and says so — but a `motto` is real language,
       so the consumer renders it as text too and hides that copy visually.
       Nothing here is ever the only carrier of a sentence. */

/** Screen angle of the raster. A printer's answer, in radians. */
const SCREEN_ANGLE = (15 * Math.PI) / 180;
/** Lattice pitch in CSS px — the distance between two dot centres — at the
    size the plate was drawn at, and the floor it may not go under.

    The pitch is not a constant: a printer choosing a screen picks one fine
    enough that the sheet reads as a tone rather than as a pattern of dots, and
    a small sheet therefore gets a finer screen. Held at 21 a phone-width plate
    fits only seventeen dots across and reads as polka dots; scaled, it keeps
    roughly the same dot COUNT at every size, which is what makes it a raster
    at every size. */
const PITCH = 21;
const PITCH_MIN = 9;
/** Dots across the plate, whatever the plate's width. */
const ACROSS = 68;
/** Biggest a field dot may grow, as a fraction of the pitch. Below 0.5 the
    dots never touch, so the raster stays a raster even at full crest. */
const MAX_DOT = 0.4;
/** Wavelength of the interference, as a multiple of the pitch. Tied to the
    pitch rather than fixed in pixels so the fringes stay the same size
    RELATIVE to the screen — a fixed 112px would put barely three fringes
    across a phone-width plate. */
const WAVELENGTH = 112 / 21;
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
/** How far the raster is held off the type, as a fraction of the cap height.
    Generous: the point of a knockout is that the letter has air around it. */
const DODGE = 0.2;
/** Type is set at the largest size that fits this much of the plate's width.
    The remaining sixth is the line's own margin — a knockout needs air on the
    outside as well as around each letter. */
const TEXT_W = 0.78;
/** …and this much of its height. The height budget is the real composition
    control, and it is deliberately mean on a wide plate. The fitter maximises
    SIZE, and two lines can always be set larger than one, so a generous height
    silently buys a stacked block that fills the plate and turns the raster
    into a frame around a headline. Starving the height makes a single line the
    only thing that fits, which is the composition this wants: a field, with a
    sentence standing in it. A squarer plate (a phone) has no room for that
    trick and gets the height back, so the line can stack and stay legible. */
const TEXT_H_WIDE = 0.22;
const TEXT_H_TALL = 0.52;
/** Never rasterise more than this — a retina 4K plate would otherwise ask for
    four times the fill rate it needs to look identical. */
const MAX_DPR = 2;

export type FieldVariant = "single" | "meeting";

export default function InterferenceField({
  variant = "single",
  motto,
  className,
}: {
  /** Which question the physics is asked — see the note above. */
  variant?: FieldVariant;
  /** A line to knock out of the raster. Already translated by the caller. */
  motto?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Colours and face are read off the cascade rather than hardcoded, so the
    // plate can never drift out of sync with tokens.css.
    const css = getComputedStyle(canvas);
    const paper = css.getPropertyValue("--nk-field-ink").trim() || "#e9e0ce";
    const accent = css.getPropertyValue("--nk-field-mark").trim() || "#b83636";
    const face =
      css.getPropertyValue("--nk-field-face").trim() || "Arial, sans-serif";

    const meeting = variant === "meeting";
    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    /** Screen chosen for the plate's size — see PITCH. Set in resize(). */
    let pitch = PITCH;
    let k = (2 * Math.PI) / (PITCH * WAVELENGTH);
    const cos = Math.cos(SCREEN_ANGLE);
    const sin = Math.sin(SCREEN_ANGLE);

    // ── The knocked-out line ──────────────────────────────────────────
    let mask: Uint8ClampedArray | null = null;
    let maskW = 0;
    let lines: string[] = [];
    let lineX: number[] = [];
    let fontSize = 0;
    let step = 0;
    let firstBaseline = 0;

    /** Greedy wrap at a given size. Languages that do not space their words
        (the Japanese line) are broken by character instead. */
    const wrap = (m: CanvasRenderingContext2D, size: number, maxW: number) => {
      m.font = `700 ${size}px ${face}`;
      const spaced = motto!.includes(" ");
      const parts = spaced ? motto!.split(" ") : Array.from(motto!);
      const glue = spaced ? " " : "";
      const out: string[] = [];
      let cur = "";
      for (const part of parts) {
        const test = cur ? cur + glue + part : part;
        if (cur && m.measureText(test).width > maxW) {
          out.push(cur);
          cur = part;
        } else {
          cur = test;
        }
      }
      if (cur) out.push(cur);
      return out;
    };

    /** Lay the line out as large as it will go, then bake the dodge mask. */
    const layout = () => {
      mask = null;
      if (!motto || width === 0 || height === 0) return;

      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.ceil(width));
      off.height = Math.max(1, Math.ceil(height));
      const mc = off.getContext("2d", { willReadFrequently: true });
      if (!mc) return;

      const boxW = width * TEXT_W;
      const boxH = height * (height / width > 0.5 ? TEXT_H_TALL : TEXT_H_WIDE);

      // Largest size whose wrapped block still fits the box. Binary search
      // rather than a formula: wrapping changes the line count underneath us,
      // so the fit is not monotonic in any expression worth writing.
      let lo = 9;
      let hi = Math.max(10, Math.min(width * 0.16, height * 0.7));
      let best = lo;
      let bestLines = [motto];
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        const ls = wrap(mc, mid, boxW);
        const w = Math.max(...ls.map((s) => mc.measureText(s).width));
        if (w <= boxW && ls.length * mid * 1.14 <= boxH) {
          best = mid;
          bestLines = ls;
          lo = mid;
        } else {
          hi = mid;
        }
      }

      fontSize = best;
      lines = bestLines;
      step = fontSize * 1.14;
      firstBaseline = (height - step * lines.length) / 2 + fontSize * 0.84;

      mc.font = `700 ${fontSize}px ${face}`;
      lineX = lines.map((s) => (width - mc.measureText(s).width) / 2);

      // Stroke-then-fill with a fat round pen dilates every glyph by exactly
      // the margin the raster must keep off it.
      mc.textBaseline = "alphabetic";
      mc.lineJoin = "round";
      mc.lineCap = "round";
      mc.lineWidth = Math.max(6, fontSize * DODGE) * 2;
      mc.strokeStyle = "#fff";
      mc.fillStyle = "#fff";
      lines.forEach((s, i) => {
        const y = firstBaseline + i * step;
        mc.strokeText(s, lineX[i], y);
        mc.fillText(s, lineX[i], y);
      });

      mask = mc.getImageData(0, 0, off.width, off.height).data;
      maskW = off.width;
    };

    /** Is this lattice position inside the type's clear space? */
    const dodged = (x: number, y: number) => {
      if (!mask) return false;
      const ix = x | 0;
      const iy = y | 0;
      if (ix < 0 || iy < 0 || ix >= maskW) return false;
      const a = mask[(iy * maskW + ix) * 4 + 3];
      return a !== undefined && a > 8;
    };

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

      ctx.clearRect(0, 0, width, height);

      const path = new Path2D();
      const struck = new Path2D();
      const maxR = pitch * MAX_DOT;
      // The lattice is rotated, so it has to be generated over a disc wide
      // enough to still cover the corners once turned.
      const reach = Math.ceil((Math.hypot(width, height) / 2 + pitch) / pitch);

      for (let iy = -reach; iy <= reach; iy++) {
        for (let ix = -reach; ix <= reach; ix++) {
          const x = cx + ix * pitch * cos - iy * pitch * sin;
          const y = cy + ix * pitch * sin + iy * pitch * cos;
          if (x < -pitch || x > width + pitch) continue;
          if (y < -pitch || y > height + pitch) continue;
          if (dodged(x, y)) continue;

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
        }
      }

      // The raster, in one fill.
      ctx.fillStyle = paper;
      ctx.globalAlpha = 0.82;
      ctx.fill(path);
      ctx.globalAlpha = 1;

      // Every place the two waves agree, in one more.
      if (meeting) {
        ctx.fillStyle = accent;
        ctx.fill(struck);
      }

      // The line, standing in the clearing the raster left it. Its closing
      // period is the accent — the same move the hero and the footer wordmark
      // make, and the only red on this plate.
      if (mask && lines.length) {
        ctx.font = `700 ${fontSize}px ${face}`;
        ctx.textBaseline = "alphabetic";
        lines.forEach((s, i) => {
          const y = firstBaseline + i * step;
          const last = i === lines.length - 1;
          const body = last ? s.slice(0, -1) : s;
          ctx.fillStyle = paper;
          ctx.fillText(body, lineX[i], y);
          if (last && s.length) {
            ctx.fillStyle = accent;
            ctx.fillText(s.slice(-1), lineX[i] + ctx.measureText(body).width, y);
          }
        });
      }
    };

    // ── Sizing ────────────────────────────────────────────────────────
    let raf = 0;
    let running = false;
    let start = 0;
    /** Seconds of plate-time already played, carried across a pause. */
    let elapsed = 0;

    const paintOnce = () =>
      draw(still ? 0 : (performance.now() - start) / 1000);

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
      pitch = Math.max(PITCH_MIN, Math.min(PITCH, width / ACROSS));
      k = (2 * Math.PI) / (pitch * WAVELENGTH);
      layout();
      if (!running) paintOnce();
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

    // The first layout may have been measured in the fallback face. Once the
    // real one is in, measure and re-cut the mask against it.
    let dead = false;
    if (motto && typeof document.fonts?.ready?.then === "function") {
      document.fonts.ready.then(() => {
        if (dead) return;
        layout();
        if (!running) paintOnce();
      });
    }

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
      dead = true;
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [variant, motto]);

  return (
    <canvas
      ref={ref}
      className={`${styles.field}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
