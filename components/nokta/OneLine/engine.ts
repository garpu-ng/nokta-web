/**
 * engine — Ein Punkt zeichnet ein Gebäude in einer einzigen Linie.
 *
 * Every building is a procedurally generated massing model (boxes,
 * setbacks, a tower, a gable). Its wireframe is turned into a graph; the
 * graph is made traversable (Chinese-postman duplication of a few edges)
 * and walked as an Eulerian trail. The result: a single unbroken stroke
 * that starts at one point, draws the whole form without lifting, holds,
 * and then retracts back into the point — which wanders on to the next
 * building. No two buildings are the same.
 *
 * Framework-free. `createOneLine(ctx)` returns { resize, draw, destroy }
 * in the same shape as the site's other canvas plates.
 */

export type Ink = { paper: string; accent: string; ground: string };

export type OneLineOptions = {
  ink: Ink;
  seed?: number;
  /** Fully drawn, no animation (prefers-reduced-motion). */
  still?: boolean;
  /** Pointer parallax source: normalized [-1,1] x/y, or null. */
  pointer?: () => { x: number; y: number } | null;
};

type V3 = [number, number, number];
type Box = { x: number; y: number; z: number; w: number; d: number; h: number };
type Gable = { x: number; y: number; z: number; w: number; d: number; ridge: number; axis: 0 | 1 };
type Seg = [V3, V3];

/* ───────────────────────── random ───────────────────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const irand = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T,>(r: () => number, xs: T[]) => xs[Math.floor(r() * xs.length)];

/* ───────────────────────── massing ───────────────────────── */

function overlaps3(a: Box, b: Box) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x &&
    a.y < b.y + b.d && a.y + a.d > b.y &&
    a.z < b.z + b.h && a.z + a.h > b.z
  );
}

function overlapsXY(a: Box, b: Box) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.d && a.y + a.d > b.y;
}

function generateMassing(r: () => number): { boxes: Box[]; gables: Gable[] } {
  const boxes: Box[] = [];
  const gables: Gable[] = [];
  const free = (b: Box) => boxes.every((o) => !overlaps3(o, b));

  // 1 · Hauptvolumen
  const main: Box = { x: 0, y: 0, z: 0, w: irand(r, 3, 6), d: irand(r, 2, 4), h: irand(r, 2, 4) };
  boxes.push(main);

  // 2 · Anbauten auf dem Boden, bündig an einer Seite
  const wings = irand(r, 1, 3);
  for (let i = 0; i < wings; i++) {
    for (let tries = 0; tries < 12; tries++) {
      const host = pick(r, boxes.filter((b) => b.z === 0));
      const side = irand(r, 0, 3);
      const w = irand(r, 1, 4), d = irand(r, 1, 3), h = irand(r, 1, Math.max(1, host.h + 1));
      let x = 0, y = 0;
      if (side === 0) { x = host.x + host.w; y = host.y + irand(r, -(d - 1), host.d - 1); }
      if (side === 1) { x = host.x - w;      y = host.y + irand(r, -(d - 1), host.d - 1); }
      if (side === 2) { y = host.y + host.d; x = host.x + irand(r, -(w - 1), host.w - 1); }
      if (side === 3) { y = host.y - d;      x = host.x + irand(r, -(w - 1), host.w - 1); }
      const b: Box = { x, y, z: 0, w, d, h };
      if (free(b)) { boxes.push(b); break; }
    }
  }

  // 3 · Rücksprünge: Aufbauten, mindestens an einer Kante bündig
  const stacks = irand(r, 1, 2);
  for (let i = 0; i < stacks; i++) {
    const hosts = boxes.filter((b) => b.w >= 2 && b.d >= 2);
    if (!hosts.length) break;
    for (let tries = 0; tries < 12; tries++) {
      const host = pick(r, hosts);
      const flushX = r() < 0.5, flushY = r() < 0.5 || !flushX;
      const insX = flushX ? 0 : irand(r, 1, Math.max(1, host.w - 1));
      const insY = flushY ? 0 : irand(r, 1, Math.max(1, host.d - 1));
      const w = Math.max(1, host.w - insX - (r() < 0.5 ? 0 : irand(r, 0, host.w - insX - 1)));
      const d = Math.max(1, host.d - insY - (r() < 0.5 ? 0 : irand(r, 0, host.d - insY - 1)));
      // Auskragung: mit 30 % ragt der Aufbau 1 Einheit über die bündige Kante hinaus
      const cant = r() < 0.3 ? 1 : 0;
      const b: Box = {
        x: host.x + insX - (flushX && cant ? 1 : 0), y: host.y + insY - (flushY && cant ? 1 : 0),
        z: host.z + host.h, w: w + (flushX && cant ? 1 : 0), d: d + (flushY && cant ? 1 : 0),
        h: irand(r, 1, 3),
      };
      if (b.w <= host.w + 1 && b.d <= host.d + 1 && free(b)) { boxes.push(b); break; }
    }
  }

  // 4 · Turm / Kamin: schlank, an einer Ecke
  if (r() < 0.55) {
    const top = Math.max(...boxes.map((b) => b.z + b.h));
    for (let tries = 0; tries < 10; tries++) {
      const host = pick(r, boxes);
      const b: Box = {
        x: r() < 0.5 ? host.x : host.x + host.w - 1,
        y: r() < 0.5 ? host.y : host.y + host.d - 1,
        z: host.z + host.h, w: 1, d: 1, h: irand(r, 1, top - host.z - host.h + 2),
      };
      if (free(b)) { boxes.push(b); break; }
    }
  }

  // 5 · Satteldach auf einem Volumen, auf dem nichts steht
  if (r() < 0.6) {
    const roofable = boxes.filter((b) => b.w >= 2 && b.d >= 2 && !boxes.some((o) => o !== b && o.z === b.z + b.h && overlapsXY(o, b)));
    if (roofable.length) {
      const b = pick(r, roofable);
      const axis: 0 | 1 = b.w >= b.d ? 0 : 1;
      gables.push({ x: b.x, y: b.y, z: b.z + b.h, w: b.w, d: b.d, ridge: 0.6 + r() * 0.7, axis });
    }
  }

  return { boxes, gables };
}

/* ───────────────────────── wireframe → graph ───────────────────────── */

function segmentsOf(boxes: Box[], gables: Gable[]): Seg[] {
  const segs: Seg[] = [];
  for (const b of boxes) {
    const x0 = b.x, x1 = b.x + b.w, y0 = b.y, y1 = b.y + b.d, z0 = b.z, z1 = b.z + b.h;
    for (const z of [z0, z1]) {
      segs.push([[x0, y0, z], [x1, y0, z]], [[x0, y1, z], [x1, y1, z]]);
      segs.push([[x0, y0, z], [x0, y1, z]], [[x1, y0, z], [x1, y1, z]]);
    }
    for (const x of [x0, x1]) for (const y of [y0, y1]) segs.push([[x, y, z0], [x, y, z1]]);
  }
  for (const g of gables) {
    const zt = g.z + g.ridge;
    if (g.axis === 0) {
      const ym = g.y + g.d / 2;
      segs.push([[g.x, ym, zt], [g.x + g.w, ym, zt]]);
      for (const x of [g.x, g.x + g.w]) for (const y of [g.y, g.y + g.d]) segs.push([[x, y, g.z], [x, ym, zt]]);
    } else {
      const xm = g.x + g.w / 2;
      segs.push([[xm, g.y, zt], [xm, g.y + g.d, zt]]);
      for (const y of [g.y, g.y + g.d]) for (const x of [g.x, g.x + g.w]) segs.push([[x, y, g.z], [xm, y, zt]]);
    }
  }
  return segs;
}

type Graph = {
  pos: V3[];
  edges: { a: number; b: number; len: number }[];
  adj: number[][]; // vertex → edge ids
};

const q = (v: number) => Math.round(v * 1000) / 1000;
const key = (p: V3) => `${q(p[0])},${q(p[1])},${q(p[2])}`;
const dist3 = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Merge collinear overlaps, split at every vertex that lies on a line. */
function buildGraph(segs: Seg[]): Graph {
  const idx = new Map<string, number>();
  const pos: V3[] = [];
  const vid = (p: V3) => {
    const k = key(p);
    let i = idx.get(k);
    if (i === undefined) { i = pos.length; idx.set(k, i); pos.push([q(p[0]), q(p[1]), q(p[2])]); }
    return i;
  };
  for (const [a, b] of segs) { vid(a); vid(b); }

  const edgeSet = new Set<string>();
  const edges: Graph["edges"] = [];
  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (edgeSet.has(k)) return;
    edgeSet.add(k);
    edges.push({ a, b, len: dist3(pos[a], pos[b]) });
  };

  // group axis-aligned segments by line
  const lines = new Map<string, { axis: number; ivs: [number, number][] }>();
  for (const [a, b] of segs) {
    const diff = [0, 1, 2].filter((i) => q(a[i]) !== q(b[i]));
    if (diff.length !== 1) { addEdge(vid(a), vid(b)); continue; } // sloped roof edge
    const axis = diff[0];
    const fixed = [0, 1, 2].filter((i) => i !== axis).map((i) => q(a[i]));
    const k = `${axis}|${fixed.join(",")}`;
    const l = lines.get(k) ?? { axis, ivs: [] };
    l.ivs.push([Math.min(a[axis], b[axis]), Math.max(a[axis], b[axis])]);
    lines.set(k, l);
  }
  for (const [k, l] of lines) {
    const fixedAxes = [0, 1, 2].filter((i) => i !== l.axis);
    const fixed = k.split("|")[1].split(",").map(Number);
    // union of intervals
    l.ivs.sort((p, s) => p[0] - s[0]);
    const union: [number, number][] = [];
    for (const iv of l.ivs) {
      const last = union[union.length - 1];
      if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);
      else union.push([iv[0], iv[1]]);
    }
    // all vertices on this line inside the union
    const on: number[] = [];
    for (let i = 0; i < pos.length; i++) {
      const p = pos[i];
      if (q(p[fixedAxes[0]]) !== fixed[0] || q(p[fixedAxes[1]]) !== fixed[1]) continue;
      const t = p[l.axis];
      if (union.some(([s, e]) => t >= s - 1e-6 && t <= e + 1e-6)) on.push(i);
    }
    on.sort((i, j) => pos[i][l.axis] - pos[j][l.axis]);
    for (let i = 0; i + 1 < on.length; i++) {
      const m = (pos[on[i]][l.axis] + pos[on[i + 1]][l.axis]) / 2;
      if (union.some(([s, e]) => m > s && m < e)) addEdge(on[i], on[i + 1]);
    }
  }

  const adj: number[][] = pos.map(() => []);
  edges.forEach((e, i) => { adj[e.a].push(i); adj[e.b].push(i); });
  return { pos, edges, adj };
}

function connected(g: Graph) {
  const seen = new Uint8Array(g.pos.length);
  const stack = [0];
  seen[0] = 1;
  let n = 1;
  while (stack.length) {
    const v = stack.pop()!;
    for (const ei of g.adj[v]) {
      const e = g.edges[ei];
      const u = e.a === v ? e.b : e.a;
      if (!seen[u]) { seen[u] = 1; n++; stack.push(u); }
    }
  }
  return n === g.pos.length;
}

/* ───────────────────────── Eulerian trail ───────────────────────── */

function dijkstra(g: Graph, src: number) {
  const n = g.pos.length;
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const done = new Uint8Array(n);
  dist[src] = 0;
  for (;;) {
    let v = -1, best = Infinity;
    for (let i = 0; i < n; i++) if (!done[i] && dist[i] < best) { best = dist[i]; v = i; }
    if (v < 0) break;
    done[v] = 1;
    for (const ei of g.adj[v]) {
      const e = g.edges[ei];
      const u = e.a === v ? e.b : e.a;
      const nd = dist[v] + e.len;
      if (nd < dist[u]) { dist[u] = nd; prev[u] = ei; }
    }
  }
  return { dist, prev };
}

/**
 * Returns the vertex sequence of an Eulerian trail over `g`, duplicating
 * the fewest (greedily shortest) edge paths needed. Open trail when possible.
 */
function eulerTrail(g: Graph, preferStart: (v: number) => number): number[] {
  const deg = g.pos.map((_, v) => g.adj[v].length);
  const odd = deg.map((d, v) => (d % 2 ? v : -1)).filter((v) => v >= 0);

  // multigraph copy
  const edges = g.edges.map((e) => ({ a: e.a, b: e.b }));
  const adj = g.adj.map((l) => l.slice());
  const addDup = (a: number, b: number) => {
    const id = edges.length;
    edges.push({ a, b });
    adj[a].push(id); adj[b].push(id);
  };

  let start = -1;
  if (odd.length) {
    const sp = new Map<number, ReturnType<typeof dijkstra>>();
    for (const v of odd) sp.set(v, dijkstra(g, v));
    const left = new Set(odd);
    // greedy: pair closest first; the farthest pair stays open as start/end
    while (left.size > 2) {
      let bu = -1, bv = -1, bd = Infinity;
      for (const u of left) for (const v of left) {
        if (u >= v) continue;
        const d = sp.get(u)!.dist[v];
        if (d < bd) { bd = d; bu = u; bv = v; }
      }
      const { prev } = sp.get(bu)!;
      let v = bv;
      while (v !== bu) { const e = g.edges[prev[v]]; addDup(e.a, e.b); v = e.a === v ? e.b : e.a; }
      left.delete(bu); left.delete(bv);
    }
    const [u, v] = [...left];
    start = preferStart(u) <= preferStart(v) ? u : v;
  } else {
    start = g.pos.map((_, v) => v).sort((a, b) => preferStart(a) - preferStart(b))[0];
  }

  // Hierholzer (iterative)
  const used = new Uint8Array(edges.length);
  const ptr = new Int32Array(adj.length);
  const stack = [start];
  const trail: number[] = [];
  while (stack.length) {
    const v = stack[stack.length - 1];
    while (ptr[v] < adj[v].length && used[adj[v][ptr[v]]]) ptr[v]++;
    if (ptr[v] === adj[v].length) { trail.push(v); stack.pop(); continue; }
    const ei = adj[v][ptr[v]];
    used[ei] = 1;
    const e = edges[ei];
    stack.push(e.a === v ? e.b : e.a);
  }
  trail.reverse();
  return trail;
}

/* ───────────────────────── hidden lines ───────────────────────── */

type Half = { n: V3; d: number }; // inside ⇔ n·p ≤ d
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function boxHalves(b: Box): Half[] {
  return [
    { n: [-1, 0, 0], d: -b.x }, { n: [1, 0, 0], d: b.x + b.w },
    { n: [0, -1, 0], d: -b.y }, { n: [0, 1, 0], d: b.y + b.d },
    { n: [0, 0, -1], d: -b.z }, { n: [0, 0, 1], d: b.z + b.h },
  ];
}

function gableHalves(g: Gable): Half[] {
  const rise = g.ridge;
  const hs: Half[] = [{ n: [0, 0, -1], d: -g.z }];
  if (g.axis === 0) {
    const half = g.d / 2;
    hs.push({ n: [-1, 0, 0], d: -g.x }, { n: [1, 0, 0], d: g.x + g.w });
    hs.push({ n: [0, -rise, half], d: -rise * g.y + half * g.z });          // y0 slope
    hs.push({ n: [0, rise, half], d: rise * (g.y + g.d) + half * g.z });    // y1 slope
  } else {
    const half = g.w / 2;
    hs.push({ n: [0, -1, 0], d: -g.y }, { n: [0, 1, 0], d: g.y + g.d });
    hs.push({ n: [-rise, 0, half], d: -rise * g.x + half * g.z });
    hs.push({ n: [rise, 0, half], d: rise * (g.x + g.w) + half * g.z });
  }
  return hs;
}

/** Is p hidden behind any convex occluder when looking along -dir (dir points to the viewer)? */
function occluded(p: V3, dir: V3, occluders: Half[][]): boolean {
  for (const hs of occluders) {
    let tE = 0, tX = Infinity, miss = false;
    for (const h of hs) {
      const np = dot3(h.n, p) - h.d;
      const nd = dot3(h.n, dir);
      if (Math.abs(nd) < 1e-9) { if (np > -1e-9) { miss = true; break; } continue; }
      const t = -np / nd;
      if (nd < 0) tE = Math.max(tE, t); else tX = Math.min(tX, t);
      if (tX - tE <= 1e-6) { miss = true; break; }
    }
    if (!miss) return true;
  }
  return false;
}

/* ───────────────────────── building ───────────────────────── */

export type Building = {
  pts: V3[];          // trail vertices in 3D
  cum: number[];      // cumulative 3D length at each vertex
  length: number;
  yaw: number;
  pitch: number;
  bounds: { min: V3; max: V3 };
  /** [s0, s1, hidden] runs along the trail, in cumulative-length space. */
  runs: [number, number, boolean][];
  /** Ground dots (world x,y) that are not hidden behind the building. */
  dots: [number, number][];
};

export function makeBuilding(seed: number): Building {
  for (let attempt = 0; attempt < 24; attempt++) {
    const r = mulberry32(seed + attempt * 7919);
    const { boxes, gables } = generateMassing(r);
    const g = buildGraph(segmentsOf(boxes, gables));
    if (!connected(g) || g.edges.length < 12) continue;

    const yaw = (22 + r() * 46) * (Math.PI / 180) * (r() < 0.5 ? 1 : -1);
    const pitch = (30 + r() * 12) * (Math.PI / 180);
    const proj = (p: V3) => project(p, yaw, pitch);
    // start at the ground, as far front as possible
    const preferStart = (v: number) => g.pos[v][2] * 100 - proj(g.pos[v])[1];
    const trail = eulerTrail(g, preferStart);
    const pts = trail.map((v) => g.pos[v]);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist3(pts[i - 1], pts[i]));

    const min: V3 = [Infinity, Infinity, Infinity], max: V3 = [-Infinity, -Infinity, -Infinity];
    for (const p of g.pos) for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], p[i]); max[i] = Math.max(max[i], p[i]); }

    // hidden-line classification: sample the trail, test each sample against every volume
    const toViewer: V3 = [Math.sin(yaw) * Math.cos(pitch), Math.cos(yaw) * Math.cos(pitch), Math.sin(pitch)];
    const occluders = [...boxes.map(boxHalves), ...gables.map(gableHalves)];
    const runs: [number, number, boolean][] = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], len = cum[i] - cum[i - 1];
      const n = Math.max(2, Math.ceil(len * 24));
      let runStart = cum[i - 1], hid = false;
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        const p: V3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        const h = occluded(p, toViewer, occluders);
        if (k === 0) hid = h;
        else if (h !== hid) {
          const s = cum[i - 1] + (k / n) * len;
          runs.push([runStart, s, hid]); runStart = s; hid = h;
        }
      }
      const last = runs[runs.length - 1];
      if (last && last[2] === hid && Math.abs(last[1] - runStart) < 1e-9) last[1] = cum[i];
      else runs.push([runStart, cum[i], hid]);
    }

    const dots: [number, number][] = [];
    for (let x = Math.floor(min[0]) - 4; x <= Math.ceil(max[0]) + 4; x++)
      for (let y = Math.floor(min[1]) - 4; y <= Math.ceil(max[1]) + 4; y++)
        if (!occluded([x, y, 0], toViewer, occluders)) dots.push([x, y]);

    return { pts, cum, length: cum[cum.length - 1], yaw, pitch, bounds: { min, max }, runs, dots };
  }
  // unreachable in practice; a bare box is always valid
  return makeBuilding(seed + 1);
}

/** Orthographic axonometric projection → [X, Y] in world-unit screen space (Y down). */
function project(p: V3, yaw: number, pitch: number): [number, number] {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const x = p[0] * c - p[1] * s;
  const y = p[0] * s + p[1] * c;
  return [x, y * Math.sin(pitch) - p[2] * Math.cos(pitch)];
}

/* ───────────────────────── animation ───────────────────────── */

type Phase = "travel" | "draw" | "hold" | "retract" | "rest";

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeIn = (t: number) => t * t * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
/** Plotter velocity: accelerate over e1, cruise, decelerate over e2. */
function trapezoid(u: number, e1 = 0.1, e2 = 0.08) {
  const v = 1 / (1 - (e1 + e2) / 2);
  if (u < e1) return (v * u * u) / (2 * e1);
  if (u < 1 - e2) return v * (e1 / 2 + (u - e1));
  return 1 - (v * (1 - u) * (1 - u)) / (2 * e2);
}

export function createOneLine(ctx: CanvasRenderingContext2D, opts: OneLineOptions) {
  const ink = opts.ink;
  const seed = (opts.seed ?? Math.floor(Math.random() * 1e9)) >>> 0;
  let W = 0, H = 0;

  let bld = makeBuilding(seed);
  let fit = { scale: 1, ox: 0, oy: 0 };
  let phase: Phase = "draw";
  let phaseT = 0;
  let drawDur = 6;
  let last = -1;
  let count = 0;

  let px = 0, py = 0;          // smoothed pointer
  let travelFrom: [number, number] | null = null;

  const durationFor = () => Math.max(4, Math.min(8.5, (bld.length * fit.scale) / 560));

  function computeFit() {
    if (!W || !H) return;
    const { min, max } = bld.bounds;
    let xs = Infinity, xe = -Infinity, ys = Infinity, ye = -Infinity;
    for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) {
      const [X, Y] = project([x, y, z], bld.yaw, bld.pitch);
      xs = Math.min(xs, X); xe = Math.max(xe, X); ys = Math.min(ys, Y); ye = Math.max(ye, Y);
    }
    const padX = W * 0.12, padY = H * 0.09;
    const scale = Math.min((W - 2 * padX) / (xe - xs), (H - 2 * padY) / (ye - ys), Math.min(W, H) * 0.26);
    fit = {
      scale,
      ox: W / 2 - ((xs + xe) / 2) * scale,
      oy: H / 2 - ((ys + ye) / 2) * scale + H * 0.02,
    };
    if (phase !== "draw" || phaseT === 0) drawDur = durationFor();
  }

  let now = 0;
  function toScreen(p: V3): [number, number] {
    const breath = Math.sin(now * 0.45) * 0.018;
    const yaw = bld.yaw + px * 0.07 + breath, pitch = bld.pitch + py * 0.04;
    const [X, Y] = project(p, yaw, pitch);
    return [fit.ox + X * fit.scale, fit.oy + Y * fit.scale];
  }

  function pointAt(s: number): V3 {
    const { pts, cum } = bld;
    if (s <= 0) return pts[0];
    if (s >= bld.length) return pts[pts.length - 1];
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
    const t = (s - cum[lo]) / Math.max(1e-9, cum[hi] - cum[lo]);
    const a = pts[lo], b = pts[hi];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  /** Stroke the trail between s0 and s1; visible and hidden runs in separate passes. */
  function strokePath(s0: number, s1: number, width: number, aVis: number, aHid: number) {
    if (s1 - s0 <= 1e-6) return;
    const { pts, cum, runs } = bld;
    const passes: [boolean, number, number][] = [[false, aVis, width], [true, aHid, width * 0.85]];
    for (const [hidden, alpha, w] of passes) {
      ctx.beginPath();
      let any = false;
      for (const [r0, r1, h] of runs) {
        if (h !== hidden || r1 <= s0 || r0 >= s1) continue;
        const a = Math.max(r0, s0), b = Math.min(r1, s1);
        if (b - a <= 1e-6) continue;
        any = true;
        const pa = toScreen(pointAt(a));
        ctx.moveTo(pa[0], pa[1]);
        for (let i = 0; i < pts.length; i++) {
          if (cum[i] <= a) continue;
          if (cum[i] >= b) break;
          const p = toScreen(pts[i]);
          ctx.lineTo(p[0], p[1]);
        }
        const pb = toScreen(pointAt(b));
        ctx.lineTo(pb[0], pb[1]);
      }
      if (!any) continue;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = w;
      ctx.strokeStyle = ink.paper;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /** A small mark at every vertex the pen has passed: Punkte, aus denen Linien werden. */
  function drawVertices(s0: number, s1: number) {
    const { pts, cum } = bld;
    ctx.fillStyle = ink.paper;
    for (let i = 0; i < pts.length; i++) {
      if (cum[i] < s0 || cum[i] > s1) continue;
      const hid = hiddenAt(cum[i] + (i + 1 < pts.length ? 1e-4 : -1e-4));
      const [X, Y] = toScreen(pts[i]);
      ctx.globalAlpha = hid ? 0.35 : 0.88;
      ctx.beginPath(); ctx.arc(X, Y, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function hiddenAt(sPos: number) {
    for (const [r0, r1, h] of bld.runs) if (sPos >= r0 && sPos <= r1) return h;
    return false;
  }

  function drawGround() {
    const step = fit.scale < 18 ? 2 : 1;
    const cx = (bld.bounds.min[0] + bld.bounds.max[0]) / 2;
    const cy = (bld.bounds.min[1] + bld.bounds.max[1]) / 2;
    const reach = Math.max(bld.bounds.max[0] - bld.bounds.min[0], bld.bounds.max[1] - bld.bounds.min[1]) / 2 + 3;
    ctx.fillStyle = ink.paper;
    for (const [x, y] of bld.dots) {
      if (step === 2 && ((x + y) & 1)) continue;
      const d = Math.hypot(x - cx, y - cy) / reach;
      const a = 0.34 * Math.exp(-d * d * 1.5);
      if (a < 0.015) continue;
      const [X, Y] = toScreen([x, y, 0]);
      if (X < -2 || Y < -2 || X > W + 2 || Y > H + 2) continue;
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(X, Y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawHead(x: number, y: number, pulse: number, behind: boolean) {
    const r = 3.6 + pulse * 1.2;
    if (behind) ctx.globalAlpha = 0.45;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 18);
    g.addColorStop(0, ink.accent);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = (0.28 + pulse * 0.1) * (behind ? 0.45 : 1);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = behind ? 0.5 : 1;
    ctx.fillStyle = ink.accent;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function nextBuilding() {
    travelFrom = toScreen(bld.pts[bld.pts.length - 1]);
    count++;
    bld = makeBuilding(seed + count * 104729);
    phase = "travel";
    phaseT = 0;
    computeFit();
  }

  function advance(dt: number) {
    phaseT += dt;
    const dur: Record<Phase, number> = { travel: 0.75, draw: drawDur, hold: 2.6, retract: drawDur * 0.36, rest: 0.55 };
    while (phaseT >= dur[phase]) {
      phaseT -= dur[phase];
      if (phase === "travel") phase = "draw";
      else if (phase === "draw") phase = "hold";
      else if (phase === "hold") phase = "retract";
      else if (phase === "retract") phase = "rest";
      else { nextBuilding(); return; }
    }
  }

  function render(t: number) {
    now = t;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = ink.ground;
    ctx.fillRect(0, 0, W, H);
    if (!W || !H) return;

    // pointer parallax (smoothed)
    const p = opts.pointer?.() ?? null;
    const tx = p ? p.x : 0, ty = p ? p.y : 0;
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;

    drawGround();

    const L = bld.length;
    let head = 0, tail = 0, pulse = 0;
    let headXY: [number, number];

    if (opts.still) {
      head = L; tail = 0;
      headXY = toScreen(bld.pts[bld.pts.length - 1]);
    } else if (phase === "travel") {
      const k = ease(clamp01(phaseT / 0.75));
      const to = toScreen(bld.pts[0]);
      const from = travelFrom ?? to;
      headXY = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
      head = tail = 0;
    } else if (phase === "draw") {
      head = trapezoid(clamp01(phaseT / drawDur)) * L; tail = 0;
      headXY = toScreen(pointAt(head));
    } else if (phase === "hold") {
      head = L; tail = 0;
      pulse = 0.5 + 0.5 * Math.sin(t * 2.6);
      headXY = toScreen(bld.pts[bld.pts.length - 1]);
    } else if (phase === "retract") {
      head = L;
      tail = easeIn(clamp01(phaseT / (drawDur * 0.36))) * L;
      headXY = toScreen(bld.pts[bld.pts.length - 1]);
    } else {
      head = tail = L;
      headXY = toScreen(bld.pts[bld.pts.length - 1]);
    }

    if (head > tail) {
      strokePath(tail, head, 1.15, 0.84, 0.3);
      // fresh ink: the last stretch behind the pen is brighter
      const fresh = Math.min(head - tail, 150 / fit.scale);
      if (phase === "draw") strokePath(head - fresh, head, 1.5, 1, 0.5);
      drawVertices(tail, head);
    }
    drawHead(headXY[0], headXY[1], pulse, phase === "draw" && head > 0 && head < L && hiddenAt(head));
  }

  return {
    resize(w: number, h: number) {
      W = w; H = h;
      computeFit();
    },
    draw(t: number) {
      if (!opts.still) {
        const dt = last < 0 ? 0 : Math.min(0.1, Math.max(0, t - last));
        last = t;
        advance(dt);
      }
      render(t);
    },
    destroy() {},
  };
}
