"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import { ALL_TAB_COLOR, TAB_COLORS } from "@/lib/colors";
import type { WorkKind } from "@/lib/works";
import WorkCard, { type WallItem } from "./WorkCard";
import styles from "./WorkWall.module.css";

/* The wall: one body of work, one grid, in the curated order. The kinds are
   stamps and a filter — never sections, never headings. Filtering only hides
   cards (display:none), so the images stay decoded and the order never shifts;
   with the initial state "all", the full wall renders server-side and the
   filter row is simply inert without JS.

   The filter wears the old site's tab dress: a segmented black bar, each tab's
   label in its own motto colour, the pressed tab filling with it. The six
   colours live in lib/colors.ts (the card's kind stamp borrows its own on
   hover); they colour the filter and that one word, never a page.

   The cards enter through the shared Reveal primitive, staggered left-then-
   right so a row lands as a pair rather than a block. */

export default function WorkWall({
  items,
  kinds,
  allLabel,
  listLabel,
}: {
  items: WallItem[];
  /** the kinds present on the wall, in wall order, with their translated stamps */
  kinds: { kind: WorkKind; label: string }[];
  allLabel: string;
  listLabel: string;
}) {
  const [active, setActive] = useState<WorkKind | null>(null);

  return (
    <>
      <div className={styles.filter}>
        <button
          type="button"
          className={styles.stamp}
          style={{ "--tab": ALL_TAB_COLOR } as React.CSSProperties}
          data-home=""
          aria-pressed={active === null}
          onClick={() => setActive(null)}
        >
          {allLabel}
        </button>
        {kinds.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            className={styles.stamp}
            style={{ "--tab": TAB_COLORS[kind] } as React.CSSProperties}
            aria-pressed={active === kind}
            onClick={() => setActive(kind)}
          >
            {label}
          </button>
        ))}
      </div>

      <ul
        className={`${styles.grid}${active ? ` ${styles.aligned}` : ""}`}
        aria-label={listLabel}
      >
        {items.map((item, i) => (
          <li
            key={item.slug}
            className={`${styles.cell} ${styles[`span${item.span}`]}${
              active && item.kind !== active ? ` ${styles.filteredOut}` : ""
            }`}
            style={{ "--lift": `${item.lift}rem` } as React.CSSProperties}
          >
            {/* The wall reads two-up, so the stagger alternates: the left sheet
                is pinned, then the right one a beat later. */}
            <Reveal delay={(i % 2) * 90}>
              <WorkCard item={item} />
            </Reveal>
          </li>
        ))}
      </ul>
    </>
  );
}
