import Link from "next/link";
import { getT } from "@/lib/i18n";
import styles from "./LineBand.module.css";

/* The final green sheet carries a quiet, paper-coloured dimension chain: the
   drafting device from the hero, abstracted into a static closing field. */
export default async function LineBand() {
  const t = await getT();

  return (
    <section className={`${styles.band} nk-grain`}>
      <svg
        viewBox="0 0 1440 480"
        className={styles.dimension}
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M0 240H1440" className={styles.chainLine} />
        <path d="M80 180v120M360 196v88M720 166v148M1080 196v88M1360 180v120" className={styles.chainLine} />
        <path d="M80 240l16-7v14zM360 240l-16-7v14zM360 240l16-7v14zM720 240l-16-7v14zM720 240l16-7v14zM1080 240l-16-7v14zM1080 240l16-7v14zM1360 240l-16-7v14z" className={styles.chainFill} />
      </svg>
      <div className={styles.content}>
        <p className={styles.tagline}>{t("line.band.tagline")}</p>
        <Link href="/kontakt" className={styles.cta}>
          {t("line.band.cta")}
        </Link>
      </div>
    </section>
  );
}
