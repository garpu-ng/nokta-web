"use client";

import { useEffect, useRef } from "react";
import { makeKnockout, plateInk } from "./plate/knockout";
import { makeMarkKnockout } from "./plate/markKnockout";
import { interference, mountPlate, type Plate } from "./plate/mountPlate";
import styles from "./InterferenceField.module.css";

/* ── Interferenz ──────────────────────────────────────────────────────
   The studio's abstract plate: a halftone raster with wave sources running
   through it. The first of the family, and still the one the others are
   variations on.

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

     "single" — an open raster. The accent's whole appearance is whatever the
       knocked-out title's closing period spends, which is what the red is for
       on this site.

     "meeting" — two sources that approach and part along the page's axis, and
       every dot standing on a true crest of BOTH waves is struck in the
       accent. On the page where two parties are supposed to find each other,
       the red is precisely the set of places where they agree. It travels as
       the sources travel.

   In both variants the accent is dots, marks and periods, never a surface.

   A `motto`, or the studio's `mark`, is knocked out of the raster rather than
   laid over it — see plate/knockout.ts, which every plate in the family now
   shares, and plate/markKnockout.ts for the wordmark. The homepage carries the
   mark: nokta is the dot, the plate is a field of dots, and the name is the
   one shape that field leaves empty. */

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

export type FieldVariant = "single" | "meeting";

export default function InterferenceField({
  variant = "single",
  motto,
  mark,
  className,
}: {
  /** Which question the physics is asked — see the note above. */
  variant?: FieldVariant;
  /** A title to knock out of the raster. Already translated by the caller. */
  motto?: string;
  /** …or an image to knock out instead of a line: the studio's wordmark, as
      the same file the masthead wears. Takes precedence over `motto`, which
      stays the plate's accessible name at the call site. */
  mark?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    return mountPlate(canvas, (ctx) => {
      const { paper, accent, face } = plateInk(canvas);
      // Held separately from `cut` only because it is the one of the two that
      // has to be waited for.
      const stamp = mark ? makeMarkKnockout(mark, paper) : null;
      const cut = stamp ?? (motto ? makeKnockout(motto, face, paper, accent) : null);
      const meeting = variant === "meeting";

      let w = 0;
      let h = 0;
      let pitch = PITCH;
      let k = (2 * Math.PI) / (PITCH * WAVELENGTH);
      const cos = Math.cos(SCREEN_ANGLE);
      const sin = Math.sin(SCREEN_ANGLE);

      const plate: Plate = {
        // An image mask is decoded asynchronously; the raster re-fits itself
        // around the mark once it is in. Type has no such wait.
        ready: stamp?.ready,

        resize(width, height, dpr) {
          w = width;
          h = height;
          pitch = Math.max(PITCH_MIN, Math.min(PITCH, width / ACROSS));
          k = (2 * Math.PI) / (pitch * WAVELENGTH);
          cut?.layout(width, height, dpr);
        },

        draw(t) {
          if (w === 0 || h === 0) return;
          const cx = w / 2;
          const cy = h / 2;

          let ax: number, ay: number, bx: number, by: number;
          if (meeting) {
            // Two parties on the page's own axis, closing and opening again.
            // The separation never reaches zero: they meet, they do not merge.
            const sep = 0.3 + 0.11 * Math.sin(t * 0.085);
            ax = cx - sep * w;
            ay = cy + 0.13 * h * Math.sin(t * 0.13);
            bx = cx + sep * w;
            by = cy - 0.13 * h * Math.sin(t * 0.11 + 0.9);
          } else {
            // Slow Lissajous paths whose frequencies share no common factor —
            // so the pattern never repeats inside a visit.
            ax = cx + 0.34 * w * Math.cos(t * 0.11);
            ay = cy + 0.3 * h * Math.sin(t * 0.17);
            bx = cx + 0.3 * w * Math.cos(t * 0.13 + 2.1);
            by = cy + 0.34 * h * Math.sin(t * 0.09 + 1.3);
          }

          ctx.clearRect(0, 0, w, h);

          const path = new Path2D();
          // Only the meeting variant strikes anything, so only it pays for a
          // second path.
          const struck = meeting ? new Path2D() : path;
          const maxR = pitch * MAX_DOT;
          // The lattice is rotated, so it has to be generated over a disc wide
          // enough to still cover the corners once turned.
          const reach = Math.ceil((Math.hypot(w, h) / 2 + pitch) / pitch);

          for (let iy = -reach; iy <= reach; iy++) {
            for (let ix = -reach; ix <= reach; ix++) {
              const x = cx + ix * pitch * cos - iy * pitch * sin;
              const y = cy + ix * pitch * sin + iy * pitch * cos;
              if (x < -pitch || x > w + pitch) continue;
              if (y < -pitch || y > h + pitch) continue;
              // Whole dots, or none. Erasing the raster afterwards would slice
              // every dot on the boundary in half and those halves would line
              // up into a contour around the letters — see plate/knockout.ts.
              if (cut?.dodged(x, y)) continue;

              const amp = interference(x, y, ax, ay, bx, by, k, t);
              const r = maxR * Math.pow(amp, GAMMA);
              if (r <= 0.18) continue;

              const into = amp > AGREEMENT ? struck : path;
              into.moveTo(x + r, y);
              into.arc(x, y, r, 0, Math.PI * 2);
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

          // The clearing was made by not drawing into it, so there is nothing
          // to erase — only the type to set in it.
          cut?.paint(ctx);
        },
      };

      return plate;
    });
  }, [variant, motto, mark]);

  return (
    <canvas
      ref={ref}
      className={`${styles.field}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
