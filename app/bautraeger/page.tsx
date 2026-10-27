import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PlateHead from "@/components/nokta/PlateHead";
import RidgeField from "@/components/nokta/RidgeField";
import SectionRule from "@/components/nokta/SectionRule";
import { getMediaSize } from "@/lib/mediaSizes";
import { PROJECTS } from "@/lib/projects";
import de from "@/messages/de";
import viz from "../3d-visualisierung/page.module.css";
import note from "../fuer-bautraeger/page.module.css";
import styles from "./page.module.css";

/* /bautraeger: a draft landing page for review. German only, on every
   language cookie, because the copy is read from messages/de.ts and nowhere
   else. Not in the nav, the footer or the sitemap, and noindex.

   The first five services are the ones the visualisation page already names.
   The last four are the same set the architect draft carries, worded here
   for residential developers. Nothing here names a price, a deadline, a
   client or a city. */

const SERVICES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const STEPS = [0, 1, 2, 3] as const;

/* Housing projects already in lib/projects.ts, in the order the wall leads
   with them. A slug that is not in the file is skipped. */
const HOUSING = ["sanktgores", "beatbuilding", "binome"] as const;

function line(key: string): string {
  return de[key] ?? key;
}

export const metadata: Metadata = {
  title: line("meta.bautraeger.title"),
  description: line("meta.bautraeger.desc"),
  robots: { index: false, follow: false },
};

export default function BautraegerDraftPage() {
  const title = `${line("bautraeger.heading")}.`;
  const projects = HOUSING.flatMap((slug) => {
    const project = PROJECTS.find((item) => item.slug === slug);
    return project ? [project] : [];
  });

  return (
    <main>
      <PlateHead title={title}>
        <RidgeField motto={title} />
      </PlateHead>

      <section className={styles.lede}>
        <p className={viz.body}>{line("bautraeger.lede")}</p>
      </section>

      <section className={viz.section} aria-labelledby="nk-bautraeger-svc">
        <SectionRule id="nk-bautraeger-svc" label={line("bautraeger.services")} />
        <div className={viz.uses}>
          {SERVICES.map((i) => (
            <Reveal key={i} delay={(i % 3) * 90}>
              <h3 className={viz.itemTitle}>{line(`bautraeger.svc.${i}.title`)}</h3>
              <p className={viz.itemText}>{line(`bautraeger.svc.${i}.text`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={viz.section} aria-labelledby="nk-bautraeger-work">
        <SectionRule id="nk-bautraeger-work" label={line("viz.work.label")} />
        <ul className={viz.works}>
          {projects.map((project, i) => {
            const { width, height } = getMediaSize(project.thumb);
            return (
              <Reveal as="li" key={project.slug} className={viz.work} delay={i * 90}>
                <Link href={`/arbeiten/${project.slug}`} className={viz.workLink}>
                  <span className={viz.workFrame}>
                    <Image
                      src={project.thumb}
                      alt=""
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

      <section className={viz.section} aria-labelledby="nk-bautraeger-steps">
        <SectionRule id="nk-bautraeger-steps" label={line("bautraeger.steps")} />
        <ol className={viz.steps}>
          {STEPS.map((i) => (
            <li key={i} className={viz.step}>
              <h3 className={viz.itemTitle}>{line(`viz.step.${i}.title`)}</h3>
              <p className={viz.itemText}>{line(`bautraeger.step.${i}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={viz.cta}>
        <div>
          <p className={viz.ctaText}>{line("bt.cta.text")}</p>
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
