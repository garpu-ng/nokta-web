import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import DiscField from "@/components/nokta/DiscField";
import PlateHead from "@/components/nokta/PlateHead";
import { KIND_FIELD, PAPER } from "@/lib/colors";
import { getLocale, getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { PRINTS } from "@/lib/prints";
import { socialMetadata } from "@/lib/socialMeta";
import styles from "./page.module.css";

/* The shop: the CAD line prints, on their own. They used to hang on the wall
   at /arbeiten as a fifth material, which made a product read as studio work
   and left no room for CAD as a service. Here they are what they are — four
   framed sheets with a price — and /arbeiten keeps "cad" free for floor plans,
   sections and site plans made to order. */

const PALETTE = [KIND_FIELD.cad, PAPER];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.shop.title");
  const description = t("meta.shop.desc");
  return {
    title,
    description,
    alternates: { canonical: "/shop" },
    ...socialMetadata({ title, description, locale, path: "/shop" }),
  };
}

export default async function ShopPage() {
  const t = await getT();
  const title = `${t("shop.heading")}.`;

  return (
    <main className={styles.page}>
      <PlateHead title={title}>
        <DiscField palette={PALETTE} motto={title} />
      </PlateHead>

      <section className={styles.head}>
        <p className={styles.intro}>{t("shop.intro")}</p>
      </section>

      <ul className={styles.grid} aria-label={t("shop.listLabel")}>
        {PRINTS.map((print, i) => {
          const { width, height } = getMediaSize(print.image);
          return (
            <li key={print.slug}>
              <Link href={`/shop/${print.slug}`} className={styles.card}>
                <span
                  className={styles.sheet}
                  style={{ "--nk-ratio": `${width} / ${height}` } as CSSProperties}
                >
                  <Image
                    src={print.image}
                    alt={`${print.title}, ${t("line.altSuffix")}`}
                    width={width}
                    height={height}
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) 45vw, 300px"
                    preload={i === 0}
                    className={styles.img}
                  />
                </span>
                <span className={styles.caption}>
                  <span className={styles.title}>{print.title}</span>
                  <span className={styles.meta}>
                    {print.subtitle} · A1 · {print.price} €
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
