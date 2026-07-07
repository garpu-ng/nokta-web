import type { Metadata } from "next";
import Link from "next/link";
import { PRINTS } from "@/lib/prints";
import { BRANCH_BY_KEY } from "@/lib/branches";

const branch = BRANCH_BY_KEY.line;

export const metadata: Metadata = {
  title: "nokta.line · CAD-Kunstdrucke",
  description: branch.desc,
  alternates: { canonical: "/line" },
};

export default function LinePage() {
  return (
    <main className="nk-branch">
      <header className="nk-branch-head">
        <h1 className="nk-branch-title">
          nokta.line<span className="nk-dot">.</span>
        </h1>
        <p className="nk-branch-tag">{branch.tagline}</p>
        <p className="nk-branch-lead">
          Ikonische Bauwerke als technische Zeichnung: vektorisierte
          CAD-Liniendrucke, gedruckt in A1, gerahmt und bereit für die Wand.
          Jeder Druck 100&nbsp;€.
        </p>
      </header>

      <div className="nk-print-grid">
        {PRINTS.map((print) => (
          <Link key={print.slug} href={`/line/${print.slug}`} className="nk-print">
            <div className="nk-print__art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={print.image} alt={print.title} loading="lazy" />
            </div>
            <div className="nk-print__body">
              <span className="nk-print__name">{print.title}</span>
              <span className="nk-print__meta">
                {print.subtitle} · {print.year}
              </span>
              <div className="nk-print__buy">
                <span className="nk-print__price">{print.price} €</span>
                <span className="nk-print__cta">Ansehen →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
