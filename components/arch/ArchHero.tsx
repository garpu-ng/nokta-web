import { getT } from "@/lib/i18n";
import CubeLogo3D from "./CubeLogo3D";
import styles from "./ArchHero.module.css";

/* Poster 1 — vast paper field, one hard cobalt plane cutting the top-right
   corner (moodbook: collage with the tiny swimmer), the wordmark set huge in
   the display face, and a Space Mono micro-caption. */
export default async function ArchHero() {
  const t = await getT();
  return (
    <section className={`${styles.hero} nk-grain`}>
      {/* Cobalt plane — clip-path polygon, no image. */}
      <div className={styles.plane} aria-hidden="true" />
      <h1 className={styles.title}>
        <span className={styles.srOnly}>nokta.cube.</span>
        <CubeLogo3D />
      </h1>
      <p className={styles.caption}>{t("arch.hero.caption")}</p>
      <p className={styles.claim}>{t("arch.hero.claim")}</p>
    </section>
  );
}
