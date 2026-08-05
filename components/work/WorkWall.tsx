"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import type { WorkKind } from "@/lib/works";
import WorkCard, { type WallItem } from "./WorkCard";
import styles from "./WorkWall.module.css";

/* The wall: one body of work, shown one material at a time. The kinds are
   stamps and a filter — never sections, never headings.

   There is no "all". A rendering, a framed line print and a 216-page report
   answer different questions, and a view holding all three at once sorted
   nothing for the reader who came for one of them — so the wall always stands
   on exactly one material and the chips move it between them. Filtering only
   hides cards (display:none), so the images stay decoded and the order never
   shifts; the narrowed wall is what the server sends, and without JS the row
   is simply inert on the material the URL named.

   The filter spends no colour. Five materials would have meant five fields,
   and a row of five colours is a paint chart — it out-shouted the works it
   exists to sort, which is the wrong way round. So the chips are hairline
   outlines, and the ONE that is pressed is filled creme with ink type on it.
   Nothing else on the row moves. You can read which filter is on from across
   the room and there is exactly one thing to read.

   The label is set in the headline face, not the mono the row used to wear —
   the same voice the homepage's service doors use, because these chips lead
   to the same materials those doors do.

   The cards enter through the shared Reveal primitive, staggered left-then-
   right so a row lands as a pair rather than a block.

   Which material the wall opens on is decided on the server: /arbeiten?kind=
   rendering renders the renderings, so the homepage's three doors land on
   their own material rather than flashing another one and then swapping. */

export default function WorkWall({
  items,
  kinds,
  listLabel,
  initialKind,
  countTemplate,
  countOneTemplate,
  headClassName,
  countClassName,
  wallClassName,
}: {
  items: WallItem[];
  /** the kinds present on the wall, in wall order, with their translated stamps */
  kinds: { kind: WorkKind; label: string }[];
  listLabel: string;
  /** the material the wall opens on — the page resolves it from ?kind= */
  initialKind: WorkKind;
  /** the count line's templates, each carrying a literal {count}. Two of them,
      because three of the five materials hold exactly one work — "1 arbeiten"
      is a bug the old wall never showed, since it only ever counted all
      thirteen. German and English take the singular; Turkish and Japanese do
      not inflect after a numeral and simply repeat the plural string. */
  countTemplate: string;
  countOneTemplate: string;
  /** the page's own class names — the wall renders the header block so the
      count can follow the filter, but the page keeps owning how it looks */
  headClassName: string;
  countClassName: string;
  wallClassName: string;
}) {
  const [active, setActive] = useState<WorkKind>(initialKind);

  /* Which card the reader actually sees first, and therefore which image is
     the page's LCP. Filtering only hides cards, so it is the first item the
     server-rendered filter leaves standing — /arbeiten?kind=rendering must
     hand its priority to the first rendering, not to the first card in the
     wall order. Read from initialKind rather than the live filter: this
     decides the FIRST paint, and pressing a chip later must not re-prioritise
     images the browser has already fetched. */
  const leadSlug = items.find((item) => item.kind === initialKind)?.slug;

  const shown = items.filter((i) => i.kind === active).length;
  const count = (shown === 1 ? countOneTemplate : countTemplate).replace(
    "{count}",
    String(shown),
  );

  /* Where each card sits on the sheet the reader is looking at, which is not
     where it sits in the running order: the fourth print is the twelfth item
     on the wall. The stagger below alternates on this seat, and counting items
     instead would hand both halves of a row the same beat — the renderings
     land at 0, 2, 4, 6, 8, 11, so five of the six would have entered
     together. */
  const seats = new Map<string, number>();
  for (const item of items) {
    if (item.kind === active) seats.set(item.slug, seats.size);
  }

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
    window.history.replaceState(null, "", `?kind=${active}`);
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

        {/* Always aligned: a material is a contact sheet, and the hand-pinned
            hanging (curated spans and lifts) was drawn for the mixed wall,
            which is not a view this page has any more. The cells still carry
            their span and lift — see the module CSS, which overrides both from
            768px up — so nothing about that vocabulary had to be thrown away. */}
        <ul className={`${styles.grid} ${styles.aligned}`} aria-label={listLabel}>
          {items.map((item) => (
            <li
              key={item.slug}
              className={`${styles.cell} ${styles[`span${item.span}`]}${
                item.kind !== active ? ` ${styles.filteredOut}` : ""
              }`}
              style={{ "--lift": `${item.lift}rem` } as React.CSSProperties}
            >
              {/* The wall reads two-up, so the stagger alternates: the left
                  sheet is pinned, then the right one a beat later. */}
              <Reveal delay={((seats.get(item.slug) ?? 0) % 2) * 90}>
                <WorkCard item={item} lead={item.slug === leadSlug} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
