"use client";

import { useEffect, useRef } from "react";
import { makeKnockout, plateInk } from "./plate/knockout";
import { makeMarkKnockout } from "./plate/markKnockout";
import { makePictureScreen, type Room } from "./plate/pictureScreen";
import { interference, mountPlate, type Plate } from "./plate/mountPlate";
import { motionOff, prefersReducedMotion } from "@/lib/motion";
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
   one shape that field leaves empty.

   A `picture` is the other way round: not a shape the field leaves empty but
   one it draws. Inside it the dots take their size from a studio rendering
   instead of from the waves (plate/pictureScreen.ts). The homepage uses it:
   the studio's claim is making architecture visible, so its first screen
   shows a building, printed in the plate's own dots. */

/** Screen angle of the raster. A printer's answer, in radians. */
const SCREEN_ANGLE = (15 * Math.PI) / 180;
/** …except under a picture. A building is verticals and horizontals, and a
    15-degree lattice samples both unevenly: dots run along its rows, which
    lie close to horizontal, so every slab and column of the picture came out
    visibly leaning. At 45 degrees the lattice is symmetric about both axes
    and nothing leans; it is also the angle a printer gives a single black
    screen when the subject is a photograph. */
const SCREEN_ANGLE_PICTURE = (45 * Math.PI) / 180;
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

/** With a picture the screen is finer: at 68 across a building is about thirty
    dots wide on a laptop, too few to read as anything. 130 across, and a
    phone floor of 6.5px, give it forty to fifty, which reads at a glance. */
const ACROSS_PICTURE = 130;
const PITCH_MIN_PICTURE = 6.5;
/** Inside the picture the dots may grow until they touch: a halftone needs
    the full range to carry a white wall, where the field never should. */
const PICTURE_DOT = 0.52;
/** The waves still run through the picture, but only this much: enough that
    it is visibly the same live field, not enough to cost the building its
    edges. */
const PICTURE_LIVE = 0.15;
/** How far the field is quieted around the picture (see HALO in
    plate/pictureScreen.ts), as a fraction of its tone. */
const PICTURE_QUIET = 0.85;
/** Seconds the picture takes to settle out of the wave field once it has
    loaded. */
const SETTLE = 3.5;
/** Clear space between the copy and the picture, and between the picture and
    the plate's edge, in pitches. On top of TEXT_DODGE. */
const PICTURE_GAP = 2;
const PICTURE_EDGE = 1.5;

/** A box, in the canvas's CSS pixels, the raster keeps clear of. */
type Clear = { x0: number; y0: number; x1: number; y1: number };

/** How far the raster is held off live text, in lattice pitches. */
const TEXT_DODGE = 1.05;

/** The boxes of every [data-dodge] element inside the plate's scope, relative
    to the canvas. data-dodge="lines" clears each line of its text on its own,
    so the dots follow the ragged right edge of a paragraph instead of clearing
    its whole rectangle; any other value clears the element's box (a button). */
function readClears(canvas: HTMLCanvasElement, pad: number): Clear[] {
  const scope = canvas.closest("[data-dodge-scope]");
  if (!scope) return [];
  const origin = canvas.getBoundingClientRect();
  const out: Clear[] = [];
  for (const el of scope.querySelectorAll<HTMLElement>("[data-dodge]")) {
    let rects: DOMRect[];
    if (el.dataset.dodge === "lines") {
      const range = document.createRange();
      range.selectNodeContents(el);
      rects = [...range.getClientRects()];
    } else {
      rects = [el.getBoundingClientRect()];
    }
    for (const r of rects) {
      if (r.width === 0 || r.height === 0) continue;
      out.push({
        x0: r.left - origin.left - pad,
        y0: r.top - origin.top - pad,
        x1: r.right - origin.left + pad,
        y1: r.bottom - origin.top + pad,
      });
    }
  }
  return out;
}

/** Where a picture may stand: beside the copy (right of its furthest line) or
    above it (over its first line), whichever holds the larger picture of the
    given aspect. Measured from the copy itself rather than from breakpoints,
    so it cannot overlap the text at any width the copy wraps at. */
function pictureRoom(
  w: number,
  h: number,
  clears: Clear[],
  pitch: number,
  aspect: number,
): Room | null {
  const m = pitch * PICTURE_EDGE;
  const gap = pitch * PICTURE_GAP;
  const whole: Room = { x0: m, y0: m, x1: w - m, y1: h - m };
  if (!clears.length || aspect <= 0) return whole;
  let right = 0;
  let top = h;
  for (const c of clears) {
    right = Math.max(right, c.x1);
    top = Math.min(top, c.y0);
  }
  const side: Room = { x0: right + gap, y0: m, x1: w - m, y1: h - m };
  const above: Room = { x0: m, y0: m, x1: w - m, y1: top - gap };
  const size = (r: Room) => {
    const rw = r.x1 - r.x0;
    const rh = r.y1 - r.y0;
    if (rw <= 0 || rh <= 0) return 0;
    return Math.min(rw, rh * aspect);
  };
  const best = size(side) >= size(above) ? side : above;
  return size(best) > 0 ? best : null;
}

export default function InterferenceField({
  variant = "single",
  motto,
  mark,
  markAside = false,
  picture,
  dodgeText = false,
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
  /** Set the mark to the right (on a tall plate: at the top) instead of in
      the middle. */
  markAside?: boolean;
  /** A small greyscale image to screen into the raster as a halftone, placed
      in the room the copy leaves (see pictureRoom). The canvas stays
      decoration: the caller provides the text alternative. */
  picture?: string;
  /** Keep the raster clear of every [data-dodge] element inside the nearest
      [data-dodge-scope] ancestor: text laid over the plate in the page itself
      gets the same clearance the knocked-out mark gets. */
  dodgeText?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // mountPlate hands a still plate t = 0 and nothing else; the picture has
    // to know so it can be drawn finished rather than not yet settled.
    const still = prefersReducedMotion();

    return mountPlate(canvas, (ctx) => {
      const { paper, accent, face } = plateInk(canvas);
      // Held separately from `cut` only because it is the one of the two that
      // has to be waited for.
      const stamp = mark ? makeMarkKnockout(mark, paper, markAside) : null;
      const screen = picture ? makePictureScreen(picture) : null;
      let clears: Clear[] = [];
      const cut = stamp ?? (motto ? makeKnockout(motto, face, paper, accent) : null);
      const meeting = variant === "meeting";
      const across = screen ? ACROSS_PICTURE : ACROSS;
      const pitchMin = screen ? PITCH_MIN_PICTURE : PITCH_MIN;

      let w = 0;
      let h = 0;
      let pitch = PITCH;
      let k = (2 * Math.PI) / (PITCH * WAVELENGTH);
      const angle = screen ? SCREEN_ANGLE_PICTURE : SCREEN_ANGLE;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      /* The dots that survive every clearing, with what the picture says about
         each, laid out once per fit. The lattice, the knockouts and the
         picture only change when the box does, so a frame is left with the
         waves and nothing else. */
      let n = 0;
      let dx = new Float32Array(0);
      let dy = new Float32Array(0);
      /** Picture tone, or -1 where there is no picture. */
      let dTone = new Float32Array(0);
      let dOwn = new Float32Array(0);
      let dNear = new Float32Array(0);
      /** Plate-time the picture first stood ready, for the settle. */
      let since = -1;
      /** Once settled, always settled: switching motion back on must not make
          the picture dissolve and settle a second time. */
      let settled = false;

      const lay = () => {
        const reach = Math.ceil((Math.hypot(w, h) / 2 + pitch) / pitch);
        const cap = (2 * reach + 1) ** 2;
        if (dx.length < cap) {
          dx = new Float32Array(cap);
          dy = new Float32Array(cap);
          dTone = new Float32Array(cap);
          dOwn = new Float32Array(cap);
          dNear = new Float32Array(cap);
        }
        const cx = w / 2;
        const cy = h / 2;
        const placed = screen?.placed() ?? false;
        n = 0;
        // The lattice is rotated, so it has to be generated over a disc wide
        // enough to still cover the corners once turned.
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
            if (clears.length && clears.some((c) => x > c.x0 && x < c.x1 && y > c.y0 && y < c.y1)) continue;
            dx[n] = x;
            dy[n] = y;
            dTone[n] = placed ? screen!.tone(x, y) : -1;
            dOwn[n] = placed ? screen!.own(x, y) : 0;
            dNear[n] = placed ? screen!.near(x, y) : 0;
            n++;
          }
        }
      };

      const plate: Plate = {
        // An image mask is decoded asynchronously; the raster re-fits itself
        // around the mark, or screens the picture, once it is in. Type has no
        // such wait.
        ready:
          stamp || screen
            ? Promise.all([stamp?.ready, screen?.ready])
            : undefined,

        resize(width, height, dpr) {
          w = width;
          h = height;
          pitch = Math.max(pitchMin, Math.min(PITCH, width / across));
          k = (2 * Math.PI) / (pitch * WAVELENGTH);
          cut?.layout(width, height, dpr);
          // Re-read on every fit: a resize reflows the text, and the webfont
          // landing (which mountPlate also answers with a fit) changes the
          // line boxes.
          if (dodgeText) clears = readClears(canvas, pitch * TEXT_DODGE);
          screen?.layout(pictureRoom(w, h, clears, pitch, screen.aspect()), pitch);
          lay();
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

          // The picture settles out of the field from the moment it is in,
          // and a still plate gets it finished.
          // The header's motion switch counts as still too: with it off the
          // loop never runs, and the one frame painted has to be the picture.
          let s = 0;
          if (screen?.placed()) {
            if (settled || still || motionOff()) {
              settled = true;
              s = 1;
            } else {
              if (since < 0) since = t;
              const u = Math.min(1, Math.max(0, (t - since) / SETTLE));
              s = u * u * (3 - 2 * u);
              if (u >= 1) settled = true;
            }
          }

          ctx.clearRect(0, 0, w, h);

          const path = new Path2D();
          // Only the meeting variant strikes anything, and only a picture is
          // inked heavier than the field, so only they pay for more paths.
          const struck = meeting ? new Path2D() : path;
          const pic = s > 0 ? new Path2D() : path;
          const maxR = pitch * MAX_DOT;
          const picR = pitch * PICTURE_DOT;

          for (let i = 0; i < n; i++) {
            const x = dx[i];
            const y = dy[i];
            const amp = interference(x, y, ax, ay, bx, by, k, t);
            let r = maxR * Math.pow(amp, GAMMA) * (1 - PICTURE_QUIET * s * dNear[i]);
            const own = dOwn[i] * s;
            if (own > 0) {
              // Mixed in radius, not in tone: the field's radius follows its
              // tone curve, the picture's follows area (the root), which is
              // what makes a halftone's grey the grey of the original.
              const tone = dTone[i] * (1 - PICTURE_LIVE + PICTURE_LIVE * amp);
              r = r * (1 - own) + picR * Math.sqrt(Math.max(0, tone)) * own;
            }
            if (r <= 0.18) continue;

            const into = dOwn[i] > 0.5 && s > 0 ? pic : amp > AGREEMENT ? struck : path;
            into.moveTo(x + r, y);
            into.arc(x, y, r, 0, Math.PI * 2);
          }

          // The raster, in one fill.
          ctx.fillStyle = paper;
          ctx.globalAlpha = 0.82;
          ctx.fill(path);
          // The picture in full ink, so it is the brightest thing on the plate;
          // eased in with the settle so nothing jumps.
          if (pic !== path) {
            ctx.globalAlpha = 0.82 + 0.18 * s;
            ctx.fill(pic);
          }
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
  }, [variant, motto, mark, markAside, picture, dodgeText]);

  return (
    <canvas
      ref={ref}
      className={`${styles.field}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
