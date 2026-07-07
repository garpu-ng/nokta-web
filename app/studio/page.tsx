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
            nokta ist ein Designstudio aus Nordrhein-Westfalen. Ein Studio,
            drei Disziplinen: Layout und Druck, Architekturvisualisierung und
            CAD-Liniendrucke.
          </p>
          <p>
            Angefangen haben wir mit Architekturvisualisierung, und die bleibt
            einer unserer Bausteine: fotorealistische 3D-Renderings für
            Architekten, Bauträger und Privatpersonen. Wir haben ein Gespür für
            Licht, Material und Raum und zeigen dein Projekt, wie es später
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
              <div className="wa-team-role">Visualisierung · Konzept</div>
            </div>
          </div>

          <div className="wa-team-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/flymehammed.gif" alt="Mohammed" className="wa-team-gif" />
            <div className="wa-team-info">
              <div className="wa-team-name">Mohammed</div>
              <div className="wa-team-role">3D · Rendering</div>
            </div>
          </div>

          <div className="wa-team-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/flymemert.gif" alt="Mert" className="wa-team-gif" />
            <div className="wa-team-info">
              <div className="wa-team-name">Mert</div>
              <div className="wa-team-role">Platzhalter · TBD</div>
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
