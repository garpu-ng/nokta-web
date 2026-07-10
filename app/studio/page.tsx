import type { Metadata } from "next";
import Link from "next/link";
import GifVideo from "@/components/GifVideo";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.studio.title"),
    description: t("meta.studio.desc"),
  };
}

export default async function StudioPage() {
  const t = await getT();
  return (
    <div className="wa-studio">

      {/* ── Hero: heading left, text right ──────────────────────── */}
      <section className="wa-studio-hero">
        <h1 className="wa-studio-hero-heading">{t("studio.heading")}</h1>
        <div className="wa-studio-hero-text">
          <p>{t("studio.p1")}</p>
          <p>{t("studio.p2")}</p>
          <p>{t("studio.p3")}</p>
        </div>
      </section>

      {/* ── Team ────────────────────────────────────────────────── */}
      <section className="wa-studio-section">
        <div className="wa-studio-label">{t("studio.team")}</div>
        <div className="wa-team-grid">

          <div className="wa-team-card">
            <GifVideo src="/flymekaan.mp4" label="Kaan" width={502} height={1014} className="wa-team-gif" />
            <div className="wa-team-info">
              <div className="wa-team-name">Kaan</div>
              <div className="wa-team-role">{t("studio.role.kaan")}</div>
            </div>
          </div>

          <div className="wa-team-card">
            <GifVideo src="/flymehammed.mp4" label="Mohammed" width={502} height={1014} className="wa-team-gif" />
            <div className="wa-team-info">
              <div className="wa-team-name">Mohammed</div>
              <div className="wa-team-role">{t("studio.role.mohammed")}</div>
            </div>
          </div>

          <div className="wa-team-card">
            {/* NOTE: the source asset for Mert has been missing from /public since
                before this change (the old /flymemert.gif 404'd too). Kept in the
                same converted-video form as the others for when the asset lands. */}
            <GifVideo src="/flymemert.mp4" label="Mert" width={502} height={1014} className="wa-team-gif" />
            <div className="wa-team-info">
              <div className="wa-team-name">Mert</div>
              <div className="wa-team-role">{t("studio.role.mert")}</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="wa-studio-cta">
        <span className="wa-studio-cta-text">{t("studio.cta")}</span>
        <div className="wa-studio-cta-links">
          <Link href="/prozess" className="wa-studio-cta-link">{t("studio.ctaProcess")}</Link>
          <Link href="/kontakt" className="wa-studio-cta-link">{t("studio.ctaWrite")}</Link>
        </div>
      </section>

    </div>
  );
}
