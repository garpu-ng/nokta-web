import type { Metadata } from "next";
import { BRANCH_BY_KEY } from "@/lib/branches";

const branch = BRANCH_BY_KEY.nokta;

export const metadata: Metadata = {
  title: "nokta · Layout, Design und Druck",
  description: branch.desc,
  alternates: { canonical: "/nokta" },
};

const services = [
  {
    title: "Branding & Identity",
    text: "Logo, Wortmarke und ein System, das überall funktioniert. Sauber gedacht, schnell umgesetzt.",
  },
  {
    title: "Editorial & Layout",
    text: "Broschüren, Portfolios und Publikationen. Typografie mit Rhythmus und Luft.",
  },
  {
    title: "Druckvorlagen",
    text: "Druckreife Dateien mit korrektem Beschnitt, Farbraum und Veredelung für jede Auflage.",
  },
  {
    title: "Poster & Plakat",
    text: "Großformate, die aus der Nähe und aus der Ferne knallen.",
  },
];

export default function NoktaPage() {
  return (
    <main className="nk-branch">
      <header className="nk-branch-head">
        <h1 className="nk-branch-title">
          nokta.nokta<span className="nk-dot">.</span>
        </h1>
        <p className="nk-branch-tag">{branch.tagline}</p>
        <p className="nk-branch-lead">{branch.desc}</p>
      </header>

      <div className="nk-service-grid">
        {services.map((s) => (
          <div key={s.title} className="nk-service">
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
