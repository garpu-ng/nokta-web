import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prozess · nokta",
};

const steps = [
  {
    number: "01",
    title: "Konzept & Referenzen",
    text: "Am Anfang steht deine Idee. Du schickst uns Pläne, Skizzen und Referenzen, und wir klären gemeinsam, wie das Bild später wirken soll. So steht die Basis, bevor wir loslegen.",
    image: "/prozess/step1.jpg",
  },
  {
    number: "02",
    title: "3D-Modellierung",
    text: 'Aus deinen Unterlagen bauen wir ein detailliertes 3D-Modell von Gebäude und Umgebung, mit sauberen Proportionen und Geometrien. Du bekommst erste Rohansichten ("Clay Renders"), damit wir Perspektive und Bildausschnitt gemeinsam festlegen.',
    image: "/prozess/step2.jpg",
  },
  {
    number: "03",
    title: "Materialien & Licht",
    text: "Jetzt kommt Leben ins Modell. Wir legen fotorealistische Materialien an und setzen das Licht so, dass die Stimmung passt: mal das warme Licht eines Sommertags, mal die Dämmerung.",
    image: "/prozess/step3.jpg",
  },
  {
    number: "04",
    title: "Finale & Post-Production",
    text: "Nach deiner Freigabe rendern wir in hoher Auflösung. In der Post-Production ziehen wir Farben, Kontraste und Details nach, bis das Bild sitzt und dein Projekt genau so zeigt, wie es soll.",
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
          Von der ersten Skizze bis zum fertigen Bild: ein klarer Ablauf. Mit
          eigenem Setup kommen wir schnell zu vielen Varianten, du entscheidest.
        </p>
      </div>

      {/* ── Overview GIF ────────────────────────────────────────── */}
      <div className="wa-prozess-gif-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/prozess/howwework-stepbystep.gif.gif"
          alt="Prozess im Überblick"
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
