"use client";

import { useEffect, useRef } from "react";
import styles from "./MottoDot.module.css";

/* The motto's closing period — and, once, the dot that wanders off it.

   The studio is named after a dot, and the one coloured mark on the home page
   is the period that closes "vom Punkt zur Linie zur Form". If the page is left
   alone for half a minute, that period lifts off the line, rolls up to the
   masthead's baseline, bounces its way back along it and settles into its own
   place again — about six seconds, once per view of the page. Touch it, scroll,
   type, move the hand: it darts home immediately.

   IT CANNOT MOVE THE PAGE. The real period never leaves the text — it is only
   made invisible while its twin, an absolutely positioned disc, does the
   travelling on transform alone. Layout is identical before, during and after.

   Never on a touch screen, never against a reduced-motion request, never while
   the tab is in the background, and never if the motto is not on screen when
   the moment comes.

   For testing only: ?idle=<seconds> shortens the wait (clamped 2–120s), since
   otherwise the egg takes half a minute of perfect stillness to see. */

/** How long the page must be left alone, in ms. */
const IDLE_MS = 30_000;
/** Resting size of the twin, as a fraction of its own box: the disc sits at
    the period's weight until it lifts, and returns to it before the swap back. */
const REST = 0.62;
/** The dart home when the reader comes back mid-journey. */
const DART_MS = 340;

/** A leg of the journey: where it ends, how long it takes, how high it arcs. */
type Leg = { x: number; y: number; ms: number; arc: number; ease: (t: number) => number };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const linear = (t: number) => t;

function idleDelay(): number {
  const raw = new URLSearchParams(window.location.search).get("idle");
  const secs = raw === null ? NaN : Number(raw);
  if (!Number.isFinite(secs)) return IDLE_MS;
  return Math.min(120_000, Math.max(2_000, secs * 1_000));
}

export default function MottoDot() {
  const hostRef = useRef<HTMLSpanElement>(null);
  const realRef = useRef<HTMLSpanElement>(null);
  const twinRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const real = realRef.current;
    const twin = twinRef.current;
    if (!host || !real || !twin) return;
    if (typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wait = idleDelay();
    let timer = 0;
    let raf = 0;
    let spent = false; // one journey per view of the page — an egg, not a loop
    let running = false;
    let legs: Leg[] = [];
    let total = 0;
    let began = 0;
    let dartFrom: { x: number; y: number; s: number } | null = null;
    let dartBegan = 0;
    let at = { x: 0, y: 0, s: REST };

    const place = () => {
      twin.style.transform = `translate3d(${at.x.toFixed(2)}px,${at.y.toFixed(2)}px,0) scale(${at.s.toFixed(3)})`;
    };

    /* The route, measured from where the period actually sits: up to the
       masthead's last baseline, left to where the headline starts, then three
       shortening bounces back along it and home. */
    const route = (): Leg[] => {
      const h = host.getBoundingClientRect();
      const leadEl = document.querySelector(".nk-statement-lead");
      const lead = leadEl ? leadEl.getBoundingClientRect() : h;
      // Negative = up and to the left of the period's own place.
      const up = Math.min(-48, lead.bottom - 10 - h.bottom);
      const left = Math.min(-56, lead.left + 12 - h.left);
      return [
        { x: -6, y: -24, ms: 420, arc: 0, ease: easeOut }, // it peels off the line
        { x: left, y: up, ms: 1700, arc: 34, ease: easeInOut }, // travels up the sheet
        { x: left * 0.66, y: up, ms: 700, arc: 46, ease: linear }, // and bounces back
        { x: left * 0.34, y: up, ms: 620, arc: 27, ease: linear },
        { x: left * 0.1, y: up, ms: 540, arc: 13, ease: linear },
        { x: 0, y: 0, ms: 2000, arc: 26, ease: easeInOut }, // home
      ];
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      at = { x: 0, y: 0, s: REST };
      twin.style.opacity = "0";
      twin.style.transform = "";
      real.style.visibility = "";
    };

    const frame = (now: number) => {
      raf = 0;
      if (dartFrom) {
        const t = Math.min(1, (now - dartBegan) / DART_MS);
        const e = easeOut(t);
        at = {
          x: dartFrom.x * (1 - e),
          y: dartFrom.y * (1 - e),
          s: dartFrom.s + (REST - dartFrom.s) * e,
        };
        place();
        if (t >= 1) {
          stop();
          return;
        }
        raf = requestAnimationFrame(frame);
        return;
      }

      const elapsed = now - began;
      if (elapsed >= total) {
        stop();
        return;
      }

      // Which leg, and how far into it.
      let t = elapsed;
      let i = 0;
      while (i < legs.length - 1 && t > legs[i].ms) {
        t -= legs[i].ms;
        i++;
      }
      const leg = legs[i];
      const from = i === 0 ? { x: 0, y: 0 } : legs[i - 1];
      const p = leg.ease(Math.min(1, t / leg.ms));
      const hop = leg.arc * 4 * p * (1 - p); // a parabola over the leg
      at = {
        x: from.x + (leg.x - from.x) * p,
        y: from.y + (leg.y - from.y) * p - hop,
        // It rounds up into the brand dot as it lifts and shrinks back to the
        // period's weight before it settles, so the swap is never a jump cut.
        s: REST + (1 - REST) * Math.max(0, Math.min(1, Math.min(elapsed / 320, (total - elapsed) / 420))),
      };
      place();
      raf = requestAnimationFrame(frame);
    };

    const begin = () => {
      if (spent || running) return;
      if (document.visibilityState !== "visible") return;
      const r = host.getBoundingClientRect();
      // Only if the motto is actually on the reader's screen.
      if (r.top < 8 || r.bottom > window.innerHeight - 8) return;

      spent = true;
      running = true;
      legs = route();
      total = legs.reduce((sum, leg) => sum + leg.ms, 0);
      began = performance.now();
      dartFrom = null;
      at = { x: 0, y: 0, s: REST };
      place();
      real.style.visibility = "hidden";
      twin.style.opacity = "1";
      raf = requestAnimationFrame(frame);
    };

    const arm = () => {
      window.clearTimeout(timer);
      if (spent) return;
      timer = window.setTimeout(begin, wait);
    };

    // Any sign of the reader: the dot goes straight home, and the wait restarts.
    const onInput = () => {
      if (running && !dartFrom) {
        dartFrom = { ...at };
        dartBegan = performance.now();
        if (!raf) raf = requestAnimationFrame(frame);
        return;
      }
      arm();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") arm();
      else window.clearTimeout(timer);
    };

    const EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"] as const;
    for (const type of EVENTS) window.addEventListener(type, onInput, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    arm();

    return () => {
      window.clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      for (const type of EVENTS) window.removeEventListener(type, onInput);
      document.removeEventListener("visibilitychange", onVisibility);
      twin.style.opacity = "0";
      twin.style.transform = "";
      real.style.visibility = "";
    };
  }, []);

  return (
    <span ref={hostRef} className={`nk-statement-dot ${styles.host}`}>
      <span ref={realRef}>.</span>
      {/* The twin. Absolute and at zero opacity until the journey, so it takes
          no space and cannot move a single character of the motto. */}
      <span ref={twinRef} className={styles.twin} aria-hidden="true" />
    </span>
  );
}
