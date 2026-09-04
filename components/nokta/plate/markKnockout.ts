/* The same knockout, cut to the wordmark instead of to a line of type.

   The studio's line used to stand in the homepage plate as a sentence. It
   stands there as the MARK now, which is the shorter way of saying it: the
   name is a dot with letters round it, and the plate it stands in is made of
   nothing but dots. Cutting the mark out of the raster rather than laying it
   over it is what makes the two the same object — the wordmark is not printed
   on the field, it is the shape the field leaves empty.

   Everything about it that is not the shape is knockout.ts's: the art gets out
   of the way rather than being covered, `dodged` lets a plate decline to draw
   a mark that would land in the clear space, and the bounding box keeps both
   cheap (plate/maskRegion.ts). Only the two ends differ, and both differ for
   the same reason — there is no font here, there is a bitmap:

   THE DILATION. Type is dilated by stroking it with a fat round pen before it
   is filled, which a raster image cannot be. So the margin is built the way a
   morphologist would build it: the mark is stamped repeatedly around a ring of
   offsets, and the union of those stamps IS the mark grown by the ring's
   radius. Two rings rather than one — the inner one fills the scallops the
   outer one leaves between neighbouring stamps.

   THE COLOUR. The asset is black on transparent (it is the same file the
   masthead wears as a CSS mask, public/nokta_logo.png), and the plate needs it
   in the plate's own ink. `filter: invert()` lands on pure white, a colder
   thing than every word around it — so the mark is tinted the way
   components/Wordmark.tsx tints it, by filling a canvas with the ink and
   keeping only the pixels the mark covers. Exactly --nk-field-ink, and it
   stays exact if that token ever moves.

   Both are done once per layout, never per frame. */

import { NO_MASK, readMask, type Knockout, type MaskRegion } from "./maskRegion";

/** How far the art is held off the mark, as a fraction of the mark's height.
    Tighter than the type's margin in proportion, because the wordmark is a
    far heavier shape than a letter: the same relative clearance round a stroke
    this fat reads as a halo rather than as air. */
const DODGE = 0.12;
/** The mark is set to this much of the plate's width — and it is the width
    that governs, because a wordmark is a horizontal object and the plate is a
    horizontal band. A tall plate (a phone) has width to spare relative to its
    height and gets more of it, so the mark does not shrink to a bug. */
const MARK_W_WIDE = 0.56;
const MARK_W_TALL = 0.72;
/** …but never more than this much of the plate's height. Only bites on a
    plate squarer than the mark itself. */
const MARK_H = 0.36;
/** Above this height-to-width ratio a plate counts as "tall". */
const TALL_AT = 0.5;
/** The two rings of stamps the dilation is built from, as counts and as a
    fraction of the pen's radius. Twenty stamps put adjacent centres a third of
    a radius apart, which is finer than the mask is ever read at; the inner
    ring at half the radius closes the scallops between them. */
const RING_OUT = 20;
const RING_IN = 10;
const RING_IN_R = 0.5;

type Mark = { img: HTMLImageElement | null; ready: Promise<unknown> };

/** Decoded once per source per document. A plate that re-mounts — a locale
    switch, a route the field appears on twice — gets the image it already has
    rather than a second round trip and a frame with a hole in it. */
const marks = new Map<string, Mark>();

function loadMark(src: string): Mark {
  const held = marks.get(src);
  if (held) return held;
  const mark: Mark = { img: null, ready: Promise.resolve() };
  mark.ready = new Promise<void>((done) => {
    const img = new Image();
    img.onload = () => {
      mark.img = img;
      done();
    };
    // A missing asset is not worth breaking the plate over: the field simply
    // draws with nothing in its way.
    img.onerror = () => done();
    img.src = src;
  });
  marks.set(src, mark);
  return mark;
}

export function makeMarkKnockout(
  src: string,
  ink: string,
): Knockout & { ready: Promise<unknown> } {
  const off = document.createElement("canvas");
  /** The mark, already struck in the plate's ink and at the plate's
      resolution, ready to be blitted into the hole. */
  const tint = document.createElement("canvas");
  const mark = loadMark(src);
  let mask: MaskRegion = NO_MASK;
  let ready = false;
  /** Where the mark sits and how big it is, in CSS pixels. */
  let mx = 0;
  let my = 0;
  let mw = 0;
  let mh = 0;

  const layout = (width: number, height: number, dpr: number) => {
    ready = false;
    mask = NO_MASK;
    const img = mark.img;
    if (!img || width === 0 || height === 0) return;

    off.width = Math.max(1, Math.round(width * dpr));
    off.height = Math.max(1, Math.round(height * dpr));
    const mc = off.getContext("2d");
    if (!mc) return;
    // Place and cut in CSS pixels; the transform carries the ratio, so the
    // mask lands on the same grid the art was drawn on.
    mc.setTransform(dpr, 0, 0, dpr, 0, 0);
    mc.clearRect(0, 0, width, height);

    const tall = height / width > TALL_AT;
    const fit = Math.min(
      (width * (tall ? MARK_W_TALL : MARK_W_WIDE)) / img.width,
      (height * MARK_H) / img.height,
    );
    mw = img.width * fit;
    mh = img.height * fit;
    mx = (width - mw) / 2;
    my = (height - mh) / 2;

    // The mark, stamped round two rings and once in the middle. The union is
    // the mark grown by `pen` in every direction — the round pen type gets
    // from being stroked, built out of the only thing a bitmap can be built
    // out of, which is copies of itself.
    const pen = Math.max(5, mh * DODGE);
    for (const [n, r] of [
      [RING_OUT, pen],
      [RING_IN, pen * RING_IN_R],
    ] as const) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        mc.drawImage(img, mx + Math.cos(a) * r, my + Math.sin(a) * r, mw, mh);
      }
    }
    mc.drawImage(img, mx, my, mw, mh);

    mask = readMask(
      off,
      mc,
      dpr,
      mx - pen - 2,
      my - pen - 2,
      mx + mw + pen + 2,
      my + mh + pen + 2,
    );
    ready = mask !== NO_MASK;
    if (!ready) return;

    // …and the mark itself, in the plate's ink rather than in the asset's
    // black: fill the ink, then keep only what the mark covers.
    tint.width = Math.max(1, Math.round(mw * dpr));
    tint.height = Math.max(1, Math.round(mh * dpr));
    const tc = tint.getContext("2d");
    if (!tc) return;
    tc.clearRect(0, 0, tint.width, tint.height);
    tc.drawImage(img, 0, 0, tint.width, tint.height);
    tc.globalCompositeOperation = "source-in";
    tc.fillStyle = ink;
    tc.fillRect(0, 0, tint.width, tint.height);
    tc.globalCompositeOperation = "source-over";
  };

  const paint = (ctx: CanvasRenderingContext2D) => {
    if (!ready) return;
    ctx.drawImage(tint, mx, my, mw, mh);
  };

  return {
    layout,
    paint,
    ready: mark.ready,
    punch: (ctx) => mask.punch(ctx),
    dodged: (x, y) => mask.dodged(x, y),
    mayTouch: (x0, y0, x1, y1) => mask.mayTouch(x0, y0, x1, y1),
  };
}
