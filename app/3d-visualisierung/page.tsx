import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import DiscField from "@/components/nokta/DiscField";
import PlateHead from "@/components/nokta/PlateHead";
import SectionRule from "@/components/nokta/SectionRule";
import { workAnnotation } from "@/components/work/WorkAnno";
import { KIND_FIELD } from "@/lib/colors";
import { getLocale, getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS } from "@/lib/works";
import styles from "./page.module.css";

/* /3d-visualisierung: the one page that states the visualisation service in
   words. The wall shows the renderings; this page says what they are, who they
   are for, how a job runs and what it costs to ask. It exists so a search for
   "3D-Visualisierung Düsseldorf" has a page that answers it.

   Same register as every other page: say what it is. No prices, no delivery
   times and no tools are named, because none of them are fixed. */

const PATH = "/3d-visualisierung";
const SITE = "https://www.nokta-studio.de";

/* The archviz colour alone: this page is one material. Module scope so the
   plate gets one array reference for the life of the page. */
const PALETTE = [KIND_FIELD.rendering];

const USES = [0, 1, 2];
const STEPS = [0, 1, 2, 3];
const SERVICES = [0, 1, 2, 3, 4];
const FAQ = [0, 1, 2, 3];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.viz.title");
  const description = t("meta.viz.desc");
  return {
    title,
    description,
    alternates: { canonical: PATH },
    ...socialMetadata({ title, description, locale, path: PATH }),
  };
}

/** schema.org Service, provided by the studio the root layout describes. */
function serviceJsonLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}${PATH}#service`,
    name,
    serviceType: "3D-Visualisierung",
    description,
    url: `${SITE}${PATH}`,
    provider: { "@id": `${SITE}/#studio` },
    areaServed: [
      { "@type": "City", name: "Düsseldorf" },
      { "@type": "State", name: "Nordrhein-Westfalen" },
    ],
  };
}

export default async function VisualisierungPage() {
  const t = await getT();
  const title = `${t("viz.heading")}.`;
  const renderings = WORKS.filter((w) => w.kind === "rendering");

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd(t("viz.heading"), t("meta.viz.desc"))).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <PlateHead title={title}>
        <DiscField palette={PALETTE} motto={title} />
      </PlateHead>

      {/* ── Opening: what it is, for whom ─────────────────────────────── */}
      <section className={styles.opening}>
        <p className={styles.claim}>{t("viz.claim")}</p>
        <div className={styles.openingText}>
          <p className={styles.body}>{t("viz.lead")}</p>
          <ul className={styles.services} aria-label={t("viz.services.label")}>
            {SERVICES.map((i) => (
              <li key={i}>{t(`viz.svc.${i}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Wofür ────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="nk-viz-use">
        <SectionRule id="nk-viz-use" label={t("viz.use.label")} />
        <div className={styles.uses}>
          {USES.map((i) => (
            <Reveal key={i} className={styles.use} delay={i * 90}>
              <h3 className={styles.itemTitle}>{t(`viz.use.${i}.title`)}</h3>
              <p className={styles.itemText}>{t(`viz.use.${i}.text`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Ablauf: a real sequence, so it is numbered ─────────────────── */}
      <section className={styles.section} aria-labelledby="nk-viz-steps">
        <SectionRule id="nk-viz-steps" label={t("viz.steps.label")} />
        <ol className={styles.steps}>
          {STEPS.map((i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepNo} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.itemTitle}>{t(`viz.step.${i}.title`)}</h3>
              <p className={styles.itemText}>{t(`viz.step.${i}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── The renderings, each with its own line ─────────────────────── */}
      <section className={styles.section} aria-labelledby="nk-viz-work">
        <SectionRule id="nk-viz-work" label={t("viz.work.label")} />
        <ul className={styles.works}>
          {renderings.map((work, i) => {
            const { width, height } = getMediaSize(work.thumb);
            const anno = workAnnotation(work, t);
            return (
              <Reveal as="li" key={work.slug} className={styles.work} delay={(i % 3) * 90}>
                <Link href={`/arbeiten/${work.slug}`} className={styles.workLink}>
                  <span className={styles.workFrame}>
                    <Image
                      src={work.thumb}
                      alt=""
                      width={width}
                      height={height}
                      sizes="(max-width: 899px) calc(100vw - 40px), (max-width: 1199px) 45vw, 460px"
                      className={styles.workImg}
                    />
                  </span>
                  <span className={styles.workTitle}>{work.title}</span>
                  <span className={styles.workAnno}>
                    {anno.kind} · {anno.year} · {anno.client}
                  </span>
                  <span className={styles.workText}>{t(`projects.desc.${work.slug}`)}</span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* ── Häufige Fragen ─────────────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="nk-viz-faq">
        <SectionRule id="nk-viz-faq" label={t("viz.faq.label")} />
        <div className={styles.faq}>
          {FAQ.map((i) => (
            <div key={i} className={styles.faqItem}>
              <h3 className={styles.itemTitle}>{t(`viz.faq.${i}.q`)}</h3>
              <p className={styles.itemText}>{t(`viz.faq.${i}.a`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA: the inquiry opens with visualisation already chosen ───── */}
      <section className={styles.cta}>
        <p className={styles.ctaText}>{t("viz.cta.text")}</p>
        <Link href="/kontakt?kind=visualisierung" className={styles.ctaFill}>
          {t("viz.cta.button")}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </section>
    </main>
  );
}
