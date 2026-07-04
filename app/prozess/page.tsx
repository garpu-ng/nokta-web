import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prozess — WaArchi",
};

const steps = [
  {
    number: "01",
    title: "Konzept & Referenzen",
    text: "Alles beginnt mit Ihrer Vision. Sie teilen uns Ihre Ideen, Pläne, Skizzen und Referenzbilder mit. In dieser Phase ist es unser Ziel, Ihre ästhetischen Vorstellungen und die funktionalen Anforderungen des Projekts vollständig zu verstehen, um eine solide Basis für die Visualisierung zu schaffen.",
    image: "/prozess/step1.jpg",
  },
  {
    number: "02",
    title: "3D-Modellierung",
    text: 'Basierend auf den gesammelten Informationen erstellen wir ein detailliertes 3D-Modell der Architektur und der Umgebung. Wir legen dabei höchsten Wert auf präzise Proportionen und saubere Geometrien. Sie erhalten erste Vorschau-Renderings in Rohform ("Clay Renders"), um Kameraperspektiven und den Bildausschnitt final festzulegen.',
    image: "/prozess/step2.jpg",
  },
  {
    number: "03",
    title: "Materialien & Licht",
    text: "Jetzt hauchen wir dem Modell Leben ein. Wir definieren Oberflächen mit fotorealistischen Materialien und setzen eine stimmungsvolle Lichtsituation um, die die gewünschte Atmosphäre erzeugt – sei es das warme Licht eines Sommertages oder die dramatische Beleuchtung der Dämmerung.",
    image: "/prozess/step3.jpg",
  },
  {
    number: "04",
    title: "Finale & Post-Production",
    text: "Nach Ihrer Freigabe rendern wir das Bild in hoher Auflösung. In der abschließenden Post-Production verfeinern wir Farben, Kontraste und Details, um die visuelle Wirkung zu maximieren und ein überzeugendes, emotional ansprechendes Endergebnis zu liefern, das Ihr Projekt perfekt in Szene setzt.",
    image: "/prozess/step4.jpg",
  },
];

export default function ProzessPage() {
  return (
    <div className="wa-prozess-page">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="wa-prozess-header">
        <h1 className="wa-prozess-heading">Wie wir arbeiten</h1>
        <p className="wa-prozess-intro">
          Von der ersten Skizze bis zum finalen Rendering begleiten wir Sie
          durch einen klar strukturierten Prozess — präzise, transparent und
          vollständig auf Ihr Projekt zugeschnitten.
        </p>
      </div>

      {/* ── Overview GIF ────────────────────────────────────────── */}
      <div className="wa-prozess-gif-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/prozess/howwework-stepbystep.gif.gif"
          alt="Prozess Übersicht"
          className="wa-prozess-hero-gif"
        />
      </div>

      {/* ── Steps ───────────────────────────────────────────────── */}
      <div className="wa-prozess-steps">
        {steps.map((step, i) => (
          <div
            key={step.number}
            className={`wa-prozess-step${i % 2 === 1 ? " wa-prozess-step--reverse" : ""}`}
          >
            <div className="wa-prozess-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={step.image} alt={step.title} className="wa-prozess-img" />
            </div>
            <div className="wa-prozess-text">
              <span className="wa-prozess-number">{step.number}</span>
              <h2 className="wa-prozess-title">{step.title}</h2>
              <p className="wa-prozess-body">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
