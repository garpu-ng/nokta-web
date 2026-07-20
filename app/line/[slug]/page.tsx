import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PRINTS, getPrint } from "@/lib/prints";
import { getMediaSize } from "@/lib/mediaSizes";
import { getT } from "@/lib/i18n";
import shell from "@/components/BranchShell.module.css";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PRINTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const print = getPrint(slug);
  if (!print) return {};
  const t = await getT();
  // One per-print description, reused for the page tag and the social card.
  const description = `${print.title}, ${print.subtitle} · ${print.year} · ${print.architect}. ${t("line.metaDescSuffix")} ${print.price} €.`;
  const title = `${print.title} · nokta.line`;
  const { width, height } = getMediaSize(print.image);
  return {
    title,
    description,
    alternates: { canonical: `/line/${print.slug}` },
    // Product page: give a shared link a preview of the framed print. The
    // relative image URL resolves against the layout's metadataBase.
    openGraph: {
      type: "website",
      title,
      description,
      url: `/line/${print.slug}`,
      images: [{ url: print.image, width, height, alt: `${print.title}, ${t("line.altSuffix")}` }],
    },
  };
}

export default async function PrintPage({ params }: Props) {
  const { slug } = await params;
  const print = getPrint(slug);
  if (!print) notFound();

  const t = await getT();
  const idx = PRINTS.findIndex((p) => p.slug === slug);
  const prev = PRINTS[idx - 1];
  const next = PRINTS[idx + 1];

  return (
    <main className={shell.branch}>
      <Link href="/line" className={styles.printBack}>
        {t("line.back")}
      </Link>

      <div className={styles.printDetail}>
        {/* Framed artwork */}
        <div className={styles.detailFrame}>
          <Image
            src={print.image}
            alt={`${print.title}, ${t("line.altSuffix")}`}
            width={getMediaSize(print.image).width}
            height={getMediaSize(print.image).height}
            sizes="(max-width: 767px) 100vw, 50vw"
            preload
            className={styles.detailArt}
          />
        </div>

        {/* Info column */}
        <div className={styles.detailInfo}>
          <h1 className={styles.detailTitle}>
            {print.title}
            <span className="nk-dot">.</span>
          </h1>
          <p className={styles.detailCity}>{print.subtitle}</p>

          {/* Technical passport — the print's Schriftfeld. Same visual grammar
              as the corner title block in components/line/LineHero.tsx
              (.titleBlock): a hairline-ruled box of mono dt/dd pairs. Here it
              is the product's centrepiece detail, so it restates the full
              engraved data of the sheet rather than sitting as a corner mark. */}
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

          <p className={styles.detailLead}>{t("line.detailLead")}</p>

          <div className={styles.detailBuy}>
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
              // The passport above still shows the price.
              <>
                <span className={styles.detailPrice}>{print.price} €</span>
                <Link href="/kontakt" className={styles.btn}>
                  {t("line.order")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <nav className={styles.printNav} aria-label={t("aria.morePrints")}>
        {prev ? (
          <Link href={`/line/${prev.slug}`}>← {prev.title}</Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/line/${next.slug}`}>{next.title} →</Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
