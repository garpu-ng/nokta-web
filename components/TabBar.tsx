"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TABS, branchForPath, type Branch } from "@/lib/branches";
import styles from "./TabBar.module.css";

/**
 * Segmented tab bar — three equal-thirds, all black. Each branch tab carries its
 * motto colour only as a small animated dot (right-aligned), a muted stand-in
 * for the old solid-colour fill. Tall on the home page, "reclines" to a compact
 * strip on a branch. Clicking fires the page colour-flood from the click point.
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
    window.dispatchEvent(
      new CustomEvent("nk:reveal", {
        detail: { x: e.clientX, y: e.clientY, color: b.bg, branch: b.key },
      }),
    );
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
          {b.dot && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={b.dot} alt="" aria-hidden="true" className={styles.tabDot} />
          )}
        </a>
      ))}
    </div>
  );
}
