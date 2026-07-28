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
    four times the fill rate it needs to look identical.

    A plate may lower it further by declaring `--nk-field-dpr` on its canvas —
    for anything shown faint, at low opacity or behind other content, where a
    retina backing store buys nothing and costs four times the fill rate to
    have. Expressed in CSS rather than as a prop because it is a presentational
    decision, and because it then applies to whichever plate is placed there
    without any of them knowing. */
const MAX_DPR = 2;

export type Plate = {
  /** Rebuild anything that depends on the box's size. Width and height are
      CSS pixels; `dpr` is the backing store's ratio, which a plate needs only
      if it cuts a mask that will be composited at device resolution. */
  resize?: (width: number, height: number, dpr: number) => void;
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
    const asked = parseFloat(
      getComputedStyle(canvas).getPropertyValue("--nk-field-dpr"),
    );
    const cap = Number.isFinite(asked) && asked > 0 ? asked : MAX_DPR;
    const dpr = Math.min(window.devicePixelRatio || 1, cap);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    // Everything downstream draws in CSS pixels; the transform carries the
    // device ratio, so no renderer ever has to think about it.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    plate.resize?.(width, height, dpr);
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

  /* A plate that sets type may have measured it in the fallback face. Once the
     real one is in, measure and cut again. Every plate gets this for free
     because it arrives as a resize, which is the one thing they all handle. */
  let dead = false;
  if (typeof document.fonts?.ready?.then === "function") {
    document.fonts.ready.then(() => {
      if (!dead) resize();
    });
  }

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
    dead = true;
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
    colour be lifted off the ink without going translucent.

    Returns #rrggbb, and takes it — so a mix can be mixed again, which is the
    whole point of having a ramp per colour per depth. It used to hand back
    `rgb(r,g,b)`, which every caller could draw with and no caller could feed
    back in: the hex parser read "rgb(116,131,196)" as a colour and came out
    with near-black, so a plate that lightened a hue and then shaded it drew
    the entire district in the dark. */
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
  let out = "#";
  for (let i = 0; i < 3; i++) {
    const v = Math.max(0, Math.min(255, Math.round(a[i] + (b[i] - a[i]) * amt)));
    out += v.toString(16).padStart(2, "0");
  }
  return out;
}
