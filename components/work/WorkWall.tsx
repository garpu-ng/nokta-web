"use client";

import { useState } from "react";
import type { WorkKind } from "@/lib/works";
import WorkCard, { type WallItem } from "./WorkCard";
import styles from "./WorkWall.module.css";

/* The wall: one body of work, one grid, in the curated order. The kinds are
   stamps and a filter — never sections, never headings. Filtering only hides
   cards (display:none), so the images stay decoded and the order never shifts;
   with the initial state "all", the full wall renders server-side and the
   filter row is simply inert without JS.

   The filter wears the old site's tab dress: a segmented black bar, each tab's
   label in its own motto colour, the pressed tab filling with it. The colours
   come from the site's own history — the three branch colours plus the clay
   and slate of the earlier motto palette; "Alle" is the ink of the old home
   tab. They colour the filter only, never a page. */
const TAB_COLORS: Record<WorkKind, string> = {
  rendering: "#4b5cbe", // cobalt — the archviz colour
  editorial: "#b83636", // red — the design/print colour
  cad: "#5f6f53", // green — the line-print colour
  study: "#b0664a", // clay
  manual: "#4e6076", // slate
};
const ALL_TAB_COLOR = "#1a1a18"; // ink — the old home tab

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
        {items.map((item) => (
          <li
            key={item.slug}
            className={`${styles.cell} ${styles[`span${item.span}`]}${
              active && item.kind !== active ? ` ${styles.filteredOut}` : ""
            }`}
            style={{ "--lift": `${item.lift}rem` } as React.CSSProperties}
          >
            <WorkCard item={item} />
          </li>
        ))}
      </ul>
    </>
  );
}
