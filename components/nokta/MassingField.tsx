"use client";

import { useEffect, useRef } from "react";
import { interference, mix, mountPlate, type Plate } from "./plate/mountPlate";
import styles from "./InterferenceField.module.css";

/* ── Massenmodell ─────────────────────────────────────────────────────
   The same standing field again, and this time it is read as HEIGHT.

   A studio that visualises architecture owns one drawing before it owns any
   other: the massing model — the site reduced to blocks, no windows, no
   material, only volume and where it stands. So the third plate is that. The
   field's crests become towers, its troughs stay a plain, and a wave passing
   through raises and drops a whole quarter of the model as it goes.

   Flat, not modelled. There is no camera, no light and no z-buffer: it is an
   axonometric — the projection an architect draws by hand, where the two
   ground axes go off at the same angle and nothing converges — and each block
   is three flat quadrilaterals in three tones. That is the whole trick of
   "3D-looking" work on paper, and it has been the trick since long before
   anyone had a renderer.

   Depth comes from draw ORDER alone. Plots are visited back to front, so a
   nearer block simply paints over a farther one. Within one diagonal row no
   two blocks overlap, which is what lets a whole row's faces be batched into
   three paths and stroked in three fills instead of three per block.

   Colour: the plain is paper. A plot that rises past two-thirds of full height
   shows the motto colour it was assigned at birth — so the coloured volumes
   are not scattered noise, they are the same plots each time, surfacing and
   sinking as the wave passes over them. On the homepage those three colours
   are the three the service doors below wear, which is not a coincidence. */

/** Tile footprint, CSS px, at the width the plate was drawn at. 2:1 is the
    axonometric every drafting board and every isometric grid uses. Chunky on
    purpose: a fine grid at this depth turns into a grey carpet in which no
    single block can be read as a block. */
const TILE_W = 94;
/** Tallest a block may stand, as a fraction of the plate's height. */
const MAX_H = 0.42;
/** Height curve. Steep enough that the towers are genuinely exceptional, but
    not so steep that everything which is not a tower flattens into one slab —
    a massing model is read by its relief, and a plain with no relief is a
    sheet of paper with some blocks on it. */
const GAMMA = 1.9;
/** A plot must clear this much of full height before it shows its colour. */
const LIT = 0.45;
/** Colour is assigned by REGION, not per plot: these are the tile counts a
    band of one colour runs for. A crest raises a whole district at once, and a
    district that came up in three colours at random would read as confetti
    rather than as programme. */
const BAND_A = 5;
const BAND_B = 4;
/** Colour is not allowed within this much of the plate's left or right trim.
    A lit district clipped by the frame stops reading as a district and starts
    reading as a stripe of paint down the edge of the picture. */
const COLOUR_INSET = 1.6;
/** Wavelength of the field, CSS px, at the reference width. */
const WAVELENGTH = 330;
const REFERENCE_W = 1420;

export default function MassingField({
  palette,
  className,
}: {
  /** Motto colours the risen volumes are drawn in. */
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
      const ground = css.getPropertyValue("--nk-field-ground").trim() || "#1f1f1c";

      /* Faces are shaded by MIXING, never by alpha. Painter's algorithm only
         occludes if what it paints is opaque; with globalAlpha every block
         behind showed through the one in front and the model read as glass.
         Three opaque tones per colour, and the depth is real again. */
      const shades = (hex: string): [string, string, string] => [
        mix(hex, ground, 0.13),
        mix(hex, ground, 0.5),
        mix(hex, ground, 0.72),
      ];
      const plain = shades(paper);
      const lithue = colours.map(shades);

      let w = 0;
      let h = 0;
      let tw = TILE_W;
      let td = TILE_W / 2;
      let maxH = 0;
      let k = (2 * Math.PI) / WAVELENGTH;
      let cols = 0;
      let rowsBack = 0;
      let oy = 0;

      const plate: Plate = {
        resize(width, height) {
          w = width;
          h = height;
          // The model keeps roughly the same number of plots across at every
          // width, so a narrow plate gets a smaller tile rather than four
          // enormous blocks.
          const scale = Math.max(0.42, Math.min(1, w / REFERENCE_W));
          tw = TILE_W * scale;
          td = tw / 2;
          maxH = h * MAX_H;
          k = (2 * Math.PI) / (WAVELENGTH * scale);
          cols = Math.ceil(w / tw) + 2;
          oy = maxH * 1.05;
          rowsBack = Math.ceil((h - oy) / (td / 2)) + 4;
        },

        draw(t) {
          if (w === 0 || h === 0) return;
          const cx = w / 2;
          // Two sources, moving slowly — a massing model that reorganised
          // quickly would read as a screensaver rather than as a site.
          const ax = cx + 0.40 * w * Math.cos(t * 0.07);
          const ay = h / 2 + 0.5 * h * Math.sin(t * 0.11);
          const bx = cx + 0.34 * w * Math.cos(t * 0.09 + 2.4);
          const by = h / 2 + 0.5 * h * Math.sin(t * 0.06 + 1.4);

          ctx.clearRect(0, 0, w, h);

          // Back to front. `b` is the diagonal row; `a` steps across it, two
          // at a time because a plot's (u−v) and (u+v) always share parity.
          for (let b = 0; b <= rowsBack; b++) {
            const sy = oy + (b * td) / 2;
            const top = new Path2D();
            const left = new Path2D();
            const right = new Path2D();
            const lit: { x: number; y: number; ht: number; ci: number }[] = [];

            for (let a = -cols; a <= cols; a++) {
              if (((a + b) & 1) !== 0) continue; // parity: not a real plot
              const sx = cx + (a * tw) / 2;
              if (sx < -tw || sx > w + tw) continue;

              const amp = interference(sx, sy, ax, ay, bx, by, k, t);
              const ht = maxH * Math.pow(amp, GAMMA);
              if (sy - ht > h + td || sy < -td) continue;

              // Fixed to the ground, not to the block: a district keeps its
              // colour, so a passing crest raises one coherent quarter rather
              // than a scatter of three.
              const ci =
                Math.abs(
                  Math.floor(a / BAND_A) + Math.floor(b / BAND_B),
                ) % Math.max(1, colours.length);
              const clearOfTrim =
                sx > tw * COLOUR_INSET && sx < w - tw * COLOUR_INSET;
              if (ht > maxH * LIT && colours.length && clearOfTrim) {
                lit.push({ x: sx, y: sy, ht, ci });
                continue;
              }
              face(top, left, right, sx, sy, ht, tw, td);
            }

            // One row of plain, in three fills.
            ctx.fillStyle = plain[0];
            ctx.fill(top);
            ctx.fillStyle = plain[1];
            ctx.fill(left);
            ctx.fillStyle = plain[2];
            ctx.fill(right);

            // Then the risen volumes of that row, each in its district's hue.
            for (const v of lit) {
              const tp = new Path2D();
              const lf = new Path2D();
              const rt = new Path2D();
              face(tp, lf, rt, v.x, v.y, v.ht, tw, td);
              const sh = lithue[v.ci];
              ctx.fillStyle = sh[0];
              ctx.fill(tp);
              ctx.fillStyle = sh[1];
              ctx.fill(lf);
              ctx.fillStyle = sh[2];
              ctx.fill(rt);
            }
          }
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

/** One block, as its three visible quadrilaterals. The top face is the tile
    lifted by `ht`; the other two are the walls that appear underneath it. */
function face(
  top: Path2D,
  left: Path2D,
  right: Path2D,
  x: number,
  y: number,
  ht: number,
  tw: number,
  td: number,
) {
  const hw = tw / 2;
  const hd = td / 2;
  const ty = y - ht;

  top.moveTo(x, ty - hd);
  top.lineTo(x + hw, ty);
  top.lineTo(x, ty + hd);
  top.lineTo(x - hw, ty);
  top.closePath();

  // A plot flat on the plain has no walls to show.
  if (ht <= 0.5) return;

  left.moveTo(x - hw, ty);
  left.lineTo(x, ty + hd);
  left.lineTo(x, y + hd);
  left.lineTo(x - hw, y);
  left.closePath();

  right.moveTo(x, ty + hd);
  right.lineTo(x + hw, ty);
  right.lineTo(x + hw, y);
  right.lineTo(x, y + hd);
  right.closePath();
}

