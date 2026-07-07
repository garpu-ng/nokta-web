import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRINTS, getPrint } from "@/lib/prints";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PRINTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const print = getPrint(slug);
  if (!print) return {};
  return {
    title: `${print.title} — nokta.line`,
    description: `${print.title}, ${print.subtitle} · ${print.year} · ${print.architect}. Vektorisierter CAD-Liniendruck, gerahmt. ${print.price} €.`,
    alternates: { canonical: `/line/${print.slug}` },
  };
}

export default async function PrintPage({ params }: Props) {
  const { slug } = await params;
  const print = getPrint(slug);
  if (!print) notFound();

  const idx = PRINTS.findIndex((p) => p.slug === slug);
  const prev = PRINTS[idx - 1];
  const next = PRINTS[idx + 1];

  return (
    <main className="nk-branch nk-print-page">
      <Link href="/line" className="nk-print-back">
        ← nokta.line
      </Link>

      <div className="nk-print-detail">
        {/* Framed artwork */}
        <div className="nk-print-detail__frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={print.image}
            alt={`${print.title} — vektorisierter CAD-Liniendruck`}
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
              <dt>Baujahr</dt>
              <dd>{print.year}</dd>
            </div>
            <div>
              <dt>Architekt</dt>
              <dd>{print.architect}</dd>
            </div>
            <div>
              <dt>Koordinaten</dt>
              <dd>{print.coordinates}</dd>
            </div>
            <div>
              <dt>Technik</dt>
              <dd>Vektorisierte CAD-Zeichnung, gerahmt</dd>
            </div>
          </dl>

          <p className="nk-print-detail__lead">
            Ein technischer Aufriss als Kunst — jede Linie aus einer CAD-Zeichnung
            vektorisiert, sauber gesetzt und gerahmt für die Wand.
          </p>

          <div className="nk-print-detail__buy">
            <span className="nk-print-detail__price">{print.price} €</span>
            {/* TODO: wire Stripe Checkout — for now routes to inquiry */}
            <Link href="/kontakt" className="nk-btn">
              Bestellen
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <nav className="nk-print-nav" aria-label="Weitere Drucke">
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
