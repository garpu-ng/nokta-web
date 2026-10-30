import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import PlateHead from "@/components/nokta/PlateHead";
import RidgeField from "@/components/nokta/RidgeField";
import SectionRule from "@/components/nokta/SectionRule";
import { serviceJsonLd, titleWithoutSite } from "@/lib/jsonld";
import { thumbAlt } from "@/lib/alt";
import { getMediaSize } from "@/lib/mediaSizes";
import { PROJECTS } from "@/lib/projects";
import de from "@/messages/de";
import viz from "../3d-visualisierung/page.module.css";
import note from "../styles/audience.module.css";
import styles from "./page.module.css";

/* /architekturbueros: German only, on every language cookie, because the
   copy is read from messages/de.ts and nowhere else. Linked from the homepage
   hero and the footer. In the sitemap, and indexable.

   The first five services, the project titles and the contact lines are ones
   the site already uses. Nothing here names a price, a deadline, a client
   or a city. */

const PATH = "/architekturbueros";

const SERVICES = [0, 1, 2, 3, 4] as const;
const MORE = [0, 1, 2, 3] as const;
const STEPS = [0, 1, 2, 3] as const;

/* Projects already in lib/projects.ts whose descriptions are architectural
   work. A slug that is not in the file is skipped. */
const HOUSES = ["beatbuilding", "binome", "ipehouse"] as const;

function line(key: string): string {
  return de[key] ?? key;
}

export const metadata: Metadata = {
  title: line("meta.architekturbueros.title"),
  description: line("meta.architekturbueros.desc"),
  alternates: { canonical: PATH },
};

export default function ArchitekturbuerosDraftPage() {
  const title = `${line("architekturbueros.heading")}.`;
  const projects = HOUSES.flatMap((slug) => {
    const project = PROJECTS.find((item) => item.slug === slug);
    return project ? [project] : [];
  });

  return (
    <main>
      {/* German on every language cookie, same as the copy below. */}
      <JsonLd
        data={serviceJsonLd({
          path: PATH,
          name: line("architekturbueros.heading"),
          description: line("meta.architekturbueros.desc"),
          serviceType: titleWithoutSite(line("meta.architekturbueros.title")),
          inLanguage: "de",
        })}
      />
      <PlateHead title={title}>
        <RidgeField motto={title} />
      </PlateHead>

      <section className={styles.lede}>
        <p className={viz.body}>{line("architekturbueros.lede")}</p>
      </section>

      <section className={viz.section} aria-labelledby="nk-architekturbueros-svc">
        <SectionRule id="nk-architekturbueros-svc" label={line("architekturbueros.services")} />
        <div className={styles.list}>
          <ul className={viz.services}>
            {SERVICES.map((i) => (
              <li key={i}>{line(`viz.svc.${i}`)}</li>
            ))}
            {MORE.map((i) => (
              <li key={`more-${i}`} className={styles.more}>
                <h3 className={styles.moreName}>{line(`architekturbueros.more.${i}.title`)}</h3>
                <p className={styles.moreText}>{line(`architekturbueros.more.${i}.text`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={viz.section} aria-labelledby="nk-architekturbueros-work">
        <SectionRule id="nk-architekturbueros-work" label={line("viz.work.label")} />
        <ul className={viz.works}>
          {projects.map((project, i) => {
            const { width, height } = getMediaSize(project.thumb);
            return (
              <Reveal as="li" key={project.slug} className={viz.work} delay={i * 90}>
                <Link href={`/arbeiten/${project.slug}`} className={viz.workLink}>
                  <span className={viz.workFrame}>
                    <Image
                      src={project.thumb}
                      alt={thumbAlt({ title: project.title, kind: "rendering" }, line)}
                      width={width}
                      height={height}
                      sizes="(max-width: 899px) calc(100vw - 40px), (max-width: 1199px) 45vw, 460px"
                      className={viz.workImg}
                    />
                  </span>
                  <span className={viz.workTitle}>{project.title}</span>
                  <span className={viz.workText}>{line(`projects.desc.${project.slug}`)}</span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className={viz.section} aria-labelledby="nk-architekturbueros-steps">
        <SectionRule id="nk-architekturbueros-steps" label={line("architekturbueros.steps")} />
        <ol className={viz.steps}>
          {STEPS.map((i) => (
            <li key={i} className={viz.step}>
              <h3 className={viz.itemTitle}>{line(`viz.step.${i}.title`)}</h3>
              <p className={viz.itemText}>{line(`architekturbueros.step.${i}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={viz.cta}>
        <div>
          <p className={viz.ctaText}>{line("architekturbueros.cta.text")}</p>
          <p className={note.ctaNote}>{line("bt.cta.note")}</p>
        </div>
        <Link href="/kontakt?kind=visualisierung" className={viz.ctaFill}>
          {line("bt.cta.button")}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </section>
    </main>
  );
}
