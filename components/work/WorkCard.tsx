import Image from "next/image";
import Link from "next/link";
import Registration from "@/components/print/Registration";
import { getMediaSize } from "@/lib/mediaSizes";
import type { Work, WorkKind } from "@/lib/works";
import WorkAnno, { workAnnotation, type WorkAnnotation } from "./WorkAnno";
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
    the wall never shows — into the client chunk to answer thirteen questions
    that were already answerable on the server. */
export type WallItem = {
  slug: string;
  title: string;
  kind: WorkKind;
  thumb: string;
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
    width,
    height,
    span: work.span,
    lift: work.lift ?? 0,
    anno: workAnnotation(work, t),
  };
}

export default function WorkCard({ item }: { item: WallItem }) {
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
        <Image
          src={item.thumb}
          alt={item.title}
          width={item.width}
          height={item.height}
          sizes="(max-width: 767px) 92vw, (max-width: 1100px) 55vw, 640px"
          className={styles.img}
        />
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
