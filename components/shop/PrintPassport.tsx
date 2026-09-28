import Image from "next/image";
import Link from "next/link";
import type { Translate } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import type { Print } from "@/lib/prints";
import styles from "./PrintPassport.module.css";

/** CAD print: the sheet, its passport, its price and its checkout. It is the
    body of every /shop/[slug] page. */
export default function PrintPassport({ print, t }: { print: Print; t: Translate }) {
  const { width, height } = getMediaSize(print.image);

  return (
    <div className={styles.body}>
      <div className={styles.print}>
        <div className={styles.frame}>
          <Image
            src={print.image}
            alt={`${print.title}, ${t("line.altSuffix")}`}
            width={width}
            height={height}
            sizes="(max-width: 767px) 100vw, 50vw"
            preload
            className={styles.art}
          />
        </div>

        <div className={styles.info}>
          {/* The print's Schriftfeld: the data engraved on the sheet itself. */}
          <dl className={styles.passport}>
            <div>
              <dt>{t("line.tb.subject")}</dt>
              <dd>{print.title}</dd>
            </div>
            <div>
              <dt>{t("line.tb.city")}</dt>
              <dd>{print.subtitle}</dd>
            </div>
            <div>
              <dt>{t("line.spec.year")}</dt>
              <dd>{print.year}</dd>
            </div>
            <div>
              <dt>{t("line.spec.architect")}</dt>
              <dd>{print.architect}</dd>
            </div>
            <div>
              <dt>{t("line.spec.coords")}</dt>
              <dd>{print.coordinates}</dd>
            </div>
            <div>
              <dt>{t("line.spec.technique")}</dt>
              <dd>{t("line.spec.techniqueVal")}</dd>
            </div>
            <div>
              <dt>{t("line.spec.format")}</dt>
              <dd>{t("line.spec.formatVal")}</dd>
            </div>
            <div>
              <dt>{t("line.tb.price")}</dt>
              <dd>{print.price} €</dd>
            </div>
          </dl>

          <p className={styles.lead}>{t("line.detailLead")}</p>

          <div className={styles.buy}>
            {print.paymentLink ? (
              // Live: a fixed-price Stripe Payment Link (see Print.paymentLink).
              // Opens Stripe's hosted checkout in a new tab; the price rides in
              // the label so this button carries the price on its own.
              <a
                href={print.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btn}
              >
                {t("line.buy")} · {print.price} €
              </a>
            ) : (
              // No link pasted yet: fall back to the /kontakt inquiry route.
              // The passport above still states the price.
              <>
                <span className={styles.price}>{print.price} €</span>
                <Link href="/kontakt" className={styles.btn}>
                  {t("line.order")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* The print in a room: how an A1 sheet sits on a wall, which the flat
          sheet above cannot say. */}
      <div className={styles.photos}>
        {print.mockups.map((src) => {
          const size = getMediaSize(src);
          return (
            <Image
              key={src}
              src={src}
              alt={`${print.title}, ${t("shop.mockupAlt")}`}
              width={size.width}
              height={size.height}
              sizes="(max-width: 1100px) 100vw, 1100px"
              className={styles.photo}
            />
          );
        })}
      </div>
    </div>
  );
}

