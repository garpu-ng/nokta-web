"use client";

import { useEffect, useRef, useState } from "react";
import Registration from "@/components/print/Registration";
import { INK } from "@/lib/colors";
import styles from "./DotCursor.module.css";

/* The dot is the cursor — and it draws.

   nokta is Turkish for dot, and on a desktop pointer the studio's red dot takes
   the pointer's place: it follows a beat behind the hand (a plotter head never
   quite keeps up), and it leaves a plotted ink trail that fades off the sheet
   after 600ms. Over anything you can press it swells; over a work on the wall
   it becomes the registration mark that work's card strikes on its own corner;
   over a text field it stands down and hands the native cursor back.

   THE CONTRACT:
     · Strictly (hover: hover) and (pointer: fine). A touch screen never sees it.
     · prefers-reduced-motion: reduce → the native cursor simply stays. A dot
       that trails, lags and morphs is motion; there is no honest reduced
       version of it, so the feature does not run at all.
     · `cursor: none` is applied by ONE class this component puts on <body>.
       No JS, a thrown error, an ad blocker — the class is never added and the
       native cursor is simply there. The stylesheet alone never hides it.
     · Pure overlay: pointer-events none, aria-hidden, no listener that could
       swallow a click. Focus outlines are untouched — the keyboard reader
       never meets this at all.

   Surfaces opt into a different pointer with `data-nk-cursor`:
     "registration" → the crosshair (the wall's cards)
     "native"       → hands the native cursor back (the /punkt canvas, which
                      states its own crosshair). */

type Mode = "dot" | "link" | "registration" | "off";

/** How long a plotted point stays on the sheet. */
const TRAIL_MS = 600;
/** How many positions the pen remembers. */
const TRAIL_MAX = 40;
/** Follow lag — the fraction of the remaining distance closed each frame. */
const EASE = 0.19;
/** Under this the pen counts as parked and lays down no new point. */
const MIN_STEP = 0.6;
/** Put on <body> by this component only — see app/styles/base.css. */
const HIDE_NATIVE = "nk-cursor-off";

/* Anything that takes typed input: the native caret is the only honest cursor
   there, so the plotted one steps aside. */
const TEXT_FIELD =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]),textarea,[contenteditable=""],[contenteditable="true"]';
/* Anything that can be pressed. */
const HANDLE = 'a[href],button,summary,label,select,[role="button"],[role="link"]';

function modeFor(target: EventTarget | null): Mode {
  if (!(target instanceof Element)) return "dot";
  if (target.closest(TEXT_FIELD)) return "off";
  const marked = target.closest<HTMLElement>("[data-nk-cursor]");
  if (marked) {
    const want = marked.dataset.nkCursor;
    if (want === "native") return "off";
    if (want === "registration") return "registration";
  }
  if (target.closest(HANDLE)) return "link";
  return "dot";
}

export default function DotCursor() {
  const [active, setActive] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const penRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // The gate. Nothing renders until the environment has been read, so the
  // server markup carries no cursor at all and there is nothing to hydrate.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const layer = layerRef.current;
    const pen = penRef.current;
    const canvas = canvasRef.current;
    if (!layer || !pen || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const body = document.body;
    const root = document.documentElement;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Parked until the hand first moves: hiding the native cursor before the
    // dot has a position would leave the reader with no pointer at all.
    layer.dataset.parked = "";
    layer.dataset.mode = "dot";

    const trail: { x: number; y: number; t: number }[] = [];
    let tx = 0; // where the hand is
    let ty = 0;
    let px = 0; // where the pen is
    let py = 0;
    let placed = false;
    let mode: Mode = "dot";
    let pending: EventTarget | null = null;
    let hasPending = false;
    let raf = 0;

    const setMode = (next: Mode) => {
      if (next === mode) return;
      mode = next;
      layer.dataset.mode = next;
      body.classList.toggle(HIDE_NATIVE, next !== "off");
    };

    const paint = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = INK;
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        const life = 1 - (now - b.t) / TRAIL_MS;
        if (life <= 0.02) continue;
        // Squared falloff: the ink is spent quickly and the tail is a whisper.
        ctx.globalAlpha = life * life * 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = 0;
      if (hasPending) {
        setMode(modeFor(pending));
        pending = null;
        hasPending = false;
      }

      px += (tx - px) * EASE;
      py += (ty - py) * EASE;
      pen.style.transform = `translate3d(${px.toFixed(2)}px,${py.toFixed(2)}px,0)`;

      const last = trail[trail.length - 1];
      if (!last || Math.abs(px - last.x) + Math.abs(py - last.y) > MIN_STEP) {
        trail.push({ x: px, y: py, t: now });
        if (trail.length > TRAIL_MAX) trail.shift();
      }
      while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
      paint(now);

      // The loop only runs while there is something to move or to fade; a
      // parked pointer costs nothing.
      if (trail.length > 1 || Math.abs(tx - px) > 0.2 || Math.abs(ty - py) > 0.2) {
        raf = requestAnimationFrame(frame);
      } else {
        trail.length = 0;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const run = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!placed) {
        placed = true;
        px = tx;
        py = ty;
        delete layer.dataset.parked;
        body.classList.add(HIDE_NATIVE);
      }
      pending = e.target;
      hasPending = true;
      run();
    };

    // Off the sheet: the native cursor belongs to whatever the hand went to.
    const park = () => {
      if (!placed) return;
      placed = false;
      trail.length = 0;
      layer.dataset.parked = "";
      body.classList.remove(HIDE_NATIVE);
      ctx.clearRect(0, 0, w, h);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("blur", park);
    root.addEventListener("pointerleave", park);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      window.removeEventListener("blur", park);
      root.removeEventListener("pointerleave", park);
      body.classList.remove(HIDE_NATIVE);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={layerRef} className={styles.layer} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.trail} />
      <div ref={penRef} className={styles.pen}>
        <span className={styles.point} />
        {/* The same mark the card strikes on its corner — here it is what your
            hand becomes when it reaches for one. */}
        <Registration className={styles.cross} />
      </div>
    </div>
  );
}
