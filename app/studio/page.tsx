import type { Metadata } from "next";
import Link from "next/link";
import GifVideo from "@/components/GifVideo";
import Registration from "@/components/print/Registration";
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
        <div className="wa-studio-hero-headline">
          <h1 className="wa-studio-hero-heading">{t("studio.heading")}</h1>
          {/* Space Mono micro-caption, the studio's technical annotation voice. */}
          <p className="nk-mono-caption wa-studio-hero-caption">{t("studio.caption")}</p>
        </div>
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
            {/* Mert's portrait asset isn't in /public yet — there's no
                /flymemert.mp4 (the old /flymemert.gif 404'd too), so the other
                cards' <GifVideo> here rendered an empty frame. Until the asset
                lands, show a deliberate placeholder in the press-sheet vocabulary
                instead: an outlined portrait frame with a centred registration
                mark and a mono caption.

                TO SWAP IN THE REAL PORTRAIT: drop the converted clip at
                public/flymemert.mp4 and replace this whole <div.wa-team-placeholder>
                with the same line the other two cards use:
                  <GifVideo src="/flymemert.mp4" label="Mert" width={502} height={1014} className="wa-team-gif" /> */}
            <div className="wa-team-placeholder" aria-hidden="true">
              <Registration className="wa-team-placeholder-reg" />
              <span className="nk-mono-caption">{t("studio.mert.placeholder")}</span>
            </div>
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
