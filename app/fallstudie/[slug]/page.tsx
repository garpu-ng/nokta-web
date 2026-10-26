import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import DiscField from "@/components/nokta/DiscField";
import PlateHead from "@/components/nokta/PlateHead";
import SectionRule from "@/components/nokta/SectionRule";
import { KIND_FIELD } from "@/lib/colors";
import { CASE_STUDIES, getCaseStudy } from "@/lib/caseStudies";
import { getLocale, getT, type Translate } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { socialMetadata } from "@/lib/socialMeta";
import viz from "../../3d-visualisierung/page.module.css";
import styles from "./page.module.css";

/* /fallstudie/[slug]: a short reading of one project that is already on the
   wall. The text says how those images can be used. It does not claim that a
   developer or an office used them that way, and it does not name a client.

   Two slugs only. Anything else is a 404. */

const PATH = "/fallstudie";
const EMAIL = "hallo@nokta-studio.de";
const PALETTE = [KIND_FIELD.rendering];

const SECTIONS = ["situation", "images", "use"] as const;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

/** The shot's own line, with the project title in front for the alt. */
function shotText(slug: string, title: string, i: number, t: Translate) {
  const key = `projects.alt.${slug}.${i + 1}`;
  const line = t(key);
  const caption = line !== key ? line : t("projects.imageAlt").replace("{n}", String(i + 1));
  return { alt: `${title}, ${caption}`, caption };
}

/** The address is the same in every language, so it can become a real link
    without splitting the sentence per locale. */
function withMail(text: string) {
  const parts = text.split(EMAIL);
  if (parts.length !== 2) return text;
  return (
    <>
      {parts[0]}
      <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      {parts[1]}
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};

  const t = await getT();
  const locale = await getLocale();
  const title = t(`meta.case.${study.audience}.title`);
  const description = t(`meta.case.${study.audience}.desc`);
  const path = `${PATH}/${study.slug}`;
  const { width, height } = getMediaSize(study.project.thumb);
  const social = socialMetadata({ title, description, locale, path });

  return {
    title,
    description,
    alternates: { canonical: path },
    ...social,
    openGraph: {
      ...social.openGraph,
      images: [{ url: study.project.thumb, width, height, alt: study.project.title }],
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const t = await getT();
  const { project, audience } = study;
  const title = `${project.title}.`;
  const audienceLabel = audience === "bt" ? t("bt.heading") : t("case.arch.for");
  const sizes = project.images.map((src) => getMediaSize(src));
  const pair = sizes.every((size) => size.height > size.width);

  return (
    <main>
      <PlateHead title={title}>
        <DiscField palette={PALETTE} motto={title} />
      </PlateHead>

      <section className={viz.opening}>
        <div>
          <p className={styles.kicker}>
            <span className="nk-caption">
              {t("case.kicker")} · {audienceLabel}
            </span>
          </p>
          <p className={styles.motto}>{t("home.hero.title")}</p>
          <p className={viz.claim}>{t(`case.${audience}.claim`)}</p>
        </div>
        <div className={viz.openingText}>
          <ul className={viz.services} aria-label={t("bt.facts.label")}>
            <li>
              {t("point.case.facts.year.label")}: {project.year}
            </li>
            <li>
              {t("projects.label.service")}: {t(`projects.service.${project.slug}`)}
            </li>
            <li>
              {t("projects.label.scope")}: {t(`projects.scope.${project.slug}`)}
            </li>
          </ul>
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section key={section} className={viz.section} aria-labelledby={`nk-case-${section}`}>
          <SectionRule id={`nk-case-${section}`} label={t(`case.section.${section}`)} />
          <div className={styles.prose}>
            <p>{t(`case.${audience}.${section}`)}</p>
          </div>
          {section === "images" ? (
            <ul className={pair ? `${styles.shots} ${styles.shotsPair}` : styles.shots}>
              {project.images.map((src, i) => {
                const { width, height } = sizes[i];
                const { alt, caption } = shotText(project.slug, project.title, i, t);
                return (
                  <Reveal as="li" key={src} className={styles.shot} delay={(i % 2) * 90}>
                    <figure>
                      <span className={styles.frame}>
                        <Image
                          src={src}
                          alt={alt}
                          width={width}
                          height={height}
                          sizes={
                            pair
                              ? "(max-width: 899px) calc(100vw - 40px), 46vw"
                              : "(max-width: 899px) calc(100vw - 40px), min(1100px, calc(100vw - 80px))"
                          }
                          className={styles.img}
                        />
                      </span>
                      <figcaption className={styles.caption}>
                        <span className={styles.folio}>{String(i + 1).padStart(2, "0")}</span>
                        <span>{caption}</span>
                      </figcaption>
                    </figure>
                  </Reveal>
                );
              })}
            </ul>
          ) : null}
        </section>
      ))}

      <nav className={styles.links} aria-label={t("case.links.aria")}>
        <Link href={`/arbeiten/${project.slug}`} className={styles.textLink}>
          {t("inst.ref.more")}
          <span aria-hidden="true"> ↗</span>
        </Link>
        <Link href={study.audienceHref} className={styles.textLink}>
          {t(study.audienceLabelKey)}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </nav>

      <section className={viz.cta}>
        <p className={styles.note}>{withMail(t(`case.${audience}.contact`))}</p>
        <Link href="/kontakt?kind=visualisierung" className={viz.ctaFill}>
          {t("bt.cta.button")}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </section>
    </main>
  );
}
