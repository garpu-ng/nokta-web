"use client";

import { useEffect, useRef } from "react";
import { makeKnockout, plateInk } from "./plate/knockout";
import { interference, mountPlate, type Plate } from "./plate/mountPlate";
import styles from "./InterferenceField.module.css";

/* ── Linienfeld ───────────────────────────────────────────────────────
   The quiet one. The same standing field as every other plate, read the
   cheapest way a field can be read: a stack of straight rules, each one
   allowed to bend by however much the field is worth underneath it.

   This exists because a plate that sits BEHIND a page has a different job
   from one that sits in a frame on it. A framed plate may be the most
   interesting thing in view. A backdrop may not be interesting at all — it
   has to survive being looked past, all day, under body copy, without ever
   competing for the eye. So: no contour extraction, no volumes, no colour.
   Ruled lines, barely displaced.

   It is also, by a wide margin, the cheapest thing in the family. The contour
   plate it replaces sampled some three thousand points and stroked ten
   thousand two-point subpaths a frame; this samples about fifteen hundred and
   strokes two dozen polylines. Same equation underneath — it is still the
   family — but a backdrop should not cost what a centrepiece costs. */

/** Distance between two rules, CSS px. */
const SPACING = 30;
/** Horizontal sampling step along a rule. Coarser than it looks: the field is
    smooth at this wavelength, so a straight hop between samples is invisible
    and each doubling here halves the plate's cost. */
const STEP = 26;
/** How far a rule may be pushed off its baseline, CSS px. */
const LIFT = 17;
/** Wavelength of the field, CSS px, at the width the plate was drawn at. */
const WAVELENGTH = 260;
const REFERENCE_W = 1600;

export default function RidgeField({
  motto,
  className,
}: {
  /** A title to knock out of the ruling. Already translated by the caller. */
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

      const plate: Plate = {
        resize(width, height, dpr) {
          w = width;
          h = height;
          cut?.layout(width, height, dpr);
          k = (2 * Math.PI) / (WAVELENGTH * Math.max(0.5, w / REFERENCE_W));
        },

        draw(t) {
          if (w === 0 || h === 0) return;
          const cx = w / 2;
          const cy = h / 2;

          // Slower than any other plate in the family. A backdrop that moves
          // at the speed of a centrepiece is a backdrop nobody can read past.
          const ax = cx + 0.42 * w * Math.cos(t * 0.045);
          const ay = cy + 0.38 * h * Math.sin(t * 0.062);
          const bx = cx + 0.36 * w * Math.cos(t * 0.053 + 2.2);
          const by = cy + 0.33 * h * Math.sin(t * 0.039 + 1.5);

          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = paper;
          ctx.lineWidth = 1;
          ctx.lineJoin = "round";
          ctx.lineCap = "butt";

          const path = new Path2D();
          for (let y = SPACING / 2; y < h + SPACING; y += SPACING) {
            let first = true;
            for (let x = -STEP; x <= w + STEP; x += STEP) {
              const amp = interference(x, y, ax, ay, bx, by, k, t);
              const py = y + (amp - 0.5) * 2 * LIFT;
              if (first) {
                path.moveTo(x, py);
                first = false;
              } else {
                path.lineTo(x, py);
              }
            }
          }
          // Every rule in one path and one stroke: they share a colour and a
          // weight, so there is nothing to be gained by stroking them apart.
          ctx.stroke(path);

          // The title, cut out of the ruling rather than laid on top of it.
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
