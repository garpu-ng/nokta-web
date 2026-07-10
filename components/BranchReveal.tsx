"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { branchForPath, type BranchKey } from "@/lib/branches";
import styles from "./BranchReveal.module.css";

export type RevealDetail = {
  x: number;
  y: number;
  color: string;
  branch: BranchKey;
};

function applyBranch(branch: BranchKey | null) {
  const root = document.documentElement;
  if (branch) root.dataset.branch = branch;
  else delete root.dataset.branch;
}

/**
 * Owns the page's branch theme. Two paths in:
 *  - Tab click → a "nk:reveal" event floods the branch colour out in a circle
 *    from the tab, then commits the theme. The overlay sits below the top bar
 *    and left nav (higher z-index), so the wash never touches the chrome.
 *  - Any other navigation (logo, back button, direct load) → theme applied
 *    instantly.
 */
export default function BranchReveal() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const revealing = useRef(false);

  useEffect(() => {
    // Snap exactly to the top on every navigation (instant, bypassing the CSS
    // smooth-scroll). A second snap next frame catches any post-layout shift
    // (e.g. the arch grid's lazy images) so it always lands fully at the top.
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      html.style.scrollBehavior = prev;
    });

    // Non-reveal navigations (the reveal handles its own commit).
    if (revealing.current) return;
    applyBranch(branchForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const onReveal = (e: Event) => {
      const { x, y, color, branch } = (e as CustomEvent<RevealDetail>).detail;
      const ov = overlayRef.current;
      // No animation surface, or the visitor prefers reduced motion → skip the
      // circular clip-path flood and commit the theme instantly (same fallback).
      const reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!ov || typeof ov.animate !== "function" || reduceMotion) {
        applyBranch(branch);
        return;
      }
      revealing.current = true;
      ov.style.background = color;
      ov.style.display = "block";

      const w = window.innerWidth;
      const h = window.innerHeight;
      const r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

      const anim = ov.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${Math.ceil(r)}px at ${x}px ${y}px)` },
        ],
        { duration: 620, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
      );

      anim.onfinish = () => {
        applyBranch(branch); // commit the real page background
        ov.style.display = "none";
        revealing.current = false;
      };
    };

    window.addEventListener("nk:reveal", onReveal);
    return () => window.removeEventListener("nk:reveal", onReveal);
  }, []);

  return <div ref={overlayRef} className={styles.reveal} aria-hidden="true" />;
}
