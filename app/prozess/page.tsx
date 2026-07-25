import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getT } from "@/lib/i18n";

/* The process overview — four cards, one per material, mirroring the studio's
   four service rows (same nokta.svc.* copy, stated once and reused). The 3D
   workflow is worked out and its card links through to /prozess/3d; the other
   three stand as cards until their write-ups exist — no teaser links, no
   "coming soon". */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("meta.prozess.title") };
}

/** The four processes in service order; `href` only where a workflow page
    actually exists. */
const CARDS: { svc: 0 | 1 | 2 | 3; href?: string }[] = [
  { svc: 0, href: "/prozess/3d" },
  { svc: 1 },
  { svc: 2 },
  { svc: 3 },
];

export default async function ProzessPage() {
  const t = await getT();

  return (
    <div className="wa-prozess-page">
      <div className="wa-prozess-header">
        <h1 className="wa-prozess-heading">{t("prozess.heading")}</h1>
        <p className="wa-prozess-intro">{t("prozess.index.intro")}</p>
      </div>

      <ul className="wa-prozess-cards">
        {CARDS.map(({ svc, href }, i) => {
          const folio = String(svc + 1).padStart(2, "0");
          const body = (
            <>
              <span className="wa-prozess-card-folio">{folio}</span>
              <h2 className="wa-prozess-card-title">
                {t(`nokta.svc.${svc}.title`)}
                <span className="wa-prozess-card-dot">.</span>
              </h2>
              <p className="wa-prozess-card-text">{t(`nokta.svc.${svc}.text`)}</p>
              {href && (
                <span className="wa-prozess-card-cta nk-mono-caption">
                  {t("prozess.card.cta")} →
                </span>
              )}
            </>
          );
          return (
            // Two-up, so the cards arrive in pairs — left, then right.
            <Reveal as="li" key={svc} className="wa-prozess-card-cell" delay={(i % 2) * 90}>
              {href ? (
                <Link href={href} className="wa-prozess-card wa-prozess-card--link">
                  {body}
                </Link>
              ) : (
                <div className="wa-prozess-card">{body}</div>
              )}
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
