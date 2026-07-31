"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import type { WorkKind } from "@/lib/works";
import WorkCard, { type WallItem } from "./WorkCard";
import styles from "./WorkWall.module.css";

/* The wall: one body of work, one grid, in the curated order. The kinds are
   stamps and a filter — never sections, never headings. Filtering only hides
   cards (display:none), so the images stay decoded and the order never shifts;
   with the initial state "all", the full wall renders server-side and the
   filter row is simply inert without JS.

   The filter spends no colour. Six materials would have meant six fields,
   and a row of six colours is a paint chart — it out-shouted the thirteen
   works it exists to sort, which is the wrong way round. So the chips are
   hairline outlines, and the ONE that is pressed is filled creme with ink
   type on it. Nothing else on the row moves. You can read which filter is on
   from across the room and there is exactly one thing to read.

   The label is set in the headline face, not the mono the row used to wear —
   the same voice the homepage's service doors use, because these chips lead
   to the same materials those doors do.

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
  countTemplate,
  headClassName,
  countClassName,
  wallClassName,
}: {
  items: WallItem[];
  /** the kinds present on the wall, in wall order, with their translated stamps */
  kinds: { kind: WorkKind; label: string }[];
  allLabel: string;
  listLabel: string;
  /** the kind the URL asked for, if it named a real one */
  initialKind?: WorkKind | null;
  /** the count line's template, carrying a literal {count} */
  countTemplate: string;
  /** the page's own class names — the wall renders the header block so the
      count can follow the filter, but the page keeps owning how it looks */
  headClassName: string;
  countClassName: string;
  wallClassName: string;
}) {
  const [active, setActive] = useState<WorkKind | null>(initialKind);

  /* Which card the reader actually sees first, and therefore which image is
     the page's LCP. Filtering only hides cards, so it is the first item the
     server-rendered filter leaves standing — /arbeiten?kind=rendering must
     hand its priority to the first rendering, not to the first card in the
     wall order. Read from initialKind rather than the live filter: this
     decides the FIRST paint, and pressing a chip later must not re-prioritise
     images the browser has already fetched. */
  const lead = items.findIndex((item) => !initialKind || item.kind === initialKind);

  const shown = active ? items.filter((i) => i.kind === active).length : items.length;
  const count = countTemplate.replace("{count}", String(shown));

  /* Keep the URL honest about what is on screen, so a narrowed wall can be
     copied out of the address bar — the server already reads ?kind= and
     renders the same set. replaceState rather than the router: this is the
     same page with a different filter, and a real navigation would refetch it
     and cost a flash. History is replaced, not pushed, so the back button
     still leaves the wall instead of walking back through filter states. */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const url = active ? `?kind=${active}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [active]);

  return (
    <>
      <div className={headClassName}>
        {/* aria-live: the filter is the one control on this page that changes
            the page rather than navigating, and the count is the only thing
            that reports what it did. */}
        <p className={countClassName} aria-live="polite">
          {count}
        </p>
      </div>

      <div className={wallClassName}>
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
              {/* The wall reads two-up, so the stagger alternates: the left
                  sheet is pinned, then the right one a beat later. */}
              <Reveal delay={(i % 2) * 90}>
                <WorkCard item={item} lead={i === lead} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
