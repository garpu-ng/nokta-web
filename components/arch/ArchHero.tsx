import { getT } from "@/lib/i18n";
import styles from "./ArchHero.module.css";

/* Poster 1 — vast paper field, one hard cobalt plane cutting the top-right
   corner (moodbook: collage with the tiny swimmer), the wordmark set huge in
   the display face, a Space Mono micro-caption, and a tiny scale figure
   standing at the plane's edge. The figure is a decorative inline SVG
   silhouette (aria-hidden) so we own the asset outright. */
export default async function ArchHero() {
  const t = await getT();
  return (
    <section className={`${styles.hero} nk-grain`}>
      {/* Cobalt plane — clip-path polygon, no image. */}
      <div className={styles.plane} aria-hidden="true" />
      {/* Tiny scale figure at the plane's edge. */}
      <svg
        className={styles.figure}
        viewBox="0 0 20 44"
        aria-hidden="true"
      >
        <path
          d="M10 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-4 10h8l2 14h-3v20h-3V28h-2v16H5V24H2l4-14Z"
          fill="var(--ink)"
        />
      </svg>
      <h1 className={styles.title}>
        nokta.arch<span className={styles.titleDot}>.</span>
      </h1>
      <p className={styles.caption}>{t("arch.hero.caption")}</p>
      <p className={styles.claim}>{t("arch.hero.claim")}</p>
    </section>
  );
}
