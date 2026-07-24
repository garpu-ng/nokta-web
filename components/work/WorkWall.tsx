"use client";

import { useState } from "react";
import type { WorkKind } from "@/lib/works";
import WorkCard, { type WallItem } from "./WorkCard";
import styles from "./WorkWall.module.css";

/* The wall: one body of work, one grid, in the curated order. The kinds are
   stamps and a filter — never sections, never headings. Filtering only hides
   cards (display:none), so the images stay decoded and the order never shifts;
   with the initial state "all", the full wall renders server-side and the
   filter row is simply inert without JS. */

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

      <ul className={styles.grid} aria-label={listLabel}>
        {items.map((item) => (
          <li
            key={item.slug}
            className={`${styles.cell} ${styles[`span${item.span}`]}${
              active && item.kind !== active ? ` ${styles.filteredOut}` : ""
            }`}
          >
            <WorkCard item={item} />
          </li>
        ))}
      </ul>
    </>
  );
}
