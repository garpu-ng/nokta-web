/**
 * mountOneLine — attaches the engine to a <canvas>: DPR-aware sizing,
 * ResizeObserver, pause when off-screen or hidden, reduced-motion → still frame,
 * pointer parallax. Mirrors the site's existing canvas-plate lifecycle.
 */
import { createOneLine, type Ink } from "./engine";

export function plateInk(el: HTMLElement): Ink {
  const s = getComputedStyle(el);
  return {
    paper: s.getPropertyValue("--nk-field-ink").trim() || "#e9e0ce",
    accent: s.getPropertyValue("--nk-field-mark").trim() || "#b83636",
    ground: s.getPropertyValue("--nk-field-ground").trim() || "#1f1f1c",
  };
}

export function mountOneLine(canvas: HTMLCanvasElement, seed?: number): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let pointer: { x: number; y: number } | null = null;
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    // parallax responds to the pointer anywhere on the page, weighted toward the plate
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    pointer = { x: Math.max(-1.5, Math.min(1.5, x)), y: Math.max(-1.5, Math.min(1.5, y)) };
  };
  const onLeave = () => { pointer = null; };
  if (fine && !reduced) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
  }

  const plate = createOneLine(ctx, { ink: plateInk(canvas), seed, still: reduced, pointer: () => pointer });

  let cssW = 0, cssH = 0, dpr = 0;
  let running = false, raf = 0, t0 = performance.now(), paused = 0;

  const layout = (force = false) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const cap = parseFloat(getComputedStyle(canvas).getPropertyValue("--nk-field-dpr"));
    const p = Math.min(window.devicePixelRatio || 1, Number.isFinite(cap) && cap > 0 ? cap : 2);
    if (force || r.width !== cssW || r.height !== cssH || p !== dpr) {
      cssW = r.width; cssH = r.height; dpr = p;
      canvas.width = Math.round(cssW * p);
      canvas.height = Math.round(cssH * p);
      ctx.setTransform(p, 0, 0, p, 0, 0);
      plate.resize(cssW, cssH);
      if (!running) plate.draw(reduced ? 0 : paused);
    }
  };
  const frame = (now: number) => { plate.draw((now - t0) / 1000); raf = requestAnimationFrame(frame); };
  const start = () => { if (running || reduced) return; running = true; t0 = performance.now() - paused * 1000; raf = requestAnimationFrame(frame); };
  const stop = () => { if (!running) return; running = false; paused = (performance.now() - t0) / 1000; cancelAnimationFrame(raf); };

  layout();
  const ro = new ResizeObserver(() => layout());
  ro.observe(canvas);
  let visible = false;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) visible = e.isIntersecting;
    if (visible && !document.hidden) start();
    else stop();
  }, { threshold: 0 });
  io.observe(canvas);
  const onVis = () => {
    if (!document.hidden && visible) start();
    else stop();
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    stop(); ro.disconnect(); io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    plate.destroy();
  };
}
