import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import Registration from "@/components/print/Registration";
import { TAB_COLORS } from "@/lib/colors";
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
    project's image list or a print's checkout data. */
export type WallItem = {
  slug: string;
  title: string;
  kind: WorkKind;
  thumb: string;
  span: Work["span"];
  /** vertical drop (rem) on the desktop wall; phone ignores it */
  lift: number;
  anno: WorkAnnotation;
};

/** Reduce a work to what the wall shows, translating its annotation on the way
    (server pages call this; the wall itself never reaches for a dictionary). */
export function toWallItem(work: Work, t: (key: string) => string): WallItem {
  return {
    slug: work.slug,
    title: work.title,
    kind: work.kind,
    thumb: work.thumb,
    span: work.span,
    lift: work.lift ?? 0,
    anno: workAnnotation(work, t),
  };
}

export default function WorkCard({ item }: { item: WallItem }) {
  const { width, height } = getMediaSize(item.thumb);

  return (
    <Link
      href={`/arbeiten/${item.slug}`}
      className={styles.card}
      // The colour this work's kind wears in the filter bar. Only the
      // annotation's kind word ever spends it, and only under the pointer.
      style={{ "--nk-kind": TAB_COLORS[item.kind] } as CSSProperties}
    >
      <span className={styles.frame}>
        <Image
          src={item.thumb}
          alt={item.title}
          width={width}
          height={height}
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
