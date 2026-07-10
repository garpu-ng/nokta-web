"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TABS, branchForPath, type Branch } from "@/lib/branches";
import styles from "./TabBar.module.css";

/**
 * Segmented tab bar — three equal-thirds, each filled with its branch's motto
 * colour. Tall on the home page, "reclines" to a compact strip on a branch.
 * The active branch's tab shares the page colour, so it reads as connected to
 * the page. Clicking fires the colour-flood from the click point.
 */
export default function TabBar({
  taglines,
}: {
  taglines: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const active = branchForPath(pathname);
  // "reclined" compact bar everywhere except the landing
  const isHome = pathname === "/";

  const onTab = (e: MouseEvent, b: Branch) => {
    e.preventDefault();
    if (pathname === b.path) return;
    // TRIAL: navigate straight to the branch — the colour-flood reveal that used
    // to play from the click point is disabled. (Re-dispatch "nk:reveal" here
    // with { x, y, color: b.bg, branch: b.key } to restore the animation.)
    router.push(b.path);
  };

  return (
    <div
      className={`${styles.tabbar} ${isHome ? styles.home : styles.branch}`}
      role="tablist"
    >
      {TABS.map((b) => (
        <a
          key={b.key}
          href={b.path}
          role="tab"
          aria-selected={active === b.key}
          onClick={(e) => onTab(e, b)}
          className={styles.tab2}
          style={{ "--tab": b.bg } as CSSProperties}
        >
          <span className={styles.label}>
            nokta.{b.label}
            <span className={styles.dot}>.</span>
          </span>
          <span className={styles.tag}>{taglines[b.key] ?? b.tagline}</span>
        </a>
      ))}
    </div>
  );
}
