import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Studio · nokta",
  description: "nokta, Designstudio aus NRW mit drei Disziplinen: Design und Druck, Architekturvisualisierung und CAD-Liniendrucke.",
};

export default function StudioPage() {
  return (
    <div className="wa-studio">

      {/* ── Hero: heading left, text right ──────────────────────── */}
      <section className="wa-studio-hero">
        <h1 className="wa-studio-hero-heading">Studio</h1>
        <div className="wa-studio-hero-text">
          <p>
            nokta ist ein interdisziplinäres Designstudio aus Nordrhein-Westfalen.
            Ein Studio, drei Disziplinen: Layout und Druck, Architekturvisualisierung
            und CAD-Liniendrucke.
          </p>
          <p>
            Wir denken nicht in Schubladen. Wir bauen uns eigene Tools und
            Workflows, kombinieren unsere Skills über die Disziplinen hinweg und
            kommen so schnell zu vielen guten Ergebnissen. Statt einer Idee zeigen
            wir dir zehn.
          </p>
          <p>
            Angefangen haben wir mit Architekturvisualisierung. Heute ist sie
            einer von mehreren Bausteinen: fotorealistische 3D-Renderings mit
            Gespür für Licht, Material und Raum. Dein Projekt, wie es später
            aussieht. Lange bevor der erste Stein liegt.
          </p>
        </div>
      </section>

      {/* ── Team ────────────────────────────────────────────────── */}
      <section className="wa-studio-section">
        <div className="wa-studio-label">Das Team</div>
        <div className="wa-team-grid">

          <div className="wa-team-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/flymekaan.gif" alt="Kaan" className="wa-team-gif" />
            <div className="wa-team-info">
              <div className="wa-team-name">Kaan</div>
              <div className="wa-team-role">Design · Konzept</div>
            </div>
          </div>

          <div className="wa-team-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/flymehammed.gif" alt="Mohammed" className="wa-team-gif" />
            <div className="wa-team-info">
              <div className="wa-team-name">Mohammed</div>
              <div className="wa-team-role">3D · Visualisierung</div>
            </div>
          </div>

          <div className="wa-team-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/flymemert.gif" alt="Mert" className="wa-team-gif" />
            <div className="wa-team-info">
              <div className="wa-team-name">Mert</div>
              <div className="wa-team-role">Layout · Druck</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="wa-studio-cta">
        <span className="wa-studio-cta-text">Projekt in Planung?</span>
        <div className="wa-studio-cta-links">
          <Link href="/prozess" className="wa-studio-cta-link">Unser Prozess</Link>
          <Link href="/kontakt" className="wa-studio-cta-link">Schreib uns</Link>
        </div>
      </section>

    </div>
  );
}
