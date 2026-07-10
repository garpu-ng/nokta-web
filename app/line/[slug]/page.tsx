import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PRINTS, getPrint } from "@/lib/prints";
import { getMediaSize } from "@/lib/mediaSizes";
import { getT } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PRINTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const print = getPrint(slug);
  if (!print) return {};
  const t = await getT();
  return {
    title: `${print.title} · nokta.line`,
    description: `${print.title}, ${print.subtitle} · ${print.year} · ${print.architect}. ${t("line.metaDescSuffix")} ${print.price} €.`,
    alternates: { canonical: `/line/${print.slug}` },
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
    <main className="nk-branch nk-print-page">
      <Link href="/line" className="nk-print-back">
        {t("line.back")}
      </Link>

      <div className="nk-print-detail">
        {/* Framed artwork */}
        <div className="nk-print-detail__frame">
          <Image
            src={print.image}
            alt={`${print.title}, ${t("line.altSuffix")}`}
            width={getMediaSize(print.image).width}
            height={getMediaSize(print.image).height}
            sizes="(max-width: 767px) 100vw, 50vw"
            priority
            className="nk-print-detail__art"
          />
        </div>

        {/* Info column */}
        <div className="nk-print-detail__info">
          <h1 className="nk-print-detail__title">
            {print.title}
            <span className="nk-dot">.</span>
          </h1>
          <p className="nk-print-detail__city">{print.subtitle}</p>

          <dl className="nk-print-detail__specs">
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
          </dl>

          <p className="nk-print-detail__lead">{t("line.detailLead")}</p>

          <div className="nk-print-detail__buy">
            <span className="nk-print-detail__price">{print.price} €</span>
            {/* TODO: wire Stripe Checkout — for now routes to inquiry */}
            <Link href="/kontakt" className="nk-btn">
              {t("line.order")}
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <nav className="nk-print-nav" aria-label={t("aria.morePrints")}>
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
