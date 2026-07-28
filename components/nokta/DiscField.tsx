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
/** Wavelength of the standing field, in units of the plate's width. */
const WAVELENGTH = 0.5;
/** Seconds for one full revolution, slowest and fastest. A disc TURNS: the
    angle is integrated from a rate that never changes sign, so it goes round
    and round and cannot swing back.

    It used to be an expression — a big term driven straight off the wave plus
    a small one driven off the clock — and that was simply wrong. The wave term
    swung nearly four radians with a period of about six seconds while the
    clock term advanced a twentieth of a radian a second, so the sum was an
    oscillation with a slight drift on it: every disc rocked back and forth
    about a fixed angle and none of them ever turned. Nothing driven off a
    value that goes up and down can be a rotation. */
const SPIN_SLOW = 62;
const SPIN_FAST = 24;
/** How much a crest of the wave speeds a disc up, as a fraction of its own
    rate. Kept under 1, which is what guarantees the rate never crosses zero —
    the field is still in the motion, it is just in the SPEED of it now and
    not in the position, so a crest is a place where the turning quickens
    rather than a place where it reverses. */
const WAVE_GAIN = 0.72;
/** Seconds for the plane a disc lies in to roll once round, at its laziest.
    Signed per disc, and never near zero: a disc whose plane does not roll
    presents its edge along the same line for ever and reads as stuck even
    while it is turning perfectly well. */
const ROLL_SLOW = 150;
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

/** How many halvings are spent finding how much room a disc has beside the
    title. Searched rather than picked off a list of five fixed sizes: a disc
    sitting near the edge of the clear space crosses the boundary continually,
    and off a list it jumps between two rungs each time it does — which is
    exactly the stutter it looks like. Six halvings put the answer within a
    hundredth, which is under a pixel on anything here. */
const ROOM_STEPS = 6;
/** Below this much of itself a disc is not worth drawing at all. */
const ROOM_MIN = 0.07;

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
      /** The angle each disc has actually turned through, integrated frame by
          frame, and the rates it is turning and rolling at. State, because a
          rotation is the integral of a rate and there is no expression in `t`
          that gives you one without also giving you a way to go backwards. */
      let turn = new Float64Array(0);
      let spin = new Float64Array(0);
      let rollRate = new Float64Array(0);
      let lastT = -1;

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
          spin = new Float64Array(count);
          rollRate = new Float64Array(count);
          order = [];
          // Carried across a resize where it can be: the webfont landing
          // re-lays the plate a moment after it appears, and a field that
          // snapped back to its opening angles then would be seen doing it.
          const held = turn;
          turn = new Float64Array(count);

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

            // Its own rate, its own direction, and where it had got to.
            const period = SPIN_SLOW + (SPIN_FAST - SPIN_SLOW) * hash(i, 6);
            spin[i] = (TAU / period) * (hash(i, 7) < 0.5 ? -1 : 1);
            rollRate[i] =
              (TAU / (ROLL_SLOW * (0.45 + hash(i, 10) * 0.55))) *
              (hash(i, 11) < 0.5 ? -1 : 1);
            turn[i] = i < held.length ? held[i] : hash(i, 1) * TAU;
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

          /* How much time this frame is worth. Clamped, and thrown away
             outright if it is not a sane forward step — the clock is rebased
             when the plate resumes from off-screen and re-laid when it
             resizes, and a rotation integrated off a bad delta jumps. */
          let dt = lastT < 0 ? 0 : t - lastT;
          if (!(dt > 0) || dt > 0.25) dt = 0;
          lastT = t;

          ctx.clearRect(0, 0, w, h);

          for (let n = 0; n < count; n++) {
            const i = order[n];
            const r0 = rad[i];

            // Where it hangs, plus a slow wander of its own.
            const dr = r0 * DRIFT;
            const sx = hx[i] + dr * Math.sin(t * (0.06 + hash(i, 6) * 0.05) + hash(i, 7) * TAU);
            const sy = hy[i] + dr * 0.6 * Math.cos(t * (0.05 + hash(i, 8) * 0.05) + hash(i, 9) * TAU);

            /* The angle, which is the whole plate — INTEGRATED, so it only
               ever goes one way. The wave is in the rate: over a crest a disc
               turns half again as fast, in a trough it idles, and because the
               gain is under one the rate never reaches zero and the disc never
               hesitates, let alone reverses. */
            const wave = interference(sx, sy, ax, ay, bx, by, k, t);
            turn[i] += dt * spin[i] * (1 + WAVE_GAIN * (wave * 2 - 1));
            const tilt = turn[i];
            const roll = hash(i, 12) * TAU + t * rollRate[i];

            // Signed, both of them. The sign of the cosine is which FACE is
            // towards the reader and the sign of the sine is which side of the
            // slab that face sits on; drop either and the disc mirrors back
            // through edge-on instead of carrying on round, which looks
            // exactly like a rotation running backwards.
            const cT = Math.cos(tilt);
            const sT = Math.sin(tilt);
            const cosT = Math.abs(cT);
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
              // Both of these shrink the region tested, so both are monotone
              // and a plain bisection finds the edge of the room available.
              let lo = 0;
              let hi = 1;
              if (fits(0, 1)) {
                for (let it = 0; it < ROOM_STEPS; it++) {
                  const mid = (lo + hi) / 2;
                  if (fits(mid, 1)) lo = mid;
                  else hi = mid;
                }
                close = lo;
              } else {
                close = 0;
                hi = 1;
                for (let it = 0; it < ROOM_STEPS; it++) {
                  const mid = (lo + hi) / 2;
                  if (fits(0, mid)) lo = mid;
                  else hi = mid;
                }
                if (lo < ROOM_MIN) continue;
                shrink = lo;
              }
            }

            const r = r0 * shrink;
            const co = cosT * close;
            const minor = r * co;
            /* Where the near face sits on the slab, signed. Zero when the disc
               faces the reader, half the slab's depth when it stands on edge,
               and it crosses to the OTHER side as the disc turns past edge-on
               — which is the one cue that says the thing kept going round.
               The silhouette itself is symmetric and takes the magnitude. */
            const lift = ((r * THICK * sT) / 2) * (cT < 0 ? -1 : 1);
            const half = Math.abs(lift);
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
              ctx.ellipse(-half, 0, Math.max(0.01, minor), r, 0, Math.PI / 2, -Math.PI / 2);
              ctx.ellipse(half, 0, Math.max(0.01, minor), r, 0, -Math.PI / 2, Math.PI / 2);
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
