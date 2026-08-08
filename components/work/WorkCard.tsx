import Image from "next/image";
import Link from "next/link";
import Registration from "@/components/print/Registration";
import { getMediaSize } from "@/lib/mediaSizes";
import type { Work, WorkKind } from "@/lib/works";
import WorkAnno, { workAnnotation, type WorkAnnotation } from "./WorkAnno";
import WorkClip from "./WorkClip";
import styles from "./WorkCard.module.css";

/* One sheet on the wall: the work's own image at its own ratio inside a
   hairline frame, its title, its annotation. A rendering, a report spread and a
   print sheet are shown in exactly the same frame — that is the point. No
   price: a print states its price on its own page. */

/** The card's slice of a work. Deliberately narrow: the wall is a client
    component, so only these fields cross into the client payload — never a
    project's image list or a print's checkout data.

    The thumbnail's intrinsic size is two of those fields rather than a lookup
    the card does for itself. It used to call getMediaSize() here, which put
    the whole 44-entry table — every path in /public, most of them for pages
    the wall never shows — into the client chunk to answer one question per
    card that was already answerable on the server. */
export type WallItem = {
  slug: string;
  title: string;
  kind: WorkKind;
  thumb: string;
  /** the moving version of the thumbnail, where the work is itself moving */
  clip?: string;
  /** the thumbnail's intrinsic size, resolved server-side */
  width: number;
  height: number;
  span: Work["span"];
  /** vertical drop (rem) on the desktop wall; phone ignores it */
  lift: number;
  anno: WorkAnnotation;
};

/** Reduce a work to what the wall shows, translating its annotation on the way
    (server pages call this; the wall itself never reaches for a dictionary). */
export function toWallItem(work: Work, t: (key: string) => string): WallItem {
  const { width, height } = getMediaSize(work.thumb);
  return {
    slug: work.slug,
    title: work.title,
    kind: work.kind,
    thumb: work.thumb,
    clip: work.clip,
    width,
    height,
    span: work.span,
    lift: work.lift ?? 0,
    anno: workAnnotation(work, t),
  };
}

/* The wall's measure and its column gap, named here the way app/page.tsx names
   the home sheet's: `sizes` has to be stated in pixels, because a card is not a
   share of the viewport but a share of a twelve-column grid. --content-max less
   its two gutters, and the gap at the width the design was drawn at (the
   clamp in WorkWall.module.css tops out at 1.5rem from 1200px up). Nothing but
   the hint is wrong if they drift. */
const MEASURE = 1420;
const COLUMNS = 12;
const GAP = 24;

/** The columns a card actually takes on the wall. Not the work's own curated
    span: the wall stands on one material at a time and hangs it two-up
    (.aligned in WorkWall.module.css), so a span-4 print and a span-7 rendering
    are both six columns wide there. */
const WALL_SPAN: WallItem["span"] = 6;

/** What a card of this span actually renders at on a full sheet. The hint used
    to end in a flat 640px for every card, which under-declared the widest ones
    by nearly a third — a span-7 rendering takes ~818px, so a 1× screen picked
    the 640w candidate and upscaled it. The lead pieces on the wall were the
    soft ones. Declaring each work's curated span instead would now under-
    declare the narrow ones by the same third, from the other end. */
function cardSizes(span: WallItem["span"]): string {
  const column = (MEASURE - GAP * (COLUMNS - 1)) / COLUMNS;
  const width = Math.round(span * column + GAP * (span - 1));
  return [
    "(max-width: 767px) 92vw",
    "(max-width: 1100px) 55vw",
    `${width}px`,
  ].join(", ");
}

const CARD_SIZES = cardSizes(WALL_SPAN);

export default function WorkCard({
  item,
  /** the first card the wall actually shows — its image is the page's LCP */
  lead = false,
}: {
  item: WallItem;
  lead?: boolean;
}) {
  return (
    <Link
      href={`/arbeiten/${item.slug}`}
      className={styles.card}
      // What the sheet is made of. The card is identical for every kind — only
      // the way the material answers the hand differs (see the module CSS).
      data-kind={item.kind}
      // The card's kind word used to borrow the colour that kind wore in the
      // filter bar. The filter spends no colour, so the word is simply paper —
      // like everything else on the sheet.
    >
      <span className={styles.frame}>
        {/* A work that moves hangs its film here, in the same frame and wearing
            the same class as the still it stands in for. It is never the wall's
            LCP candidate — a clip is not fetched until it is on screen (see
            WorkClip), so the lead priority below stays with a real image. */}
        {item.clip ? (
          <WorkClip
            src={item.clip}
            poster={item.thumb}
            width={item.width}
            height={item.height}
            className={styles.img}
          />
        ) : (
        <Image
          src={item.thumb}
          /* Empty on purpose: the title is set as real text inside this same
             link, two lines down. Repeating it here made a screen reader
             announce every work twice — once over for every card on the wall. The
             link still has an accessible name; it comes from the caption. */
          alt=""
          width={item.width}
          height={item.height}
          sizes={CARD_SIZES}
          /* This one image is the wall's LCP element, and every card on the
             wall was lazy — so the browser deprioritised the one thing the
             page is measured on until layout settled. Eager + high rather than
             `preload`: the shipped docs steer to these "in most cases", and
             warn off preload precisely when the LCP candidate can change,
             which here it does the moment a kind filter is pressed. */
          loading={lead ? "eager" : "lazy"}
          fetchPriority={lead ? "high" : undefined}
          className={styles.img}
        />
        )}
        {/* A registration mark struck on the sheet's corner as you reach for
            it — the press vocabulary, held back until the card is addressed. */}
        <Registration className={styles.reg} />
      </span>
      <span className={styles.caption}>
        <span className={styles.title}>{item.title}</span>
        <WorkAnno anno={item.anno} />
      </span>
    </Link>
  );
}
