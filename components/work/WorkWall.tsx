"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import type { WorkKind } from "@/lib/works";
import WorkCard, { type WallItem } from "./WorkCard";
import styles from "./WorkWall.module.css";

/* The wall: one body of work, one grid, in the curated order. The kinds are
   stamps and a filter — never sections, never headings. Filtering only hides
   cards (display:none), so the images stay decoded and the order never shifts;
   with the initial state "all", the full wall renders server-side and the
   filter row is simply inert without JS.

   The filter used to wear the old site's tab dress — a segmented black bar,
   each tab's label in the motto colour of the branch it came from. Since
   Kolonnade that black IS the page, so the row is restated as the same
   hairline chips the /kontakt form uses, and the retired branch colours are
   spent nowhere on the site at all.

   The cards enter through the shared Reveal primitive, staggered left-then-
   right so a row lands as a pair rather than a block.

   The filter can arrive already set: /arbeiten?kind=rendering renders the
   filtered wall on the server, so the homepage's three doors land on a wall
   that is already showing their material rather than flashing the full set
   and then narrowing it. */

export default function WorkWall({
  items,
  kinds,
  allLabel,
  listLabel,
  initialKind = null,
}: {
  items: WallItem[];
  /** the kinds present on the wall, in wall order, with their translated stamps */
  kinds: { kind: WorkKind; label: string }[];
  allLabel: string;
  listLabel: string;
  /** the kind the URL asked for, if it named a real one */
  initialKind?: WorkKind | null;
}) {
  const [active, setActive] = useState<WorkKind | null>(initialKind);

  return (
    <>
      <div className={styles.filter}>
        <button
          type="button"
          className={styles.stamp}
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
