import type { Metadata } from "next";
import Image from "next/image";
import GifVideo from "@/components/GifVideo";
import { getMediaSize } from "@/lib/mediaSizes";
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
        {/* Was a 680 KB animated GIF; now an H.264 loop. Opaque source, so mp4 is
            safe (no alpha). CSS (.wa-prozess-hero-gif: 500×500, object-fit cover)
            governs the rendered size. */}
        <GifVideo
          src="/prozess/howwework-stepbystep.mp4"
          label={t("prozess.gifAlt")}
          width={1440}
          height={1498}
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
              <Image
                src={step.image}
                alt={step.title}
                width={getMediaSize(step.image).width}
                height={getMediaSize(step.image).height}
                sizes="(max-width: 767px) 100vw, 50vw"
                className="wa-prozess-img"
              />
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
