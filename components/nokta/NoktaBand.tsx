import Link from "next/link";
import { getT } from "@/lib/i18n";
import styles from "./NoktaBand.module.css";

function CropMark({ corner }: { corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" }) {
  const path = {
    topLeft: "M12 34H34M34 12V34",
    topRight: "M34 34H56M34 12V34",
    bottomLeft: "M12 34H34M34 34V56",
    bottomRight: "M34 34H56M34 34V56",
  }[corner];

  return (
    <svg className={`${styles.cropMark} ${styles[corner]}`} viewBox="0 0 68 68" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default async function NoktaBand() {
  const t = await getT();

  return (
    <section className={`${styles.band} nk-grain`}>
      <svg className={styles.registration} viewBox="0 0 280 280" aria-hidden="true">
        <circle cx="140" cy="140" r="74" />
        <path d="M140 0v280M0 140h280" />
      </svg>
      <CropMark corner="topLeft" />
      <CropMark corner="topRight" />
      <CropMark corner="bottomLeft" />
      <CropMark corner="bottomRight" />

      <div className={styles.content}>
        <p className={styles.tagline}>{t("nokta.band.tagline")}</p>
        <Link href="/kontakt" className={styles.cta}>{t("nokta.band.cta")}</Link>
      </div>
    </section>
  );
}
