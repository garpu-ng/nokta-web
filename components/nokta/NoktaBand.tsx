import Link from "next/link";
import { getT } from "@/lib/i18n";
import styles from "./NoktaBand.module.css";

export default async function NoktaBand() {
  const t = await getT();

  return (
    <section className={`${styles.band} nk-grain`}>
      <svg className={styles.registration} viewBox="0 0 280 280" aria-hidden="true">
        <circle cx="140" cy="140" r="74" />
        <path d="M140 0v280M0 140h280" />
      </svg>

      <div className={styles.content}>
        <p className={styles.tagline}>{t("nokta.band.tagline")}</p>
        <Link href="/kontakt" className={styles.cta}>{t("nokta.band.cta")}</Link>
      </div>
    </section>
  );
}
