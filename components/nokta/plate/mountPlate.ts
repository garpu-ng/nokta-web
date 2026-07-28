/* The plate machinery, once.

   Every generative plate on this site wants the same seven things and none of
   them are the artwork: a backing store at the device's pixel ratio, a redraw
   when the box resizes, a loop that runs ONLY while the plate is on screen and
   the tab is visible, a clock that survives being paused, a single static frame
   under prefers-reduced-motion, and a clean teardown. Written four times those
   seven things are four chances to get one of them wrong.

   So they live here, and a plate is reduced to what actually distinguishes it:
   a `resize(w, h)` to rebuild whatever it caches, and a `draw(t)` that paints
   one frame at time t in CSS pixels. Everything else is this file's problem.

   Deliberately NOT a hook. A hook taking a deps array trips
   react-hooks/exhaustive-deps at every call site; a plain mount function
   returning its own teardown lets each component own a normal useEffect with
   the dependencies it actually has. */

/** Never rasterise more than this — a retina 4K plate would otherwise ask for
    four times the fill rate it needs to look identical. */
const MAX_DPR = 2;

export type Plate = {
  /** Rebuild anything that depends on the box's size. CSS pixels. */
  resize?: (width: number, height: number) => void;
  /** Paint one frame. `t` is seconds of plate-time, which excludes any time
      the plate spent paused off-screen. */
  draw: (t: number) => void;
};

/**
 * Give a canvas a life. Returns the teardown.
 *
 * `make` runs once, inside the effect, with a context already scaled to the
 * device ratio — so it is the right place to read computed styles, allocate
 * caches and close over colours.
 */
export function mountPlate(
  canvas: HTMLCanvasElement,
  make: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => Plate,
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const plate = make(ctx, canvas);

  const still =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let raf = 0;
  let running = false;
  let start = performance.now();
  /** Seconds of plate-time already played, carried across a pause. */
  let elapsed = 0;

  const paintOnce = () =>
    plate.draw(still ? 0 : (performance.now() - start) / 1000);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    // Everything downstream draws in CSS pixels; the transform carries the
    // device ratio, so no renderer ever has to think about it.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    plate.resize?.(width, height);
    if (!running) paintOnce();
  };

  const frame = (now: number) => {
    plate.draw((now - start) / 1000);
    raf = requestAnimationFrame(frame);
  };

  const play = () => {
    if (running || still) return;
    running = true;
    // Rebase the clock so a plate that has been paused resumes where it
    // stopped instead of jumping forward by the length of the pause.
    start = performance.now() - elapsed * 1000;
    raf = requestAnimationFrame(frame);
  };

  const pause = () => {
    if (!running) return;
    running = false;
    elapsed = (performance.now() - start) / 1000;
    cancelAnimationFrame(raf);
  };

  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // On screen or not — the only question that decides whether we burn a frame
  // budget on this. Off-screen the loop is not throttled, it is stopped.
  let visible = false;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) visible = entry.isIntersecting;
      if (visible && !document.hidden) play();
      else pause();
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  const onVisibility = () => {
    if (!document.hidden && visible) play();
    else pause();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    pause();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

/** The standing field every plate on this site is drawn from: circular waves
    summed from two sources, normalised to 0..1. One equation, four pictures —
    which is what makes them a family rather than four unrelated toys. */
export function interference(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  k: number,
  t: number,
): number {
  const da = Math.hypot(x - ax, y - ay);
  const db = Math.hypot(x - bx, y - by);
  return (Math.sin(k * da - t * 1.1) + Math.sin(k * db - t * 0.9) + 2) / 4;
}

/** Blend two #rrggbb colours, `amt` of the way from `hex` toward `toward`.
    Returns an opaque colour: shading by mixing rather than by alpha is what
    lets a painter's-algorithm plate actually occlude, and what lets a line
    colour be lifted off the ink without going translucent. */
export function mix(hex: string, toward: string, amt: number): string {
  const parse = (h: string) => {
    const v = h.trim().replace("#", "");
    const n =
      v.length === 3
        ? v.split("").map((c) => parseInt(c + c, 16))
        : [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
    return n.map((x) => (Number.isFinite(x) ? x : 0));
  };
  const a = parse(hex);
  const b = parse(toward);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amt));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
