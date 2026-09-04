/* The knockout, once — a title cut out of whatever a plate happens to draw.

   Every plate on this site can now carry the name of the page it heads, and
   none of them should have to know how. The rule is the same in all four:
   the art does not run behind the type, it gets out of its way, and what
   surrounds a letter is clean ground rather than a dot, a rule or a rooftop
   cut in half. That is what a knockout is on a press.

   HOW. The line is drawn once into an offscreen canvas, stroked with a fat
   round pen BEFORE it is filled so every glyph comes out dilated by a clear
   margin, and that canvas is kept. Then, each frame, the plate draws whatever
   it draws and the mask is composited over it with `destination-out`, which
   erases exactly the dilated glyph shape and nothing else. Finally the type
   is painted into the hole it just made.

   TWO WAYS OUT OF THE WAY, and a plate must pick the right one.

   `punch` composites, and compositing CUTS. It erases pixels, so any mark
   straddling the mask's edge is sliced in half and the survivors form a hard
   rim following the letterforms — the type ends up wearing a visible contour
   made of clipped marks. It is the cheap answer and it looks it: on anything
   dense the rim reads as a sticker stuck over the picture rather than as a
   hole in it. Left to the ruled field, where a cut rule looks like any other
   rule, and to nothing else.

   `dodged` answers whether one point lies in the type's clear space, and it is
   what everything else on this site uses. Art made of independent marks — a
   dot, a disc, a solid — knows where a mark is going before it draws it, so it
   can decline to draw it, or draw it smaller, and the clearing comes out
   ragged along the art's own grain instead of along the glyph. Nothing is cut,
   so nothing has a rim. A mark bigger than a letter is not judged by its
   centre: the plate samples its own shape and asks about several points, which
   is its business rather than this file's.

   Both of those, and the bounding box that makes them cheap, are the same
   whatever was cut — they live in plate/maskRegion.ts, which markKnockout.ts
   shares. This file is only the fitting and the setting of TYPE.

   The mask is rebuilt only when the plate is resized or the webfont finally
   lands — never per frame. */

import { NO_MASK, readMask, type Knockout, type MaskRegion } from "./maskRegion";

export type { Knockout };

/** How far the art is held off the type, as a fraction of the cap height.
    Enough that the letter has air, and no more: the clearing is drawn with a
    round pen, so on a DENSE plate — the massing model — a generous margin
    stops reading as a knockout and starts reading as a gooey sticker outline
    stuck over the picture. Tight enough to be a cut, loose enough to breathe. */
const DODGE = 0.13;
/** Type is set at the largest size that fits this much of the plate's width.
    The remaining fifth is the line's own margin — a knockout needs air on the
    outside as well as around each letter. */
const TEXT_W = 0.78;
/** …and this much of its height. The height budget is the real composition
    control, and it is deliberately mean on a wide plate. The fitter maximises
    SIZE, and two lines can always be set larger than one, so a generous height
    silently buys a stacked block that fills the plate and turns the art into a
    frame around a headline. Starving the height makes a single line the only
    thing that fits, which is the composition this wants: a field, with a name
    standing in it. A squarer plate (a phone) has no room for that trick and
    gets the height back, so a long name can stack and stay legible. */
const TEXT_H_WIDE = 0.22;
const TEXT_H_TALL = 0.52;
/** Above this height-to-width ratio a plate counts as "tall". */
const TALL_AT = 0.5;

export function makeKnockout(
  text: string,
  face: string,
  paper: string,
  accent: string,
): Knockout {
  const off = document.createElement("canvas");
  let mc: CanvasRenderingContext2D | null = null;
  let ready = false;
  /** The cut mask, once it has been read back. */
  let mask: MaskRegion = NO_MASK;

  let lines: string[] = [];
  let lineX: number[] = [];
  let fontSize = 0;
  let step = 0;
  let firstBaseline = 0;
  /** Width of the closing line minus its last character — where the accent
      period starts. Fixed the moment the type is fitted, so `paint` does not
      measure text on every frame of every plate to find out. */
  let bodyWidth = 0;

  /** Greedy wrap at a given size. Languages that do not space their words
      (the Japanese line) are broken by character instead. */
  const wrap = (m: CanvasRenderingContext2D, size: number, maxW: number) => {
    m.font = `700 ${size}px ${face}`;
    const spaced = text.includes(" ");
    const parts = spaced ? text.split(" ") : Array.from(text);
    const glue = spaced ? " " : "";
    const out: string[] = [];
    let cur = "";
    for (const part of parts) {
      const test = cur ? cur + glue + part : part;
      if (cur && m.measureText(test).width > maxW) {
        out.push(cur);
        cur = part;
      } else {
        cur = test;
      }
    }
    if (cur) out.push(cur);
    return out;
  };

  const layout = (width: number, height: number, dpr: number) => {
    ready = false;
    mask = NO_MASK;
    if (!text || width === 0 || height === 0) return;

    off.width = Math.max(1, Math.round(width * dpr));
    off.height = Math.max(1, Math.round(height * dpr));
    mc = off.getContext("2d");
    if (!mc) return;
    // Measure and cut in CSS pixels; the transform carries the ratio, so the
    // mask lands on the same grid the art was drawn on.
    mc.setTransform(dpr, 0, 0, dpr, 0, 0);
    mc.clearRect(0, 0, width, height);

    const boxW = width * TEXT_W;
    const boxH = height * (height / width > TALL_AT ? TEXT_H_TALL : TEXT_H_WIDE);

    // Largest size whose wrapped block still fits the box. Binary search
    // rather than a formula: wrapping changes the line count underneath us,
    // so the fit is not monotonic in any expression worth writing.
    let lo = 9;
    let hi = Math.max(10, Math.min(width * 0.16, height * 0.7));
    let best = lo;
    let bestLines = [text];
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      const ls = wrap(mc, mid, boxW);
      const w = Math.max(...ls.map((s) => mc!.measureText(s).width));
      if (w <= boxW && ls.length * mid * 1.14 <= boxH) {
        best = mid;
        bestLines = ls;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    fontSize = best;
    lines = bestLines;
    step = fontSize * 1.14;
    firstBaseline = (height - step * lines.length) / 2 + fontSize * 0.84;

    mc.font = `700 ${fontSize}px ${face}`;
    lineX = lines.map((s) => (width - mc!.measureText(s).width) / 2);
    const closing = lines[lines.length - 1] ?? "";
    bodyWidth = mc.measureText(closing.slice(0, -1)).width;

    // Stroke-then-fill with a fat round pen dilates every glyph by exactly
    // the margin the art must keep off it.
    mc.textBaseline = "alphabetic";
    mc.lineJoin = "round";
    mc.lineCap = "round";
    const pen = Math.max(6, fontSize * DODGE);
    mc.lineWidth = pen * 2;
    mc.strokeStyle = "#fff";
    mc.fillStyle = "#fff";
    lines.forEach((s, i) => {
      const y = firstBaseline + i * step;
      mc!.strokeText(s, lineX[i], y);
      mc!.fillText(s, lineX[i], y);
    });

    // The box the type actually occupies, grown by the dilation pen and a
    // pixel of slack. Read back once, so `dodged` is an array index rather
    // than a canvas call — and only the box, which is the only part of the
    // mask with ink in it.
    const widest = Math.max(...lines.map((l) => mc!.measureText(l).width));
    const left = Math.min(...lineX) - pen - 2;
    const top = firstBaseline - fontSize * 1.05 - pen - 2;
    mask = readMask(
      off,
      mc,
      dpr,
      left,
      top,
      Math.min(...lineX) + widest + pen + 2,
      firstBaseline + (lines.length - 1) * step + fontSize * 0.34 + pen + 2,
    );
    ready = mask !== NO_MASK;
  };

  /** Paint the type into the hole. Its closing character takes the accent —
      the same move the hero headline and the footer wordmark make. */
  const paint = (ctx: CanvasRenderingContext2D) => {
    if (!ready) return;
    ctx.font = `700 ${fontSize}px ${face}`;
    ctx.textBaseline = "alphabetic";
    lines.forEach((s, i) => {
      const y = firstBaseline + i * step;
      const last = i === lines.length - 1;
      const body = last ? s.slice(0, -1) : s;
      ctx.fillStyle = paper;
      ctx.fillText(body, lineX[i], y);
      if (last && s.length) {
        ctx.fillStyle = accent;
        ctx.fillText(s.slice(-1), lineX[i] + bodyWidth, y);
      }
    });
  };

  return {
    layout,
    paint,
    punch: (ctx) => mask.punch(ctx),
    dodged: (x, y) => mask.dodged(x, y),
    mayTouch: (x0, y0, x1, y1) => mask.mayTouch(x0, y0, x1, y1),
  };
}

/** The face and the two colours every plate reads off its own canvas. */
export function plateInk(canvas: HTMLCanvasElement) {
  const css = getComputedStyle(canvas);
  return {
    paper: css.getPropertyValue("--nk-field-ink").trim() || "#e9e0ce",
    accent: css.getPropertyValue("--nk-field-mark").trim() || "#b83636",
    ground: css.getPropertyValue("--nk-field-ground").trim() || "#1f1f1c",
    face: css.getPropertyValue("--nk-field-face").trim() || "Arial, sans-serif",
  };
}
