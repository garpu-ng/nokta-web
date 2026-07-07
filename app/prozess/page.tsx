import type { Metadata } from "next";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("meta.prozess.title") };
}

const stepImages = [
  "/prozess/step1.jpg",
  "/prozess/step2.jpg",
  "/prozess/step3.jpg",
  "/prozess/step4.jpg",
];

export default async function ProzessPage() {
  const t = await getT();
  const steps = stepImages.map((image, i) => ({
    number: String(i + 1).padStart(2, "0"),
    title: t(`prozess.step.${i + 1}.title`),
    text: t(`prozess.step.${i + 1}.text`),
    image,
  }));

  return (
    <div className="wa-prozess-page">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="wa-prozess-header">
        <h1 className="wa-prozess-heading">{t("prozess.heading")}</h1>
        <p className="wa-prozess-intro">{t("prozess.intro")}</p>
      </div>

      {/* ── Overview GIF ────────────────────────────────────────── */}
      <div className="wa-prozess-gif-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/prozess/howwework-stepbystep.gif.gif"
          alt={t("prozess.gifAlt")}
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
