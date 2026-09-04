/* The read-back half of a knockout, once.

   A knockout is two halves: something that CUTS a shape into an offscreen
   canvas — a line of type (knockout.ts), a wordmark (markKnockout.ts) — and
   the reading of that canvas back, which is the same work whatever cut it.
   This file is the second half.

   All of it exists to serve the one optimisation the mask has, and it is
   worth twice. The mask is almost entirely empty: the shape is a fifth of the
   plate at most, so only its bounding box is ever composited (blitting the
   full plate every frame took a third off the frame rate of three pages) and
   only its bounding box is ever read back (reading the full plate cost 6.4MB
   per fit at 1440×900@2x against 2.1MB for the box, and it grows with the
   square of both the viewport and the ratio — 22MB at 2560×1440@2x, and a
   second of dragging a window edge is thirty fits).

   Everything downstream therefore indexes a buffer that starts at the box's
   corner rather than at the plate's, and has to say so: outside the box there
   is no array rather than a transparent one. */

/** The three questions a cut mask can answer, and nothing about what cut it. */
export type MaskRegion = {
  /** Erase the clear space out of everything drawn so far. Cuts whatever it
      lands on — right for volumes and rules, wrong for dots. */
  punch: (ctx: CanvasRenderingContext2D) => void;
  /** Is this point inside the clear space? For art made of small independent
      marks, which can simply decline to draw one. CSS pixels. */
  dodged: (x: number, y: number) => boolean;
  /** Could anything inside this box reach the clear space? One AABB test
      against the dilated block, so art that samples several points per mark
      can throw out the great majority of its marks — the ones nowhere near
      the shape — before asking about any of them. CSS pixels. */
  mayTouch: (x0: number, y0: number, x1: number, y1: number) => boolean;
};

/** What a plate gets before its mask is cut, or when there is nothing to cut:
    nothing to erase, nothing in the way. */
export const NO_MASK: MaskRegion = {
  punch: () => {},
  dodged: () => false,
  mayTouch: () => false,
};

/** A shape already drawn into `off`, in whatever way it was drawn, read back
    over the box it occupies. The bounds are CSS pixels and are the DILATED
    shape's — the margin is the cutter's business, not this file's. */
export function readMask(
  off: HTMLCanvasElement,
  mc: CanvasRenderingContext2D,
  dpr: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
): MaskRegion {
  const bx = Math.max(0, Math.floor(left * dpr));
  const by = Math.max(0, Math.floor(top * dpr));
  const bw = Math.min(off.width - bx, Math.ceil((right - left) * dpr) + 1);
  const bh = Math.min(off.height - by, Math.ceil((bottom - top) * dpr) + 1);
  if (bw <= 0 || bh <= 0) return NO_MASK;
  const alpha = mc.getImageData(bx, by, bw, bh).data;

  return {
    punch(ctx) {
      ctx.save();
      // The mask is already at backing-store resolution, so it is blitted 1:1
      // rather than through the context's device transform — and only over the
      // box the shape occupies, which is the only part of it that is not empty.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(off, bx, by, bw, bh, bx, by, bw, bh);
      ctx.restore();
    },

    dodged(x, y) {
      // Into the box's own frame. Every bound is checked here rather than left
      // to an out-of-range read returning undefined: the buffer does not span
      // the plate, so a point past its edge would land on a real pixel of some
      // other row instead of on nothing.
      const ix = ((x * dpr) | 0) - bx;
      const iy = ((y * dpr) | 0) - by;
      if (ix < 0 || iy < 0 || ix >= bw || iy >= bh) return false;
      return alpha[(iy * bw + ix) * 4 + 3] > 8;
    },

    mayTouch(x0, y0, x1, y1) {
      return !(
        x1 * dpr < bx ||
        x0 * dpr > bx + bw ||
        y1 * dpr < by ||
        y0 * dpr > by + bh
      );
    },
  };
}

/** A shape a plate carries: cut when the box changes, then read and painted
    every frame. Both cutters in this folder produce one. */
export type Knockout = MaskRegion & {
  /** Re-fit the shape and re-cut the mask. CSS pixels, plus the backing
      store's ratio so the mask is cut at the resolution it will erase at. */
  layout: (width: number, height: number, dpr: number) => void;
  /** Paint the shape into the hole it made. */
  paint: (ctx: CanvasRenderingContext2D) => void;
};
