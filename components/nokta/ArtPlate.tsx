import Image from "next/image";
import { getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import CropMarks from "@/components/print/CropMarks";
import styles from "./ArtPlate.module.css";

/* Art plate — the studio's style statement, bridging the commissioned work to
   what nokta likes: a system and one deliberate deviation. n-study.png is the
   authoritative artwork (a grid of chunky italic "n"s with a single cobalt one
   breaking rank); it is shown at its native size inside a framed print-specimen
   plate with crop marks and a mono spec caption, never scaled past 536px where
   it would pixelate. */
const SRC = "/point/n-study.png";

export default async function ArtPlate() {
  const t = await getT();
  const { width, height } = getMediaSize(SRC);

  return (
    <section className={`${styles.plate} nk-grain`}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={`nk-mono-caption ${styles.kicker}`}>{t("point.plate.kicker")}</p>
          <h2 className={styles.label}>
            {t("point.plate.label")}
            <span className={styles.labelDot}>.</span>
          </h2>
        </header>

        <div className={styles.body}>
          <figure className={styles.specimen}>
            <div className={styles.frame}>
              <CropMarks className={styles.crop} />
              <Image
                src={SRC}
                alt={t("point.plate.alt")}
                width={width}
                height={height}
                sizes="(max-width: 600px) 90vw, 480px"
                className={styles.art}
              />
            </div>
            <figcaption className={`nk-mono-caption ${styles.spec}`}>
              {t("point.plate.spec")}
            </figcaption>
          </figure>

          <p className={styles.text}>{t("point.plate.text")}</p>
        </div>
      </div>
    </section>
  );
}
