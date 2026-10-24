import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import DiscField from "@/components/nokta/DiscField";
import PlateHead from "@/components/nokta/PlateHead";
import SectionRule from "@/components/nokta/SectionRule";
import { KIND_FIELD } from "@/lib/colors";
import { getLocale, getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS } from "@/lib/works";
import viz from "../3d-visualisierung/page.module.css";
import styles from "./page.module.css";

/* /fuer-bautraeger: the page the letters and mails to developers point at.
   It says what they get and how to ask. Same sheet as /3d-visualisierung
   (its stylesheet is reused, nothing new invented). Payment terms and the
   schedule are not stated here. They are set in the quote for each project.

   The renderings carry kind and year only. Who they were made for is a
   question the wall answers; this page makes no claim about clients. */

const PATH = "/fuer-bautraeger";

const PALETTE = [KIND_FIELD.rendering];

const FACTS = [0, 1, 2, 3];
const STEPS = [0, 1, 2, 3];
const NEEDS = [0, 1, 2, 3, 4];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.bt.title");
  const description = t("meta.bt.desc");
  return {
    title,
    description,
    alternates: { canonical: PATH },
    ...socialMetadata({ title, description, locale, path: PATH }),
  };
}

export default async function BautraegerPage() {
  const t = await getT();
  const title = `${t("bt.heading")}.`;
  const renderings = WORKS.filter((w) => w.kind === "rendering").slice(0, 3);

  return (
    <main>
      <PlateHead title={title}>
        <DiscField palette={PALETTE} motto={title} />
      </PlateHead>

      {/* Opening: what it is, and the four facts at a glance */}
      <section className={viz.opening}>
        <p className={viz.claim}>{t("bt.claim")}</p>
        <div className={viz.openingText}>
          <p className={viz.body}>{t("bt.lead")}</p>
          <ul className={viz.services} aria-label={t("bt.facts.label")}>
            {FACTS.map((i) => (
              <li key={i}>{t(`bt.fact.${i}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ablauf: a real sequence, so it is numbered */}
      <section className={viz.section} aria-labelledby="nk-bt-steps">
        <SectionRule id="nk-bt-steps" label={t("bt.steps.label")} />
        <ol className={viz.steps}>
          {STEPS.map((i) => (
            <li key={i} className={viz.step}>
              <span className={viz.stepNo} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={viz.itemTitle}>{t(`bt.step.${i}.title`)}</h3>
              <p className={viz.itemText}>{t(`bt.step.${i}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Was wir brauchen */}
      <section className={viz.section} aria-labelledby="nk-bt-needs">
        <SectionRule id="nk-bt-needs" label={t("bt.needs.label")} />
        <div className={styles.needs}>
          <p className={viz.itemText}>{t("bt.needs.text")}</p>
          <ul className={viz.services}>
            {NEEDS.map((i) => (
              <li key={i}>{t(`bt.need.${i}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Three renderings, as a sample of the work */}
      <section className={viz.section} aria-labelledby="nk-bt-work">
        <SectionRule id="nk-bt-work" label={t("bt.work.label")} />
        <ul className={viz.works}>
          {renderings.map((work, i) => {
            const { width, height } = getMediaSize(work.thumb);
            return (
              <Reveal as="li" key={work.slug} className={viz.work} delay={i * 90}>
                <Link href={`/arbeiten/${work.slug}`} className={viz.workLink}>
                  <span className={viz.workFrame}>
                    <Image
                      src={work.thumb}
                      alt=""
                      width={width}
                      height={height}
                      sizes="(max-width: 899px) calc(100vw - 40px), (max-width: 1199px) 45vw, 460px"
                      className={viz.workImg}
                    />
                  </span>
                  <span className={viz.workTitle}>{work.title}</span>
                  <span className={viz.workAnno}>
                    {t(`work.kind.${work.kind}`)} · {work.year}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
        <p className={styles.more}>
          <Link href="/3d-visualisierung" className={styles.moreLink}>
            {t("bt.work.more")}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </p>
      </section>

      {/* CTA: the inquiry opens with visualisation already chosen */}
      <section className={viz.cta}>
        <div>
          <p className={viz.ctaText}>{t("bt.cta.text")}</p>
          <p className={styles.ctaNote}>{t("bt.cta.note")}</p>
        </div>
        <Link href="/kontakt?kind=visualisierung" className={viz.ctaFill}>
          {t("bt.cta.button")}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </section>
    </main>
  );
}
