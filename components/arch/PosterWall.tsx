import Link from "next/link";
import Image from "next/image";
import { PROJECTS } from "@/lib/projects";
import { getMediaSize } from "@/lib/mediaSizes";
import { getT } from "@/lib/i18n";
import styles from "./PosterWall.module.css";

/* Poster wall — each project is a matted "print": true-color render (the
   product is never tinted), Righteous title below, Space Mono meta rotated
   along the side. Rows alternate wide/narrow
   (7/5 columns) for editorial rhythm instead of the old uniform squares.
   Image width/height come from the measured intrinsic sizes in mediaSizes
   (the thumbs are NOT uniformly square — portrait, square and landscape all
   appear), so the wall keeps each render's true aspect ratio. */
export default async function PosterWall() {
  const t = await getT();
  return (
    <section className={styles.wall}>
      <h2 className={styles.label}>{t("arch.wall.label")}</h2>
      <div className={styles.grid}>
        {PROJECTS.map((p, i) => {
          const { width, height } = getMediaSize(p.thumb);
          // Wide/narrow alternation (wide, narrow, narrow, wide, …) pairs a
          // 7-col and a 5-col poster per row, which tiles cleanly into 12 for
          // exactly the current 6 PROJECTS. It is ORDER-DEPENDENT: if PROJECTS
          // grows or is reordered, recheck the pairing — a run like wide/wide
          // can force a 7+7 row that overflows the 12-col grid.
          const isNarrow = i % 4 === 1 || i % 4 === 2;
          return (
            <Link
              key={p.slug}
              href={`/projekte/${p.slug}`}
              className={`${styles.poster} ${isNarrow ? styles.narrow : styles.wide}`}
            >
              <span className={styles.meta}>
                {p.year} · {p.category}
              </span>
              <span className={styles.frame}>
                <Image
                  src={p.thumb}
                  alt={p.title}
                  width={width}
                  height={height}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className={styles.img}
                />
              </span>
              <span className={styles.title}>
                {p.title}
                <span className={styles.dotAccent}>.</span>
              </span>
              <span className={styles.client}>
                {p.client === "Privatkunde" ? t("projects.client.private") : p.client}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
