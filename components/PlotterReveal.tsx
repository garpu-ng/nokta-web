"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/* Shared "arrives like a plotter draws" shell for the two static artworks
   (NoktaHero's halftone mega-dot, DotField's drape). It ships the SVG exactly
   once — as server-rendered children — and does nothing but toggle two class
   hooks on a wrapper element:

     • no class       → the finished artwork. This is what SSR and the no-JS /
                        pre-JS render show, so first paint is never blank.
     • armed          → snapped to the pre-draw state, applied only once JS is
                        confirmed live (no transition, so the hide never
                        animates).
     • armed + animate → drawn in once the observer says the piece is in view.

   prefers-reduced-motion is honoured twice over: here we simply stay in the
   finished (idle) state and never arm, and each artwork's stylesheet pins the
   drawn state under the media query too. This mirrors PerspectiveGrid's
   observer / reduced-motion handling, only the default is inverted — complete,
   not hidden — so the progressive-enhancement class *adds* the hidden state
   right before animating rather than assuming it. */
export default function PlotterReveal({
  armedClassName,
  animateClassName,
  className,
  children,
}: {
  armedClassName: string;
  animateClassName: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "armed" | "drawn">("idle");

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (reduceMotion || !el || typeof IntersectionObserver === "undefined") {
      // Leave it idle: the default render is already the finished artwork.
      return;
    }
    // The SVG carries the real geometry (the wrapper may be zero-height when the
    // graphic is absolutely positioned), so observe it directly.
    const target = el.querySelector("svg") ?? el;
    let io: IntersectionObserver | null = null;
    // Deferred to the next frame (like PerspectiveGrid) so the arm isn't a
    // synchronous setState in the effect body, and so the pre-draw class lands
    // before the observer can ask us to draw — armed always precedes drawn.
    const raf = requestAnimationFrame(() => {
      // JS is live and motion is welcome: snap to the pre-draw state.
      setPhase("armed");
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setPhase("drawn");
            io?.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      io.observe(target);
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  const state =
    phase === "drawn"
      ? `${armedClassName} ${animateClassName}`
      : phase === "armed"
        ? armedClassName
        : "";
  const cls = [className, state].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={cls || undefined}>
      {children}
    </div>
  );
}
