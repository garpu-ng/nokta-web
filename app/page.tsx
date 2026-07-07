import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { BRANCHES } from "@/lib/branches";
import TeaserVideo from "@/components/TeaserVideo";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.home.title"),
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const t = await getT();
  return (
    <div className="nk-home">
      {/* Teaser banner — tab-width, footage with the wordmark centred on it. */}
      <TeaserVideo />

      {/* Black pillar — video-wide, extends from below the video to the footer */}
      <div className="nk-pillar">
        <main className="nk-landing">
          <p className="nk-landing-lead">{t("home.lead")}</p>

          <div className="nk-branch-grid">
            {BRANCHES.map((b) => (
              <Link
                key={b.key}
                href={b.path}
                className="nk-branch-card"
                style={{ "--accent": b.accent } as CSSProperties}
              >
                <span className="nk-branch-card__key">
                  nokta.{b.label}
                  <span className="nk-dot">.</span>
                </span>
                <span className="nk-branch-card__tag">{t(`branch.${b.key}.tag`)}</span>
                <span className="nk-branch-card__desc">{t(`branch.${b.key}.desc`)}</span>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
