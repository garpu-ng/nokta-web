"use client";

import { useEffect, useRef } from "react";
import { makeKnockout, plateInk } from "./plate/knockout";
import { interference, mix, mountPlate, type Plate } from "./plate/mountPlate";
import styles from "./InterferenceField.module.css";

/* ── Rundgang ─────────────────────────────────────────────────────────
   A massing model on a turntable, and the page's title standing in it.

   The studio's own object. Before a rendering exists there is a block model
   on a board, and the first thing anyone does with a block model is walk
   round it — so the plate does not sit still and look three-dimensional, it
   TURNS, which is a different claim and a much harder one to fake. The
   axonometric is rebuilt every frame at a new angle: walls that faced the
   reader swing away and go dark, walls that were edge-on open up and catch
   the light, and four times a revolution the projection collapses into a flat
   elevation and opens again. Nothing here is a 3D engine. It is the drawing
   an architect makes by hand, redrawn sixty times a second from a different
   corner of the room.

   THE PLOTS ARE A PLACE, NOT A PATTERN. Every plot's existence, its jitter
   off the grid, and the district it belongs to come from a hash of its
   coordinates, so the city is the same city on every frame and in every
   session — only the viewing angle and the wave are time. A model that
   redrew its own plan sixty times a second would not be alive, it would be
   noise.

   HEIGHT IS THE FIELD. The same summed waves the rest of the plates are drawn
   from, read here as storeys and evaluated in WORLD space, so the tall quarter
   is fixed to the city and turns with it instead of sliding across the frame.
   Anything that clears the first threshold sets back once, anything that
   clears the second sets back twice: the 1920s zoning envelope, which is the
   only reason a deco tower is shaped like a deco tower.

   THE TITLE IS WHY THE SKYLINE HAS ITS PROFILE. No mask is composited over
   this — see plate/knockout.ts. Each plot asks what it is allowed before it
   builds: plots under the line stop short of it, plots inside it stay empty
   ground. The clearing in the middle of the model is a plaza, the roofs
   around it are roofs, and not one solid on the plate has been cut. */

/** Plot size in CSS px at the width the model was composed at. */
const CELL = 88;
const REFERENCE_W = 1420;
/** Depth foreshortening — the 2:1 of every drafting board. */
const TILT = 0.52;
/** Seconds for one full revolution. Slow enough to be a masthead and not a
    carousel: a reader who looks twice sees a different corner of the model,
    a reader who looks once sees a drawing. */
const TURN = 176;
/** Where the turn starts, so the one static frame a reduced-motion reader
    gets is a proper axonometric and not an elevation. Just off the symmetric
    45°, which would give both visible walls the same width and the same tone. */
const PHASE = Math.PI * 0.31;
/** Tallest a tower may stand, as a fraction of the plate's height. */
const MAX_H = 0.92;
/** Height curve. Steep: a skyline is exceptions over a low mass, and a gentle
    curve gives a plateau with no exceptions in it. */
const GAMMA = 2.3;
/** How much of the ground is built on at all. The rest is the air this needs
    and the last plate did not have. */
const BUILT = 0.38;
/** A tower's footprint within its plot, and what each setback keeps of the
    stage below it. Slender on purpose, and narrow enough that two towers on
    neighbouring plots never touch: the gap between them is what separates one
    solid from the next, which is cheaper and truer than drawing a line there. */
const FOOT = 0.52;
const SETBACK = 0.66;
/** Fractions of full height at which a tower earns its first and second
    setback, and where the stages are cut. */
const STAGE_AT = [0.13, 0.33];
const SPLIT_2 = 0.63;
const SPLIT_3 = [0.46, 0.78];
/** How far a plot may sit off its grid node. Enough that no two towers ever
    line up exactly, which matters most at the four angles where the model
    flattens into an elevation. */
const JITTER = 0.17;
/** Wavelength of the standing field, in plots. */
const WAVELENGTH = 5.4;
/** The light, in screen space rather than world space — fixed to the reader,
    not to the model, so a wall changes tone as it turns towards it. That is
    the whole of what makes the rotation legible. Low and from the left. */
const LIGHT_U = -0.94;
const LIGHT_V = -0.34;
/** How much of a wall survives facing away from it. */
const AMBIENT = 0.2;
/** Where the ground plane's origin sits down the plate. */
const HORIZON = 0.73;
/** Air left under the title by a tower that has to stop short of it, as a
    fraction of a plot — jittered, so the roofs that top out beneath the line
    make a ragged datum rather than one flat cut. */
const CLEARANCE = 0.06;
const CLEARANCE_VARY = 0.16;
/** Shading steps precomputed per colour. Enough that the turn is smooth,
    few enough that no frame ever builds a colour string. */
const STEPS = 24;
/** Depth bands, and how far the farthest of them is sunk into the ground.
    Aerial perspective: the far side of the model goes to smoke and only the
    near blocks keep their full tone. It is the oldest way of putting air into
    a picture, it costs one array index, and without it a plate this wide is
    an evenly loud city from one trim to the other. */
const BANDS = 12;
const HAZE = 0.94;
/** Where the haze is total and where it has run out, down the plate. The far
    band is all but the ground colour, so the model does not end at an edge —
    it dissolves, and the top of the plate is sky. */
const FOG_FAR = 0.1;
const FOG_NEAR = 0.88;

/** Round a plot: (+,+), (+,−), (−,−), (−,+). Wall k runs from corner k to
    corner k+1, so wall 0 faces +X, 1 faces −Y, 2 faces −X, 3 faces +Y. */
const CORNER_X = [1, 1, -1, -1];
const CORNER_Y = [1, -1, -1, 1];

/** Deterministic per-plot noise — the city's plan, which is not allowed to
    change between frames. */
function hash(x: number, y: number, salt: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(salt, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export default function TurntableField({
  palette,
  motto,
  className,
}: {
  /** Motto colours the districts are built in. */
  palette: string[];
  /** A title to stand in the model. Already translated by the caller. */
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

      /* Walls are shaded by MIXING toward the plate's own ground, never by
         alpha. Draw order is the only depth this has, and a translucent wall
         lets the tower behind show through the one in front, at which point
         the model reads as glass.

         Every tone the plate can ever need is built here: one ramp of light
         per stock, times one band per depth. Two array indices at draw time,
         and not a single colour computed inside a frame. */
      const stock = [paper, ...colours].map((hex, i) => {
        // The motto colours were drawn to be fields carrying paper type. As
        // fifty small solids they come out shouting, so they are let down
        // towards the paper before they are ever shaded.
        const base = i === 0 ? hex : mix(hex, paper, 0.34);
        return Array.from({ length: BANDS }, (_, d) => {
          const haze = HAZE * (1 - d / (BANDS - 1));
          const to = (amt: number) => mix(base, ground, amt + (1 - amt) * haze);
          return {
            wall: Array.from({ length: STEPS + 1 }, (_, s) =>
              to(0.6 - 0.52 * (s / STEPS)),
            ),
            roof: to(0.03),
          };
        });
      });

      let w = 0;
      let h = 0;
      let S = CELL;
      let horizon = 0;
      let zMax = 0;
      let riseMax = 0;
      let reach = 0;
      const k = (2 * Math.PI) / WAVELENGTH;

      /** Per-plot scratch, reallocated only on resize. */
      let sxs = new Float64Array(0);
      let sys = new Float64Array(0);
      let wxs = new Float64Array(0);
      let wys = new Float64Array(0);
      let gxs = new Int32Array(0);
      let gys = new Int32Array(0);
      let order: number[] = [];

      /** Corner offsets in screen px, per stage, rebuilt once a frame. */
      const ox = new Float64Array(12);
      const oy = new Float64Array(12);
      const half = [FOOT / 2, (FOOT / 2) * SETBACK, (FOOT / 2) * SETBACK * SETBACK];

      const quad = (
        x1: number, y1: number,
        x2: number, y2: number,
        x3: number, y3: number,
        x4: number, y4: number,
      ) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.fill();
      };

      const plate: Plate = {
        resize(width, height, dpr) {
          w = width;
          h = height;
          cut?.layout(width, height, dpr);
          // Roughly the same number of plots across at every width, so a phone
          // gets a smaller model rather than four enormous blocks.
          S = CELL * Math.max(0.44, Math.min(1, width / REFERENCE_W));
          horizon = height * HORIZON;
          riseMax = height * MAX_H;
          zMax = riseMax / S;

          // The lattice has to be generated over a disc wide enough to still
          // cover the frame once turned — plus, below it, the strip of ground
          // that is off the bottom of the plate but whose towers are not.
          const uReach = (width / 2 + S) / S;
          const vLow = (-S - horizon) / (S * TILT);
          const vHigh = (height + riseMax + S - horizon) / (S * TILT);
          const vReach = Math.max(Math.abs(vLow), Math.abs(vHigh));
          reach = Math.ceil(Math.hypot(uReach, vReach)) + 1;

          const n = (2 * reach + 1) * (2 * reach + 1);
          sxs = new Float64Array(n);
          sys = new Float64Array(n);
          wxs = new Float64Array(n);
          wys = new Float64Array(n);
          gxs = new Int32Array(n);
          gys = new Int32Array(n);
          order = [];
        },

        draw(t) {
          if (w === 0 || h === 0) return;
          const th = PHASE + (t / TURN) * Math.PI * 2;
          const cs = Math.cos(th);
          const sn = Math.sin(th);
          const cx = w / 2;

          /* Which two walls of every box face the reader, and how hard the
             light lands on them. Constant across the whole model, so it is
             settled once a frame instead of once a wall.
               wall 0 (+X): n = ( cs, −sn)     wall 2 (−X): n = (−cs,  sn)
               wall 1 (−Y): n = (−sn, −cs)     wall 3 (+Y): n = ( sn,  cs)
             A wall faces the reader when its normal's depth component is
             positive, which is true of exactly one of {0,2} and one of {1,3} —
             so a box always shows two walls, and at the four angles where one
             goes edge-on it does so at zero width and nothing pops. */
          const nu = [cs, -sn, -cs, sn];
          const nv = [-sn, -cs, sn, cs];
          let wallA = -1;
          let wallB = -1;
          let litA = 0;
          let litB = 0;
          for (let i = 0; i < 4; i++) {
            if (nv[i] <= 0) continue;
            // An ambient floor under the lambert term: a wall turned right away from
            // the light is still a wall in a room, and at a true zero it goes to
            // the ground colour and the tower loses a side.
            const lam = AMBIENT + (1 - AMBIENT) * Math.max(0, nu[i] * LIGHT_U + nv[i] * LIGHT_V);
            const step = Math.round(lam * STEPS);
            if (wallA < 0) {
              wallA = i;
              litA = step;
            } else {
              wallB = i;
              litB = step;
            }
          }

          for (let s = 0; s < 3; s++) {
            for (let c = 0; c < 4; c++) {
              const a = half[s];
              ox[s * 4 + c] = a * (CORNER_X[c] * cs + CORNER_Y[c] * sn) * S;
              oy[s * 4 + c] = a * (-CORNER_X[c] * sn + CORNER_Y[c] * cs) * S * TILT;
            }
          }

          // Two sources in WORLD units, drifting slowly. The tall quarter is a
          // quarter of the city, not a bright patch of the screen.
          const ax = 3.1 * Math.cos(t * 0.041);
          const ay = 2.7 * Math.sin(t * 0.033);
          const bx = 2.6 * Math.cos(t * 0.029 + 2.2);
          const by = 3.3 * Math.sin(t * 0.047 + 1.1);

          ctx.clearRect(0, 0, w, h);

          // ── The plan, gathered and sorted back to front ───────────────
          let n = 0;
          for (let gy = -reach; gy <= reach; gy++) {
            for (let gx = -reach; gx <= reach; gx++) {
              const wx = gx + (hash(gx, gy, 1) - 0.5) * JITTER * 2;
              const wy = gy + (hash(gx, gy, 2) - 0.5) * JITTER * 2;
              const sx = cx + (wx * cs + wy * sn) * S;
              if (sx < -S || sx > w + S) continue;
              const sy = horizon + (-wx * sn + wy * cs) * S * TILT;
              if (sy < -S || sy > h + riseMax + S) continue;
              sxs[n] = sx;
              sys[n] = sy;
              wxs[n] = wx;
              wys[n] = wy;
              gxs[n] = gx;
              gys[n] = gy;
              order[n] = n;
              n++;
            }
          }
          order.length = n;
          // Down the screen is towards the reader, so this IS the depth order.
          order.sort((p, q) => sys[p] - sys[q]);

          // ── The model ────────────────────────────────────────────────
          for (let i = 0; i < n; i++) {
            const p = order[i];
            const sx = sxs[p];
            const sy = sys[p];
            const gx = gxs[p];
            const gy = gys[p];

            if (hash(gx, gy, 3) > BUILT) continue;

            // The plot's screen extent — which is the question the title has
            // to answer before anything is allowed to stand on it.
            let x0 = Infinity;
            let x1 = -Infinity;
            let y0 = Infinity;
            let y1 = -Infinity;
            for (let c = 0; c < 4; c++) {
              const px = sx + ox[c];
              const py = sy + oy[c];
              if (px < x0) x0 = px;
              if (px > x1) x1 = px;
              if (py < y0) y0 = py;
              if (py > y1) y1 = py;
            }

            // Nothing is cut here and nothing is composited over: a plot in
            // the clearing simply does not build, and one under the line
            // builds up to it and stops. The hole in the model is the shape of
            // the decisions the plots made, not of a mask.
            const head = cut ? cut.headroom(x0, y0, x1, y1) : Infinity;
            if (head < 0) continue;

            /* Colour is fixed to the GROUND, in districts of four plots by
               four. A quarter keeps its material as the model turns and as the
               wave passes over it, so the coloured masses read as programme
               rather than as three tins of paint thrown at a city. */
            const dx = gx >> 2;
            const dy = gy >> 2;
            const roll = hash(dx, dy, 5);
            const district =
              roll < 0.72 || !colours.length
                ? 0
                : 1 + Math.min(colours.length - 1, Math.floor(hash(dx, dy, 6) * colours.length));
            // Aerial band: the far end of the model, near the top of the
            // plate, is smoke; the near end keeps its full tone.
            const fog = (sy / h - FOG_FAR) / (FOG_NEAR - FOG_FAR);
            const depth = Math.max(0, Math.min(BANDS - 1, Math.round(fog * (BANDS - 1))));
            const ink = stock[district][depth];

            const amp = interference(wxs[p], wys[p], ax, ay, bx, by, k, t);
            let z = zMax * Math.pow(amp, GAMMA);
            if (head !== Infinity) {
              const air = (CLEARANCE + hash(gx, gy, 4) * CLEARANCE_VARY) * S;
              const cap = (head - air) / S;
              if (cap < z) z = cap;
            }
            if (z * S < 2) continue;

            // Stages, and where they are cut. A tower that clears the first
            // threshold steps in once, one that clears the second steps in
            // twice — the zoning envelope, which is the shape itself.
            const stages = z > zMax * STAGE_AT[1] ? 3 : z > zMax * STAGE_AT[0] ? 2 : 1;
            let base = 0;
            for (let s = 0; s < stages; s++) {
              const cut1 =
                stages === 1
                  ? z
                  : stages === 2
                    ? s === 0
                      ? z * SPLIT_2
                      : z
                    : s === 0
                      ? z * SPLIT_3[0]
                      : s === 1
                        ? z * SPLIT_3[1]
                        : z;
              const lo = base * S;
              const hi = cut1 * S;
              base = cut1;
              const o = s * 4;

              // The two walls that face the reader, in their own light.
              if (wallA >= 0) {
                const c1 = wallA;
                const c2 = (wallA + 1) & 3;
                ctx.fillStyle = ink.wall[litA];
                quad(
                  sx + ox[o + c1], sy + oy[o + c1] - hi,
                  sx + ox[o + c2], sy + oy[o + c2] - hi,
                  sx + ox[o + c2], sy + oy[o + c2] - lo,
                  sx + ox[o + c1], sy + oy[o + c1] - lo,
                );
              }
              if (wallB >= 0) {
                const c1 = wallB;
                const c2 = (wallB + 1) & 3;
                ctx.fillStyle = ink.wall[litB];
                quad(
                  sx + ox[o + c1], sy + oy[o + c1] - hi,
                  sx + ox[o + c2], sy + oy[o + c2] - hi,
                  sx + ox[o + c2], sy + oy[o + c2] - lo,
                  sx + ox[o + c1], sy + oy[o + c1] - lo,
                );
              }

              // …and the roof, which is the one face that never turns away.
              ctx.fillStyle = ink.roof;
              quad(
                sx + ox[o + 0], sy + oy[o + 0] - hi,
                sx + ox[o + 1], sy + oy[o + 1] - hi,
                sx + ox[o + 2], sy + oy[o + 2] - hi,
                sx + ox[o + 3], sy + oy[o + 3] - hi,
              );
            }
          }

          // Nothing to erase — the clearing was made by not building in it.
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
