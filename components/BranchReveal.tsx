"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { branchForPath, type BranchKey } from "@/lib/branches";

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

  // Non-reveal navigations (the reveal handles its own commit).
  useEffect(() => {
    if (revealing.current) return;
    applyBranch(branchForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const onReveal = (e: Event) => {
      const { x, y, color, branch } = (e as CustomEvent<RevealDetail>).detail;
      const ov = overlayRef.current;
      if (!ov || typeof ov.animate !== "function") {
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

  return <div ref={overlayRef} className="nk-reveal" aria-hidden="true" />;
}
