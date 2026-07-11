import Image from "next/image";
import Link from "next/link";
import { getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { PRINTS } from "@/lib/prints";
import styles from "./PrintCatalogue.module.css";

/* The uniform A1 grid deliberately resists a gallery stagger: every product is
   the same physical format. Artwork remains its original white-paper preview. */
export default async function PrintCatalogue() {
  const t = await getT();

  return (
    <section className={styles.catalogue}>
      <div className={styles.inner}>
        <h2 className={styles.label}>{t("line.catalogue.label")}</h2>
        <div className={styles.grid}>
          {PRINTS.map((print) => {
            const { width, height } = getMediaSize(print.image);
            return (
              <Link key={print.slug} href={`/line/${print.slug}`} className={styles.print}>
                <span className={styles.frame}>
                  <Image
                    src={print.image}
                    alt={print.title}
                    width={width}
                    height={height}
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className={styles.art}
                  />
                </span>
                <span className={styles.caption}>
                  <span className={styles.title}>
                    {print.title}
                    <span className={styles.titleDot}>.</span>
                  </span>
                  <span className={styles.meta}>
                    <span>{print.subtitle} · {print.year}</span>
                    <span className={styles.coordinates}>{print.coordinates}</span>
                  </span>
                  <span className={styles.buy}>
                    <span className={styles.price}>{print.price} €</span>
                    <span className={styles.cta}>{t("line.view")}</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
