"use client";

import { useEffect, useRef } from "react";
import { interference, mix, mountPlate, type Plate } from "./plate/mountPlate";
import styles from "./InterferenceField.module.css";

/* ── Höhenlinien ──────────────────────────────────────────────────────
   The same standing field as the raster plates, drawn as line rather than as
   dot: every place where the two waves reach the same value, joined up.

   That operation has a name outside this studio — it is a contour, and a
   sheet covered in them is a plan. Which is the point. The dot plates say
   "this is printed"; this one says "this is drawn", and drawing is the other
   half of what the studio does. Nothing here is styled to look technical: it
   is a genuine iso-line extraction, so the lines nest and never cross, close
   on themselves around a crest, and pinch into figure-eights at a saddle
   exactly the way contours on a real survey do.

   The extraction is marching squares. The field is sampled onto a coarse grid
   once per frame; then, for each level, every cell is classified by which of
   its four corners sit above the level, and the segment crossing that cell is
   emitted with its ends linearly interpolated to the true crossing. Sixteen
   cases, two of them ambiguous saddles, and the whole level comes out as one
   Path2D that is stroked once. Sampling the field is the expensive part and it
   happens ONCE for all levels, not once per level.

   Colour: paper for the body of the plan, and three levels lifted into the
   motto palette the way a plan colours the programme it wants read first. */

/** Cell size of the sampling grid, CSS px. Smaller is smoother and costlier. */
const CELL = 17;
/** How many iso-levels are drawn between trough and crest. Every level is a
    full stroke over its own path, so this is the plate's single biggest cost
    and nine reads as a survey just as well as thirteen did. */
const LEVELS = 9;
/** Levels sit inside the field's range rather than at its extremes, where a
    contour degenerates to a dot or to the whole plate. */
const LO = 0.08;
const HI = 0.94;
/** Wavelength of the field, CSS px, at the width the plate was drawn at. */
const WAVELENGTH = 150;
const REFERENCE_W = 1420;

export default function ContourField({
  palette,
  className,
}: {
  /** Motto colours for the lifted levels, in drawing order. */
  palette: string[];
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  // A primitive the effect can actually depend on: an array prop is a fresh
  // reference every render and would rebuild the plate on each one.
  const key = palette.join("|");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const colours = key.split("|");

    return mountPlate(canvas, (ctx) => {
      const css = getComputedStyle(canvas);
      const paper = css.getPropertyValue("--nk-field-ink").trim() || "#e9e0ce";
      /* The motto colours were chosen as FIELDS — mid-dark, to carry paper
         type on top of them. Drawn as a 1px line on ink they are barely
         present, and the plan inverts: the three accents disappear while the
         survey shouts. Lifting each a third of the way to paper keeps the hue
         and gives it back the contrast a line needs. */
      const inks = colours.map((c) => mix(c, paper, 0.34));

      let w = 0;
      let h = 0;
      let cols = 0;
      let rows = 0;
      let grid = new Float32Array(0);
      /* Per-cell range, rebuilt once per frame. Marching squares over 13
         levels means classifying every cell 13 times, and the overwhelming
         majority of those classifications are wasted: a cell spanning
         0.41–0.44 cannot possibly cross a level at 0.7. Two comparisons
         against a cached min/max reject it before any corner is read, which
         is the difference between this plate running at 28fps and at 60. */
      let cellMin = new Float32Array(0);
      let cellMax = new Float32Array(0);
      let k = (2 * Math.PI) / WAVELENGTH;

      const plate: Plate = {
        resize(width, height) {
          w = width;
          h = height;
          cols = Math.ceil(w / CELL) + 1;
          rows = Math.ceil(h / CELL) + 1;
          grid = new Float32Array(cols * rows);
          cellMin = new Float32Array((cols - 1) * (rows - 1));
          cellMax = new Float32Array((cols - 1) * (rows - 1));
          // Fringes keep their size relative to the plate, so a narrow plate
          // is not handed three enormous contours.
          k = (2 * Math.PI) / (WAVELENGTH * (w / REFERENCE_W || 1));
        },

        draw(t) {
          if (w === 0 || h === 0) return;
          const cx = w / 2;
          const cy = h / 2;

          // Two sources, wandering. Frequencies share no common factor, so the
          // plan never settles into a shape it has held before.
          const ax = cx + 0.36 * w * Math.cos(t * 0.09);
          const ay = cy + 0.30 * h * Math.sin(t * 0.14);
          const bx = cx + 0.31 * w * Math.cos(t * 0.12 + 2.3);
          const by = cy + 0.34 * h * Math.sin(t * 0.08 + 1.1);

          // Sample once, for every level.
          for (let r = 0; r < rows; r++) {
            const y = r * CELL;
            for (let c = 0; c < cols; c++) {
              grid[r * cols + c] = interference(
                c * CELL, y, ax, ay, bx, by, k, t,
              );
            }
          }

          // Cell ranges, once for all levels.
          const cw = cols - 1;
          for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cw; c++) {
              const tl = grid[r * cols + c];
              const tr = grid[r * cols + c + 1];
              const br = grid[(r + 1) * cols + c + 1];
              const bl = grid[(r + 1) * cols + c];
              let mn = tl;
              let mx = tl;
              if (tr < mn) mn = tr;
              else if (tr > mx) mx = tr;
              if (br < mn) mn = br;
              else if (br > mx) mx = br;
              if (bl < mn) mn = bl;
              else if (bl > mx) mx = bl;
              const i = r * cw + c;
              cellMin[i] = mn;
              cellMax[i] = mx;
            }
          }

          ctx.clearRect(0, 0, w, h);
          /* Butt caps, not round. Marching squares emits every segment as its
             own two-point subpath, so a round cap is two extra arcs per
             segment across some ten thousand of them a frame — which is where
             this plate's frame budget was actually going, not in the cell
             classification it looked like it should be going in. At a hair
             over 1px the joins are invisible either way. */
          ctx.lineJoin = "miter";
          ctx.lineCap = "butt";

          for (let i = 0; i < LEVELS; i++) {
            const level = LO + ((HI - LO) * i) / (LEVELS - 1);
            const path = new Path2D();

            for (let r = 0; r < rows - 1; r++) {
              for (let c = 0; c < cw; c++) {
                const ci = r * cw + c;
                if (level < cellMin[ci] || level > cellMax[ci]) continue;
                const tl = grid[r * cols + c];
                const tr = grid[r * cols + c + 1];
                const br = grid[(r + 1) * cols + c + 1];
                const bl = grid[(r + 1) * cols + c];

                // Which corners are above the level — the marching-squares case.
                const code =
                  (tl > level ? 8 : 0) |
                  (tr > level ? 4 : 0) |
                  (br > level ? 2 : 0) |
                  (bl > level ? 1 : 0);
                if (code === 0 || code === 15) continue;

                const x0 = c * CELL;
                const y0 = r * CELL;
                const x1 = x0 + CELL;
                const y1 = y0 + CELL;
                // Crossings, linearly interpolated to where the level actually
                // falls between two corners — this is what stops the contour
                // looking like it was traced onto graph paper.
                const top = x0 + CELL * ((level - tl) / (tr - tl));
                const right = y0 + CELL * ((level - tr) / (br - tr));
                const bottom = x0 + CELL * ((level - bl) / (br - bl));
                const left = y0 + CELL * ((level - tl) / (bl - tl));

                const seg = (
                  sx: number, sy: number, ex: number, ey: number,
                ) => {
                  path.moveTo(sx, sy);
                  path.lineTo(ex, ey);
                };

                switch (code) {
                  case 1: case 14: seg(x0, left, bottom, y1); break;
                  case 2: case 13: seg(bottom, y1, x1, right); break;
                  case 3: case 12: seg(x0, left, x1, right); break;
                  case 4: case 11: seg(top, y0, x1, right); break;
                  case 6: case 9:  seg(top, y0, bottom, y1); break;
                  case 7: case 8:  seg(x0, left, top, y0); break;
                  // The two saddles: the level passes through the cell twice.
                  // Resolved by the cell's mean, which is the standard tie-break
                  // and the one that keeps neighbouring cells agreeing.
                  case 5:
                    if ((tl + tr + br + bl) / 4 > level) {
                      seg(x0, left, top, y0);
                      seg(bottom, y1, x1, right);
                    } else {
                      seg(x0, left, bottom, y1);
                      seg(top, y0, x1, right);
                    }
                    break;
                  case 10:
                    if ((tl + tr + br + bl) / 4 > level) {
                      seg(top, y0, x1, right);
                      seg(x0, left, bottom, y1);
                    } else {
                      seg(x0, left, top, y0);
                      seg(bottom, y1, x1, right);
                    }
                    break;
                }
              }
            }

            // Three levels carry a motto colour and read as the programme on a
            // plan; the rest are the survey. Inner levels are drawn heavier,
            // the way a plan thickens the lines it wants followed.
            const lifted = i % 4 === 2 ? inks[((i / 4) | 0) % inks.length] : null;
            ctx.strokeStyle = lifted ?? paper;
            // A gentle ramp, not a steep one. Weighting brightness by level reads well
            // on white paper, where the faintest line is still ink on white; on an
            // ink ground the same ramp simply deletes the outer half of the drawing.
            ctx.globalAlpha = lifted ? 0.95 : 0.44 + 0.34 * (i / (LEVELS - 1));
            ctx.lineWidth = lifted ? 1.9 : 1.05;
            ctx.stroke(path);
          }
          ctx.globalAlpha = 1;
        },
      };

      return plate;
    });
  }, [key]);

  return (
    <canvas
      ref={ref}
      className={`${styles.field}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
