"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TABS, branchForPath, type Branch } from "@/lib/branches";
import styles from "./TabBar.module.css";

/**
 * Segmented tab bar — four equal tabs, all black. The branch's motto colour lives
 * in the tab's *text* (label, its trailing "." and the tagline). The active tab
 * (you're on its page) fills with that motto colour and its text fades to paper
 * so it stays legible on the fill, reconnecting to the flooded page. Tall on the
 * home page, "reclines" to a compact strip on a branch. Clicking fires the page
 * colour-flood from the click point.
 */
export default function TabBar({
  taglines,
  navLabel,
}: {
  taglines: Record<string, string>;
  navLabel: string;
}) {
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
    // Site navigation, not an ARIA tablist: these are links to standalone pages
    // (no tab panels, no arrow-key roving). A <nav> landmark with aria-current on
    // the active link is the honest semantics.
    <nav
      className={`${styles.tabbar} ${isHome ? styles.home : styles.branch}`}
      aria-label={navLabel}
    >
      {TABS.map((b) => (
        <a
          key={b.key}
          href={b.path}
          aria-current={active === b.key ? "page" : undefined}
          onClick={(e) => onTab(e, b)}
          className={`${styles.tab2}${active === b.key ? " " + styles.active : ""}`}
          // --tab is the motto colour: the tab's text colour when inactive, its
          // background fill when active. home's motto is black (= tab bg), so
          // motto text would vanish — data-home pins that tab's text to paper.
          style={{ "--tab": b.bg } as CSSProperties}
          data-home={b.key === "home" ? "true" : undefined}
        >
          <span className={styles.label}>
            nokta.{b.label}
            <span className={styles.dot}>.</span>
          </span>
          <span className={styles.tag}>{taglines[b.key] ?? b.tagline}</span>
        </a>
      ))}
    </nav>
  );
}
