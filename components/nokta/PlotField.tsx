"use client";

import { useEffect, useRef } from "react";
import { makeKnockout, plateInk } from "./plate/knockout";
import { interference, mountPlate, type Plate } from "./plate/mountPlate";
import styles from "./InterferenceField.module.css";

/* ── Plotterbahn ──────────────────────────────────────────────────────
   The fourth reading of the same field, and the only one that is not a
   picture of a state. The other three show you where the field IS: dots
   sized by it, contours through it, volumes raised out of it. This one shows
   something being MADE — which is what the page it heads is about.

   A handful of pens are put down on the plate and told one rule: walk the
   field's contour, holding the value under you constant while the world
   curves around you. Each drags a trail behind it, the trail is finite, and
   the whole drawing is therefore always in the middle of happening. Nothing
   here ever arrives at a finished frame; stop watching and you have stopped
   watching a process, not missed an ending.

   THE ONE CONSTRAINT that gives it its look: a pen's heading is an integer,
   not a real. The circle is cut into twelve notches and a pen may change by
   at most one of them per step, however urgently the field argues. That is
   the honesty of a machine which physically cannot draw a smooth curve — a
   plotter, a stepper motor, a milling head — and in exchange it gives back an
   angular, faceted line no spline could counterfeit. Curves become polygons.
   The tension between what the field asks and what the pen is allowed to do
   is where the whole drawing lives.

   The plate is deliberately cheap: twenty-six pens holding a hundred and ten
   points each is under three thousand line segments a frame, and the field is
   sampled four times per pen per step and not otherwise. */

/** How many pens are down at once. */
const PENS = 26;
/** Points a pen remembers. The trail's length is the drawing's memory. */
const TRAIL = 110;
/** The plotter's stride, CSS px. */
const STRIDE = 6;
/** Divisions of the circle. Twelve gives 30° facets — coarse enough that the
    quantisation is legible as quantisation rather than averaging away into a
    smooth curve, which is the whole point of it. */
const NOTCHES = 12;
/** Notches a pen may turn in one step. */
const TURN = 1;
/** Steps before a pen is lifted and set down somewhere else. */
const LIFE = 420;
/** Finite-difference arm for the gradient, CSS px. */
const EPS = 2;
/** Wavelength of the field, CSS px, at the width the plate was drawn at. */
const WAVELENGTH = 180;
const REFERENCE_W = 1420;

type Pen = {
  x: number;
  y: number;
  /** Heading, as a notch index. */
  h: number;
  life: number;
  /** Ring buffer of the trail, oldest first once it has wrapped. */
  tx: Float32Array;
  ty: Float32Array;
  n: number;
};

export default function PlotField({
  motto,
  className,
}: {
  /** A title to knock out of the drawing. Already translated by the caller. */
  motto?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    return mountPlate(canvas, (ctx) => {
      const { paper, accent, face } = plateInk(canvas);
      const cut = motto ? makeKnockout(motto, face, paper, accent) : null;

      let w = 0;
      let h = 0;
      let k = (2 * Math.PI) / WAVELENGTH;
      let pens: Pen[] = [];
      // Deterministic placement: the same plate always starts the same way,
      // so a reload is a redraw of one drawing rather than a new one.
      let seed = 20260728;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };

      const setDown = (p: Pen) => {
        p.x = rnd() * w;
        p.y = rnd() * h;
        p.h = Math.floor(rnd() * NOTCHES);
        p.life = Math.floor(LIFE * (0.4 + 0.6 * rnd()));
        p.n = 0;
      };

      const plate: Plate = {
        resize(width, height, dpr) {
          w = width;
          h = height;
          k = (2 * Math.PI) / (WAVELENGTH * Math.max(0.45, w / REFERENCE_W));
          seed = 20260728;
          pens = Array.from({ length: PENS }, () => {
            const p: Pen = {
              x: 0, y: 0, h: 0, life: 0,
              tx: new Float32Array(TRAIL),
              ty: new Float32Array(TRAIL),
              n: 0,
            };
            setDown(p);
            return p;
          });
          cut?.layout(width, height, dpr);
        },

        draw(t) {
          if (w === 0 || h === 0) return;
          const cx = w / 2;
          const cy = h / 2;
          // The field drifts slowly, so the contours a pen is following move
          // under it and no pen ever closes a loop and repeats itself.
          const ax = cx + 0.38 * w * Math.cos(t * 0.05);
          const ay = cy + 0.32 * h * Math.sin(t * 0.071);
          const bx = cx + 0.33 * w * Math.cos(t * 0.062 + 2.1);
          const by = cy + 0.3 * h * Math.sin(t * 0.044 + 1.2);

          const notch = (2 * Math.PI) / NOTCHES;

          for (const p of pens) {
            // The contour direction is perpendicular to the gradient: walk it
            // and the field's value beneath you stays put.
            const gx =
              interference(p.x + EPS, p.y, ax, ay, bx, by, k, t) -
              interference(p.x - EPS, p.y, ax, ay, bx, by, k, t);
            const gy =
              interference(p.x, p.y + EPS, ax, ay, bx, by, k, t) -
              interference(p.x, p.y - EPS, ax, ay, bx, by, k, t);

            // At an extremum the gradient vanishes and the field has no
            // opinion; the pen simply holds its heading.
            if (Math.abs(gx) > 1e-9 || Math.abs(gy) > 1e-9) {
              const want = Math.round(Math.atan2(gx, -gy) / notch);
              let d = ((want - p.h) % NOTCHES + NOTCHES) % NOTCHES;
              if (d > NOTCHES / 2) d -= NOTCHES;
              p.h =
                (p.h + Math.max(-TURN, Math.min(TURN, d)) + NOTCHES) % NOTCHES;
            }

            const a = p.h * notch;
            p.x += STRIDE * Math.cos(a);
            p.y += STRIDE * Math.sin(a);
            p.life--;

            const out = p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20;
            if (out || p.life <= 0) {
              setDown(p);
            } else {
              const i = p.n % TRAIL;
              p.tx[i] = p.x;
              p.ty[i] = p.y;
              p.n++;
            }
          }

          ctx.clearRect(0, 0, w, h);
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.strokeStyle = paper;
          ctx.lineWidth = 1.4;
          ctx.globalAlpha = 0.55;

          const path = new Path2D();
          for (const p of pens) {
            const count = Math.min(p.n, TRAIL);
            if (count < 2) continue;
            // Oldest first, so the polyline runs the way it was drawn.
            const from = p.n > TRAIL ? p.n - TRAIL : 0;
            for (let j = 0; j < count; j++) {
              const i = (from + j) % TRAIL;
              if (j === 0) path.moveTo(p.tx[i], p.ty[i]);
              else path.lineTo(p.tx[i], p.ty[i]);
            }
          }
          ctx.stroke(path);

          // The pens themselves — the only part of this drawing that is
          // happening right now rather than having happened.
          ctx.globalAlpha = 1;
          ctx.fillStyle = paper;
          const heads = new Path2D();
          for (const p of pens) {
            if (p.n < 1) continue;
            heads.moveTo(p.x + 2.6, p.y);
            heads.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
          }
          ctx.fill(heads);

          // The title, cut out of the drawing rather than laid over it.
          cut?.punch(ctx);
          cut?.paint(ctx);
        },
      };

      return plate;
    });
  }, [motto]);

  return (
    <canvas
      ref={ref}
      className={`${styles.field}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
