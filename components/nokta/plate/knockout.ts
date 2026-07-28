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
   made of clipped marks. On a massing model or a ruled field that is
   invisible, because a sliced block edge or a cut rule looks like any other
   block edge or rule. On a DOT raster it is glaring: half a dot is not a dot,
   and a hundred half-dots in a row are an outline.

   `dodged` is for those. It answers whether a point lies in the type's clear
   space, so a raster can decline to draw the dot at all — whole dots absent,
   a ragged clearing that follows the lattice instead of the glyph, and no rim.
   It only works for art that is made of small independent marks whose position
   is known before it is drawn; a block that may rise into the title from a
   plot well below it, or a polyline crossing the whole plate, cannot answer
   the question cheaply, which is what `punch` is for.

   It is not free, though, and the naive version of it is expensive: blitting
   a full-plate bitmap every frame costs a couple of million pixels of fill on
   a wide masthead and took a third off the frame rate of three pages. The
   mask is almost entirely empty — the type is a fifth of the plate at most —
   so `layout` records the dilated block's bounding box and `punch` composites
   only that. Same result, a fraction of the fill.

   The mask is rebuilt only when the plate is resized or the webfont finally
   lands — never per frame. */

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

export type Knockout = {
  /** Re-fit the type and re-cut the mask. CSS pixels, plus the backing
      store's ratio so the mask is cut at the resolution it will erase at. */
  layout: (width: number, height: number, dpr: number) => void;
  /** Erase the type's clear space out of everything drawn so far. Cuts
      whatever it lands on — right for volumes and rules, wrong for dots. */
  punch: (ctx: CanvasRenderingContext2D) => void;
  /** Is this point inside the type's clear space? For art made of small
      independent marks, which can simply decline to draw one. CSS pixels. */
  dodged: (x: number, y: number) => boolean;
  /** Paint the type into the hole. Its closing character takes the accent —
      the same move the hero headline and the footer wordmark make. */
  paint: (ctx: CanvasRenderingContext2D) => void;
};

export function makeKnockout(
  text: string,
  face: string,
  paper: string,
  accent: string,
): Knockout {
  const off = document.createElement("canvas");
  let mc: CanvasRenderingContext2D | null = null;
  let ready = false;

  let lines: string[] = [];
  let lineX: number[] = [];
  let fontSize = 0;
  let step = 0;
  let firstBaseline = 0;
  /** The dilated type's bounding box, in DEVICE pixels — the only part of the
      mask that has anything in it, and so the only part worth compositing. */
  let bx = 0;
  let by = 0;
  let bw = 0;
  let bh = 0;
  /** The mask's alpha, kept for `dodged`. */
  let alpha: Uint8ClampedArray | null = null;
  let maskW = 0;
  let scale = 1;

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
    // pixel of slack, clamped to the plate. CSS px → device px.
    const widest = Math.max(...lines.map((l) => mc!.measureText(l).width));
    const left = Math.min(...lineX) - pen - 2;
    const top = firstBaseline - fontSize * 1.05 - pen - 2;
    const right = Math.min(...lineX) + widest + pen + 2;
    const bottom = firstBaseline + (lines.length - 1) * step + fontSize * 0.34 + pen + 2;
    bx = Math.max(0, Math.floor(left * dpr));
    by = Math.max(0, Math.floor(top * dpr));
    bw = Math.min(off.width - bx, Math.ceil((right - left) * dpr) + 1);
    bh = Math.min(off.height - by, Math.ceil((bottom - top) * dpr) + 1);
    // Read back once, so `dodged` is an array index rather than a canvas call.
    alpha = mc.getImageData(0, 0, off.width, off.height).data;
    maskW = off.width;
    scale = dpr;
    ready = bw > 0 && bh > 0;
  };

  const punch = (ctx: CanvasRenderingContext2D) => {
    if (!ready) return;
    ctx.save();
    // The mask is already at backing-store resolution, so it is blitted 1:1
    // rather than through the context's device transform — and only over the
    // box the type occupies, which is the only part of it that is not empty.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(off, bx, by, bw, bh, bx, by, bw, bh);
    ctx.restore();
  };

  const dodged = (x: number, y: number) => {
    if (!ready || !alpha) return false;
    const ix = (x * scale) | 0;
    const iy = (y * scale) | 0;
    if (ix < 0 || iy < 0 || ix >= maskW) return false;
    const a = alpha[(iy * maskW + ix) * 4 + 3];
    return a !== undefined && a > 8;
  };

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
        ctx.fillText(s.slice(-1), lineX[i] + ctx.measureText(body).width, y);
      }
    });
  };

  return { layout, punch, dodged, paint };
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
