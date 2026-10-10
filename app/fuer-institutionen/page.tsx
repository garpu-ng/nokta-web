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
import { getWork } from "@/lib/works";
import viz from "../3d-visualisierung/page.module.css";
import styles from "../fuer-bautraeger/page.module.css";

/* /fuer-institutionen: the page the editorial letters point at. Ministries,
   commissions, foundations and associations that publish reports. It says
   what the studio takes over, how a job runs and how the price is set, and
   shows the one editorial commission there is: the final report of the
   KI-Kommission at the BMWE.

   The price is named as a method (a fixed price by page count, in writing
   before work starts), not as a figure. Nothing is claimed that the studio
   has not delivered. */

const PATH = "/fuer-institutionen";
const REF = "abschlussbericht-ki-kommission";

const PALETTE = [KIND_FIELD.editorial];

const FACTS = [0, 1, 2, 3, 4];
const SCOPE = [0, 1, 2, 3];
const STEPS = [0, 1, 2, 3];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.inst.title");
  const description = t("meta.inst.desc");
  return {
    title,
    description,
    alternates: { canonical: PATH },
    ...socialMetadata({ title, description, locale, path: PATH }),
  };
}

export default async function InstitutionenPage() {
  const t = await getT();
  const title = `${t("inst.heading")}.`;
  const ref = getWork(REF);
  if (!ref) throw new Error(`app/fuer-institutionen: no work "${REF}" in lib/works.ts`);
  const { width, height } = getMediaSize(ref.thumb);
  const anno = workAnnotation(ref, t);

  return (
    <main>
      <PlateHead title={title}>
        <DiscField palette={PALETTE} motto={title} />
      </PlateHead>

      {/* Opening: what it is, for whom */}
      <section className={viz.opening}>
        <p className={viz.claim}>{t("inst.claim")}</p>
        <div className={viz.openingText}>
          <p className={viz.body}>{t("inst.lead")}</p>
          <ul className={viz.services} aria-label={t("inst.facts.label")}>
            {FACTS.map((i) => (
              <li key={i}>{t(`inst.fact.${i}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Referenz */}
      <section className={viz.section} aria-labelledby="nk-inst-ref">
        <SectionRule id="nk-inst-ref" label={t("inst.ref.label")} />
        <Reveal>
          <Link href={`/arbeiten/${ref.slug}`} className={styles.ref}>
            <span className={styles.refFrame}>
              <Image
                src={ref.thumb}
                alt=""
                width={width}
                height={height}
                sizes="(max-width: 899px) calc(100vw - 40px), 560px"
                className={styles.refImg}
              />
            </span>
            <span className={styles.refText}>
              <span className={viz.workTitle}>{ref.title}</span>
              <span className={viz.workAnno}>
                {anno.kind} · {anno.year} · {anno.client}
              </span>
              <span className={viz.itemText}>{t("inst.ref.text")}</span>
              <span className={styles.moreLink}>
                {t("inst.ref.more")}
                <span aria-hidden="true"> ↗</span>
              </span>
            </span>
          </Link>
        </Reveal>
      </section>

      {/* Was wir übernehmen */}
      <section className={viz.section} aria-labelledby="nk-inst-scope">
        <SectionRule id="nk-inst-scope" label={t("inst.scope.label")} />
        <div className={viz.faq}>
          {SCOPE.map((i) => (
            <div key={i} className={viz.faqItem}>
              <h3 className={viz.itemTitle}>{t(`inst.scope.${i}.title`)}</h3>
              <p className={viz.itemText}>{t(`inst.scope.${i}.text`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ablauf */}
      <section className={viz.section} aria-labelledby="nk-inst-steps">
        <SectionRule id="nk-inst-steps" label={t("inst.steps.label")} />
        <ol className={viz.steps}>
          {STEPS.map((i) => (
            <li key={i} className={viz.step}>
              <span className={viz.stepNo} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={viz.itemTitle}>{t(`inst.step.${i}.title`)}</h3>
              <p className={viz.itemText}>{t(`inst.step.${i}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA: the inquiry opens with editorial already chosen */}
      <section className={viz.cta}>
        <div>
          <p className={viz.ctaText}>{t("inst.cta.text")}</p>
          <p className={styles.ctaNote}>{t("inst.cta.note")}</p>
        </div>
        <Link href="/kontakt?kind=editorial" className={viz.ctaFill}>
          {t("inst.cta.button")}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </section>
    </main>
  );
}
