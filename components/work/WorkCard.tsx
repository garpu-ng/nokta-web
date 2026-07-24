import Image from "next/image";
import Link from "next/link";
import { getMediaSize } from "@/lib/mediaSizes";
import type { Work } from "@/lib/works";
import WorkAnno, { type WorkAnnotation } from "./WorkAnno";
import styles from "./WorkCard.module.css";

/* One sheet on the wall: the work's own image at its own ratio inside a
   hairline frame, its title, its annotation. A rendering, a report spread and a
   print sheet are shown in exactly the same frame — that is the point. No
   price: a print states its price on its own page. */
export default function WorkCard({ work, anno }: { work: Work; anno: WorkAnnotation }) {
  const { width, height } = getMediaSize(work.thumb);

  return (
    <Link href={`/arbeiten/${work.slug}`} className={styles.card}>
      <span className={styles.frame}>
        <Image
          src={work.thumb}
          alt={work.title}
          width={width}
          height={height}
          sizes="(max-width: 767px) 92vw, (max-width: 1100px) 55vw, 640px"
          className={styles.img}
        />
      </span>
      <span className={styles.caption}>
        <span className={styles.title}>{work.title}</span>
        <WorkAnno anno={anno} className={styles.anno} />
      </span>
    </Link>
  );
}
