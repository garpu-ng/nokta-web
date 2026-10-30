import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import PlateHead from "@/components/nokta/PlateHead";
import RidgeField from "@/components/nokta/RidgeField";
import SectionRule from "@/components/nokta/SectionRule";
import { getLocale, getT } from "@/lib/i18n";
import { serviceJsonLd, titleWithoutSite } from "@/lib/jsonld";
import { thumbAlt } from "@/lib/alt";
import { getMediaSize } from "@/lib/mediaSizes";
import { PROJECTS } from "@/lib/projects";
import { socialMetadata } from "@/lib/socialMeta";
import viz from "../3d-visualisierung/page.module.css";
import note from "../styles/audience.module.css";
import styles from "./page.module.css";

/* /bautraeger: rendered in the visitor's language (cookie, ?lang= or the
   toggle) via getT, with German fallback per key. Linked from the homepage hero
   and the footer; /fuer-bautraeger (the URL on the letters) 308s here. In the
   sitemap, and indexable.

   "Was wir brauchen" came over from the retired /fuer-bautraeger, with its
   keys (bt.needs.*, bt.need.*).

   The first five services are the ones the visualisation page already names.
   The last four are the same set the architect page carries, worded here
   for residential developers. Nothing here names a price, a deadline, a
   client or a city. */

const PATH = "/bautraeger";

const SERVICES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const STEPS = [0, 1, 2, 3] as const;
const NEEDS = [0, 1, 2, 3, 4] as const;

/* Housing projects already in lib/projects.ts, in the order the wall leads
   with them. A slug that is not in the file is skipped. */
const HOUSING = ["sanktgores", "beatbuilding", "binome"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.bautraeger.title");
  const description = t("meta.bautraeger.desc");
  return {
    title,
    description,
    alternates: { canonical: PATH },
    robots: { index: true, follow: true },
    ...socialMetadata({ title, description, locale, path: PATH }),
  };
}

export default async function BautraegerDraftPage() {
  const t = await getT();
  const locale = await getLocale();
  const title = `${t("bautraeger.heading")}.`;
  const projects = HOUSING.flatMap((slug) => {
    const project = PROJECTS.find((item) => item.slug === slug);
    return project ? [project] : [];
  });

  return (
    <main>
      <JsonLd
        data={serviceJsonLd({
          path: PATH,
          name: t("bautraeger.heading"),
          description: t("meta.bautraeger.desc"),
          serviceType: titleWithoutSite(t("meta.bautraeger.title")),
          inLanguage: locale,
        })}
      />
      <PlateHead title={title}>
        <RidgeField motto={title} />
      </PlateHead>

      <section className={styles.lede}>
        <p className={viz.body}>{t("bautraeger.lede")}</p>
      </section>

      <section className={viz.section} aria-labelledby="nk-bautraeger-svc">
        <SectionRule id="nk-bautraeger-svc" label={t("bautraeger.services")} />
        <div className={viz.uses}>
          {SERVICES.map((i) => (
            <Reveal key={i} delay={(i % 3) * 90}>
              <h3 className={viz.itemTitle}>{t(`bautraeger.svc.${i}.title`)}</h3>
              <p className={viz.itemText}>{t(`bautraeger.svc.${i}.text`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={viz.section} aria-labelledby="nk-bautraeger-work">
        <SectionRule id="nk-bautraeger-work" label={t("viz.work.label")} />
        <ul className={viz.works}>
          {projects.map((project, i) => {
            const { width, height } = getMediaSize(project.thumb);
            return (
              <Reveal as="li" key={project.slug} className={viz.work} delay={i * 90}>
                <Link href={`/arbeiten/${project.slug}`} className={viz.workLink}>
                  <span className={viz.workFrame}>
                    <Image
                      src={project.thumb}
                      alt={thumbAlt({ title: project.title, kind: "rendering" }, t)}
                      width={width}
                      height={height}
                      sizes="(max-width: 899px) calc(100vw - 40px), (max-width: 1199px) 45vw, 460px"
                      className={viz.workImg}
                    />
                  </span>
                  <span className={viz.workTitle}>{project.title}</span>
                  <span className={viz.workText}>{t(`projects.desc.${project.slug}`)}</span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className={viz.section} aria-labelledby="nk-bautraeger-steps">
        <SectionRule id="nk-bautraeger-steps" label={t("bautraeger.steps")} />
        <ol className={viz.steps}>
          {STEPS.map((i) => (
            <li key={i} className={viz.step}>
              <h3 className={viz.itemTitle}>{t(`viz.step.${i}.title`)}</h3>
              <p className={viz.itemText}>{t(`bautraeger.step.${i}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={viz.section} aria-labelledby="nk-bautraeger-needs">
        <SectionRule id="nk-bautraeger-needs" label={t("bt.needs.label")} />
        <div className={note.needs}>
          <p className={viz.itemText}>{t("bt.needs.text")}</p>
          <ul className={viz.services}>
            {NEEDS.map((i) => (
              <li key={i}>{t(`bt.need.${i}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={viz.cta}>
        <div>
          <p className={viz.ctaText}>{t("bt.cta.text")}</p>
          <p className={note.ctaNote}>{t("bt.cta.note")}</p>
        </div>
        <Link href="/kontakt?kind=visualisierung" className={viz.ctaFill}>
          {t("bt.cta.button")}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </section>
    </main>
  );
}
