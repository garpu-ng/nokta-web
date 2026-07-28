"use client";

import { useState, type CSSProperties } from "react";
import Reveal from "@/components/Reveal";
import type { WorkKind } from "@/lib/works";
import WorkCard, { type WallItem } from "./WorkCard";
import styles from "./WorkWall.module.css";

/* The wall: one body of work, one grid, in the curated order. The kinds are
   stamps and a filter — never sections, never headings. Filtering only hides
   cards (display:none), so the images stay decoded and the order never shifts;
   with the initial state "all", the full wall renders server-side and the
   filter row is simply inert without JS.

   The filter wears the doors. Each chip is a field of its own material's
   colour with a paper label on it — the same dress the homepage's service
   doors wear, at chip size, so the door you came through and the chip that
   holds you there are visibly the same thing. (It has been through two other
   dresses: the old site's segmented black bar, then a row of hairline chips
   from the /kontakt form. The hairlines were honest and said nothing.)

   ALLE is the exception and has to be: it is not a material, so it has no
   colour to wear. Paper field, ink label — the one chip on the row that is
   the page turned over, which is exactly what "no filter" means.

   Which chip is pressed is a 2px ring, in paper on the colours and in ink on
   ALLE. Not the accent: a red ring on a red chip is not a ring.

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
  /** the kinds present on the wall, in wall order, with their translated
      stamps and the field colour each one is struck in */
  kinds: { kind: WorkKind; label: string; field: string }[];
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
          className={`${styles.stamp} ${styles.stampAll}`}
          aria-pressed={active === null}
          onClick={() => setActive(null)}
        >
          {allLabel}
        </button>
        {kinds.map(({ kind, label, field }) => (
          <button
            key={kind}
            type="button"
            className={styles.stamp}
            // The material's own colour, spent as the field it stands on —
            // the same custom property the homepage doors are handed.
            style={{ "--nk-field": field } as CSSProperties}
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
