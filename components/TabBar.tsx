"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TABS, branchForPath, type Branch } from "@/lib/branches";

/**
 * Segmented tab bar — three equal-thirds, each filled with its branch's motto
 * colour. Tall on the home page, "reclines" to a compact strip on a branch.
 * The active branch's tab shares the page colour, so it reads as connected to
 * the page. Clicking fires the colour-flood from the click point.
 */
export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const active = branchForPath(pathname);
  // "reclined" compact bar everywhere except the landing
  const isHome = pathname === "/";

  const onTab = (e: MouseEvent, b: Branch) => {
    e.preventDefault();
    if (pathname === b.path) return;
    window.dispatchEvent(
      new CustomEvent("nk:reveal", {
        detail: { x: e.clientX, y: e.clientY, color: b.bg, branch: b.key },
      }),
    );
    router.push(b.path);
  };

  return (
    <div
      className={`nk-tabbar ${isHome ? "nk-tabbar--home" : "nk-tabbar--branch"}`}
      role="tablist"
    >
      {TABS.map((b) => (
        <a
          key={b.key}
          href={b.path}
          role="tab"
          aria-selected={active === b.key}
          onClick={(e) => onTab(e, b)}
          className={`nk-tab2 ${active === b.key ? "nk-tab2--active" : ""}`}
          style={{ "--tab": b.bg } as CSSProperties}
        >
          <span className="nk-tab2__label">
            nokta.{b.label}
            <span className="nk-tab2__dot">.</span>
          </span>
          <span className="nk-tab2__tag">{b.tagline}</span>
        </a>
      ))}
    </div>
  );
}
