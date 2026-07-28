"use client";

import { useEffect, useRef } from "react";
import { makeKnockout, plateInk } from "./plate/knockout";
import { interference, mix, mountPlate, type Plate } from "./plate/mountPlate";
import styles from "./InterferenceField.module.css";

/* ── Punkt · Linie · Form ─────────────────────────────────────────────
   The studio's motto, stated as geometry instead of as a sentence.

   "Vom Punkt über die Linie zur Form." One disc, turning in space, is all
   three of those and nothing else: face on it is a POINT, edge on it is a
   LINE, and everywhere in between it is a FORM. Nothing here is drawn as a
   point or drawn as a line — the same object is drawn every frame and the
   angle it is seen from decides which of the three words applies to it. That
   is only true in three dimensions. Flatten the picture and the sentence
   stops being true, which is the argument for making the page that carries
   the work dimensional in the first place.

   So the plate is a field of discs hanging in depth. Each is a real solid — a
   round slab with a thickness — so as it turns you see its face foreshorten
   to an ellipse, then to nothing, and its RIM come round into view. That rim
   is the whole reason the thing reads as an object rather than as a shrinking
   oval: an oval that thins to a hairline is a drawing, an oval that thins and
   leaves a bar standing behind it is a coin.

   WHICH WAY A DISC IS TURNED IS THE FIELD. The same two summed waves the rest
   of the plates are built on, read here as ORIENTATION — so the crests are
   places where every disc has swung open and gone bright, and the troughs are
   places where they have all turned their edges to you and gone to lines. The
   opening travels. On the homepage the field is read as SIZE, on /studio as
   DISPLACEMENT; here it is angle. One equation, three pictures, and they are
   a family for that reason rather than because they look alike.

   AND THE TITLE IS PART OF IT. Nothing is composited over this plate and
   nothing is cut — see plate/knockout.ts. A disc that would land on the type
   turns EDGE ON instead, and if that is still not enough room it draws
   smaller, and if there is no room at all it does not draw. So the letters
   stand in a clearing of discs that have turned away from them, which is the
   sentence again: closest to the word, every form has become a line. */

/** Discs per unit of plate area, roughly — the count is scaled from the box so
    a phone gets fewer discs rather than the same discs at a quarter size. */
const AREA_PER_DISC = 3400;
/** The floor matters more than the ceiling: a phone plate is a twentieth of
    the area of a desktop one and by the area rule alone would get a dozen
    discs and read as four shapes on a black card. Every plate wide enough to
    compute its own count is well clear of this. */
const MIN_COUNT = 44;
const MAX_COUNT = 190;
/** Radius bounds as a fraction of the plate's height, and the curve between
    them. Steep, so most of the field is small and a handful of near discs are
    large enough to run off the edge of the plate — that size spread IS the
    depth, since there is no other cue that a disc is close. */
const R_NEAR = 0.22;
const R_FAR = 0.014;
const R_CURVE = 3.2;
/** A disc's thickness, as a fraction of its radius. Thin enough to read as a
    slab rather than a drum, thick enough that edge-on is a bar you can see. */
const THICK = 0.19;
/** How far round the wave swings a disc, in turns. Just over a half turn: a
    crest passing over the field takes every disc from edge on, through open,
    and back, which is the whole sentence in one pass. */
const SWING = 0.62;
/** Wavelength of the standing field, in units of the plate's width. */
const WAVELENGTH = 0.5;
/** How fast a disc tumbles on its own account, on top of the wave, and how
    fast the plane it lies in rolls round. Both slow, both different per disc,
    so the field never falls into step with itself. */
const TUMBLE = 0.055;
const ROLL = 0.05;
/** How far a disc wanders from where it hangs, as a fraction of its radius. */
const DRIFT = 0.5;
/** Light: how much of a disc's face survives being turned edge on. The face
    darkens as it closes, so the field glitters as the wave crosses it. */
const AMBIENT = 0.26;
/** Shading steps, and depth bands with the far one sunk this far into the
    ground. Every tone the plate can need is built once, at mount. */
const STEPS = 20;
const BANDS = 10;
const HAZE = 0.82;
/** Share of the field drawn as an open ring rather than a solid disc, and how
    wide that ring's wall is. The site's two marks are a filled dot and a
    drawn line; a field of only one of them is only half the alphabet. */
const RINGS = 0.3;
const RING_WALL = 0.1;
/** Share of the field that carries a motto colour. */
const COLOURED = 0.3;

/** Closing a disc towards its edge is the FIRST thing tried when it lands on
    the title: it is the move that keeps the disc, and turning away is a more
    honest reason to be out of the way than being deleted. Only when even a
    bare edge will not fit does it start drawing smaller. */
const CLOSE_LADDER = [0.62, 0.36, 0.18, 0.07, 0];
const SHRINK_LADDER = [0.66, 0.44, 0.27, 0.13];

const TAU = Math.PI * 2;
/** The R₂ low-discrepancy sequence. Two irrational strides that between them
    never repeat and never clump: it fills the plate far more evenly than a
    hash does, which matters when there are eighty marks and a hole shows. */
const R2_X = 0.7548776662466927;
const R2_Y = 0.5698402909980532;

/** Deterministic per-disc noise. The field is the same field on every frame
    and in every session; only the angles are time. */
function hash(i: number, salt: number) {
  let h = Math.imul(i | 0, 374761393) ^ Math.imul(salt, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export default function DiscField({
  palette,
  motto,
  className,
}: {
  /** Motto colours some of the discs are struck in. */
  palette: string[];
  /** A title to stand in the field. Already translated by the caller. */
  motto?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  // A primitive the effect can depend on: an array prop is a fresh reference
  // on every render and would rebuild the plate on each one.
  const key = palette.join("|");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const colours = key.split("|");

    return mountPlate(canvas, (ctx) => {
      const { paper, accent, ground, face } = plateInk(canvas);
      const cut = motto ? makeKnockout(motto, face, paper, accent) : null;

      /* Faces are shaded by MIXING toward the plate's ground, never by alpha:
         draw order is the only depth this has, and a translucent disc lets the
         one behind show through it. Two indices at draw time — how open the
         disc is, and how far away — and no colour built inside a frame. */
      const stock = [paper, ...colours].map((hex, i) => {
        const base = i === 0 ? hex : mix(hex, paper, 0.22);
        return Array.from({ length: BANDS }, (_, d) => {
          const haze = HAZE * (1 - d / (BANDS - 1));
          const to = (amt: number) => mix(base, ground, amt + (1 - amt) * haze);
          return {
            // Open and facing you at the top of the ramp, closed and dark at
            // the bottom.
            face: Array.from({ length: STEPS + 1 }, (_, s) =>
              to(0.66 - 0.62 * (s / STEPS)),
            ),
            // The rim is the shaded side of the same slab, and it is what is
            // left when the face has gone.
            rim: to(0.74),
          };
        });
      });

      let w = 0;
      let h = 0;
      let count = 0;
      let k = 0;
      /** Fixed properties, laid down once per resize. */
      let hx = new Float64Array(0);
      let hy = new Float64Array(0);
      let rad = new Float64Array(0);
      let band = new Int32Array(0);
      let ink = new Int32Array(0);
      let ring = new Uint8Array(0);
      let order: number[] = [];

      const plate: Plate = {
        resize(width, height, dpr) {
          w = width;
          h = height;
          cut?.layout(width, height, dpr);
          k = TAU / (WAVELENGTH * width);

          count = Math.max(
            MIN_COUNT,
            Math.min(MAX_COUNT, Math.round((width * height) / AREA_PER_DISC)),
          );
          hx = new Float64Array(count);
          hy = new Float64Array(count);
          rad = new Float64Array(count);
          band = new Int32Array(count);
          ink = new Int32Array(count);
          ring = new Uint8Array(count);
          order = [];

          for (let i = 0; i < count; i++) {
            // Even cover first, then a little noise on top of it, so the field
            // has no holes and no grid.
            const ux = ((i + 0.5) * R2_X) % 1;
            const uy = ((i + 0.5) * R2_Y) % 1;
            hx[i] = (ux - 0.5) * width * 1.18 + width / 2;
            hy[i] = (uy - 0.5) * height * 1.16 + height / 2;

            // One number decides how near a disc is: its size, how much haze
            // it carries, and what it hides.
            const near = hash(i, 3);
            rad[i] =
              height * (R_FAR + (R_NEAR - R_FAR) * Math.pow(near, R_CURVE));
            band[i] = Math.max(0, Math.min(BANDS - 1, Math.round(near * (BANDS - 1))));
            const c = hash(i, 4);
            ink[i] =
              c > COLOURED || !colours.length
                ? 0
                : 1 + Math.min(colours.length - 1, Math.floor((c / COLOURED) * colours.length));
            ring[i] = hash(i, 5) < RINGS ? 1 : 0;
            order[i] = i;
          }
          // Far ones first, and the near ones over them. Depth is fixed, so
          // this is settled here rather than sixty times a second.
          order.sort((a, b) => rad[a] - rad[b]);
        },

        draw(t) {
          if (w === 0 || h === 0) return;
          const cx = w / 2;
          const cy = h / 2;

          // Two sources, drifting. Slow: the sentence should take its time.
          const ax = cx + 0.42 * w * Math.cos(t * 0.053);
          const ay = cy + 0.5 * h * Math.sin(t * 0.037);
          const bx = cx + 0.36 * w * Math.cos(t * 0.041 + 2.3);
          const by = cy + 0.5 * h * Math.sin(t * 0.061 + 1.2);

          ctx.clearRect(0, 0, w, h);

          for (let n = 0; n < count; n++) {
            const i = order[n];
            const r0 = rad[i];

            // Where it hangs, plus a slow wander of its own.
            const dr = r0 * DRIFT;
            const sx = hx[i] + dr * Math.sin(t * (0.06 + hash(i, 6) * 0.05) + hash(i, 7) * TAU);
            const sy = hy[i] + dr * 0.6 * Math.cos(t * (0.05 + hash(i, 8) * 0.05) + hash(i, 9) * TAU);

            /* The angle, which is the whole plate. The wave sets how far round
               the disc has swung; its own slow tumble keeps neighbours from
               moving as one; the roll turns the plane the disc lies in, so it
               presents its edge along a different line as it goes. */
            const wave = interference(sx, sy, ax, ay, bx, by, k, t);
            const tilt =
              hash(i, 1) * TAU + SWING * TAU * wave + t * TUMBLE * (0.5 + hash(i, 2));
            const roll = hash(i, 10) * TAU + t * ROLL * (hash(i, 11) - 0.5) * 2;

            const cosT = Math.abs(Math.cos(tilt));
            const cs = Math.cos(roll);
            const sn = Math.sin(roll);

            /* ── Out of the way ────────────────────────────────────────
               Sampled off the mask, on the disc's own outline, because a mark
               this big cannot be judged by its centre. First it tries to stay
               its size and turn edge on; only if a bare edge still will not fit
               does it draw smaller; and if there is no room at all it does not
               draw. Nothing is cut, so nothing wears a rim of half-marks. */
            const fits = (close: number, shrink: number) => {
              if (!cut) return true;
              const r = r0 * shrink;
              const co = cosT * close;
              const minor = r * co + (r * THICK * Math.sqrt(1 - co * co)) / 2;
              if (cut.dodged(sx, sy)) return false;
              for (let g = 0; g < 2; g++) {
                const f = g === 0 ? 1 : 0.58;
                for (let a = 0; a < 8; a++) {
                  const th = (a / 8) * TAU;
                  const lx = Math.cos(th) * minor * f;
                  const ly = Math.sin(th) * r * f;
                  if (cut.dodged(sx + lx * cs - ly * sn, sy + lx * sn + ly * cs)) {
                    return false;
                  }
                }
              }
              return true;
            };

            let close = 1;
            let shrink = 1;
            if (!fits(1, 1)) {
              let ok = false;
              for (const c of CLOSE_LADDER) {
                if (fits(c, 1)) {
                  close = c;
                  ok = true;
                  break;
                }
              }
              if (!ok) {
                close = 0;
                for (const s of SHRINK_LADDER) {
                  if (fits(0, s)) {
                    shrink = s;
                    ok = true;
                    break;
                  }
                }
              }
              if (!ok) continue;
            }

            const r = r0 * shrink;
            const co = cosT * close;
            const si = Math.sqrt(1 - co * co);
            const minor = r * co;
            // Half the slab's thickness as it appears — zero when the disc
            // faces you, its full depth when it stands on edge.
            const lift = (r * THICK * si) / 2;
            if (r < 1.2) continue;

            const shade = stock[ink[i]][band[i]];
            const litFace = shade.face[Math.round((AMBIENT + (1 - AMBIENT) * co) * STEPS)];

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(roll);

            if (ring[i]) {
              // An open one: no rim to speak of, just the wall of the ring,
              // which goes to a bare line as the disc closes.
              ctx.beginPath();
              ctx.ellipse(0, 0, Math.max(0.01, minor), r, 0, 0, TAU);
              ctx.lineWidth = Math.max(1.1, r * RING_WALL);
              ctx.strokeStyle = litFace;
              ctx.stroke();
            } else {
              /* The silhouette of the whole slab, in one path: the far half of
                 the far face, the near half of the near face, and the two
                 straight runs of rim between them. Face on, the two halves sit
                 on top of each other and it is a circle; edge on, they are two
                 lines and it is a bar. */
              ctx.beginPath();
              ctx.ellipse(-lift, 0, Math.max(0.01, minor), r, 0, Math.PI / 2, -Math.PI / 2);
              ctx.ellipse(lift, 0, Math.max(0.01, minor), r, 0, -Math.PI / 2, Math.PI / 2);
              ctx.closePath();
              ctx.fillStyle = shade.rim;
              ctx.fill();

              // …and the face that is actually turned towards the reader,
              // sitting on the near side of the slab.
              ctx.beginPath();
              ctx.ellipse(lift, 0, Math.max(0.01, minor), r, 0, 0, TAU);
              ctx.fillStyle = litFace;
              ctx.fill();
            }
            ctx.restore();
          }

          // Nothing to erase: the clearing was made by turning away from it.
          cut?.paint(ctx);
        },
      };

      return plate;
    });
  }, [key, motto]);

  return (
    <canvas
      ref={ref}
      className={`${styles.field}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
