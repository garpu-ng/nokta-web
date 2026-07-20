// Deterministic geometry for the home manifesto marks (ProgressionMark and
// BranchCardMark). Everything here is a pure function of its arguments — no
// Math.random and no clock reads — so the emitted SVG is byte-identical on the
// server and the first client render (SSR-stable), and nothing ever moves.

export type Pt = { x: number; y: number };

/* mulberry32 — the same tiny seeded PRNG used elsewhere on the site
   (components/line/PlotLine, components/arch/DotField). Kept local so the home
   marks stay self-contained rather than reaching across the tree. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* A pen-plotter path in a `width × height` box: points evenly spaced on x,
   jittered on y by the seeded PRNG, then joined as Catmull–Rom → cubic Bézier
   (identical maths to components/line/PlotLine). The first `calm` points stay
   near the centre line so the plot eases in. Returns the path plus its start /
   end so the caller can cap the ends with a dot and a crosshair. */
export function plotLine(opts: {
  width: number;
  height: number;
  count: number;
  seed: number;
  amp: number;
  calm?: number;
}): { d: string; start: Pt; end: Pt } {
  const { width, height, count, seed, amp, calm = 2 } = opts;
  const rand = mulberry32(seed);
  const pts: Pt[] = Array.from({ length: count }, (_, i) => ({
    x: (i * width) / (count - 1),
    y: height / 2 + (rand() - 0.5) * (i < calm ? amp * 0.2 : amp),
  }));

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return { d, start: pts[0], end: pts[pts.length - 1] };
}

/* A wireframe cube: a front square and a back square offset by the depth vector
   (dx, dy). Returns two path strings — the nine visible edges (solid) and the
   three edges meeting the enclosed rear vertex (drawn dashed, like construction
   lines). Purely geometric, so both the lead diagram and the card mark share
   one definition of "cube". */
export function cube(opts: {
  x: number;
  y: number;
  side: number;
  dx: number;
  dy: number;
}): { visible: string; hidden: string } {
  const { x, y, side, dx, dy } = opts;
  // Front square, top-left origin at (x, y).
  const ftl = { x, y };
  const ftr = { x: x + side, y };
  const fbr = { x: x + side, y: y + side };
  const fbl = { x, y: y + side };
  // Back square, shifted by the depth vector.
  const btl = { x: ftl.x + dx, y: ftl.y + dy };
  const btr = { x: ftr.x + dx, y: ftr.y + dy };
  const bbr = { x: fbr.x + dx, y: fbr.y + dy };
  const bbl = { x: fbl.x + dx, y: fbl.y + dy };

  const seg = (a: Pt, b: Pt) =>
    `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;

  const visible = [
    seg(ftl, ftr), seg(ftr, fbr), seg(fbr, fbl), seg(fbl, ftl), // front face
    seg(btl, btr), seg(btr, bbr),                               // back (seen)
    seg(ftl, btl), seg(ftr, btr), seg(fbr, bbr),                // depth (seen)
  ].join(" ");
  // The three edges into the enclosed rear vertex (bbl) sit behind the solid.
  const hidden = [seg(bbl, btl), seg(bbl, bbr), seg(bbl, fbl)].join(" ");
  return { visible, hidden };
}

/* A circular halftone cluster: dots on a grid clipped to a disc, radius ramped
   by distance from the centre (the same idea as components/nokta/NoktaHero, in
   miniature). Deterministic without a PRNG — the pattern is a pure function of
   the grid. */
export function halftone(opts: {
  size: number;
  step: number;
  maxR: number;
  minR?: number;
}): { x: number; y: number; r: number }[] {
  const { size, step, maxR, minR = 0.6 } = opts;
  const c = size / 2;
  const dots: { x: number; y: number; r: number }[] = [];
  for (let y = step / 2; y < size; y += step) {
    for (let x = step / 2; x < size; x += step) {
      const dist = Math.hypot(x - c, y - c);
      if (dist > c - step / 2) continue;
      dots.push({ x, y, r: minR + (maxR - minR) * Math.pow(1 - dist / c, 0.7) });
    }
  }
  return dots;
}
