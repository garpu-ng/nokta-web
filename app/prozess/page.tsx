import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PlateHead from "@/components/nokta/PlateHead";
import PlotField from "@/components/nokta/PlotField";
import { getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import styles from "./page.module.css";

/* The process page — four cards, one per material, mirroring the studio's
   four service rows (same nokta.svc.* copy, stated once and reused), and then
   the first of the four workflows written out in full.

   Ablauf 01 IS this page's substance: /prozess/3d used to carry it on its own
   route and now redirects here, so card 01 scrolls to the section rather than
   navigating away. The other three cards stand as cards until their write-ups
   exist — no teaser links, no "coming soon". */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("meta.prozess.title") };
}

/** The anchor Ablauf 01 answers to — card 01 and /prozess/3d both aim here. */
const ABLAUF = "ablauf-01";

const CARDS = [0, 1, 2, 3] as const;

const STEP_IMAGES = [
  "/prozess/step1.jpg",
  "/prozess/step2.jpg",
  "/prozess/step3.jpg",
  "/prozess/step4.jpg",
];

export default async function ProzessPage() {
  const t = await getT();

  const steps = STEP_IMAGES.map((image, i) => ({
    number: String(i + 1).padStart(2, "0"),
    title: t(`prozess.step.${i + 1}.title`),
    text: t(`prozess.step.${i + 1}.text`),
    image,
  }));

  // Two lines in the markup it replaces; one line in the plate, which wraps
  // it itself if the plate is too narrow to set it across.
  const title = `${t("prozess.heading.line1")} ${t("prozess.heading.line2")}.`;

  return (
    <main>
      {/* The page about how the work gets made is headed by the only plate in
          the family that is not a picture of a state: pens walking the field,
          dragging finite trails, so the drawing is always in the middle of
          happening. See components/nokta/PlotField.tsx. */}
      <PlateHead title={title}>
        <PlotField motto={title} />
      </PlateHead>

      <section className={styles.head}>
        <p className={styles.intro}>{t("prozess.index.intro")}</p>
      </section>

      {/* ── Four materials ─────────────────────────────────────────── */}
      <ul className={styles.cards}>
        {CARDS.map((svc, i) => {
          const folio = String(svc + 1).padStart(2, "0");
          const body = (
            <>
              <span className={styles.cardFolio}>{folio}</span>
              <h2 className={styles.cardTitle}>{t(`nokta.svc.${svc}.title`)}</h2>
              <p className={styles.cardText}>{t(`nokta.svc.${svc}.short`)}</p>
            </>
          );
          return (
            // Two-up on tablet, so the cards arrive in pairs — left, then right.
            <Reveal as="li" key={svc} className={styles.cardCell} delay={(i % 2) * 90}>
              {svc === 0 ? (
                <Link href={`#${ABLAUF}`} className={`${styles.card} ${styles.cardLink}`}>
                  {body}
                </Link>
              ) : (
                <div className={styles.card}>{body}</div>
              )}
            </Reveal>
          );
        })}
      </ul>

      {/* ── Ablauf 01, written out ─────────────────────────────────── */}
      <section aria-labelledby={ABLAUF}>
        <div className={styles.ablaufHead}>
          <h2 id={ABLAUF} className={styles.ablaufTitle}>
            {t("prozess.ablauf.title")}
          </h2>
          <p className={styles.ablaufNote}>{t("prozess.ablauf.note")}</p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, i) => {
            const { width, height } = getMediaSize(step.image);
            return (
              <Reveal
                key={step.number}
                // Steps 02 and 04 put the plate on the right — the eye crosses
                // the page four times instead of running down one edge.
                className={`${styles.step}${i % 2 === 1 ? ` ${styles.stepMirror}` : ""}`}
                delay={i * 90}
              >
                <div className={styles.stepPlate}>
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={width}
                    height={height}
                    sizes="(max-width: 899px) 100vw, 46vw"
                    className={styles.stepImg}
                  />
                </div>
                <div className={styles.stepText}>
                  <p className={styles.stepRule}>
                    <span className={styles.stepNumber}>
                      {t("prozess.step.label")} {step.number}
                    </span>
                    <span className={styles.stepHair} aria-hidden="true" />
                  </p>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── CTA — the page's one red field ─────────────────────────── */}
      <section className={styles.cta}>
        <p className={styles.ctaText}>{t("prozess.cta")}</p>
        <Link href="/kontakt" className={styles.ctaLink}>
          {t("home.contact.cta")}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </section>
    </main>
  );
}
