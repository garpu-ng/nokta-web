import Image from "next/image";
import { getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import CropMarks from "@/components/print/CropMarks";
import styles from "./Leuchtturm.module.css";

/* Leuchtturm — the studio's house design manual, shown as the real artifact it
   is. Deliberately has no CTA of any kind: the book is not for sale and not
   obtainable — it's the internal rulebook every job starts from, and the copy
   says exactly that. The scanned cover (grainy photocopy aesthetic, the five
   nokta glyphs stacked vertically) is the hero and carries its own texture, so
   the frame around it stays quiet: crop marks and one mono spec line. Layout
   mirrors ArtPlate (text left, plate right) for an alternating rhythm. */
const SRC = "/point/leuchtturm-cover.webp";

export default async function Leuchtturm() {
  const t = await getT();
  const { width, height } = getMediaSize(SRC);

  return (
    <section className={`${styles.manual} nk-grain`}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={`nk-mono-caption ${styles.kicker}`}>{t("point.manual.kicker")}</p>
          <h2 className={styles.label}>
            {t("point.manual.label")}
            <span className={styles.labelDot}>.</span>
          </h2>
        </header>

        <div className={styles.body}>
          <p className={styles.text}>{t("point.manual.text")}</p>

          <figure className={styles.specimen}>
            <div className={styles.frame}>
              <CropMarks className={styles.crop} />
              <Image
                src={SRC}
                alt={t("point.manual.alt")}
                width={width}
                height={height}
                sizes="(max-width: 600px) 90vw, 420px"
                className={styles.art}
              />
            </div>
            <figcaption className={`nk-mono-caption ${styles.spec}`}>
              {t("point.manual.spec")}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
