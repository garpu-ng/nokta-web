import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ProjectHeader from "@/components/ProjectHeader";
import Reveal from "@/components/Reveal";
import ArtPlate from "@/components/nokta/ArtPlate";
import CaseStudy from "@/components/nokta/CaseStudy";
import FilmPlate from "@/components/nokta/FilmPlate";
import WorkAnno, { workAnnotation } from "@/components/work/WorkAnno";
import { getLocale, getT, type Translate } from "@/lib/i18n";
import { creativeWorkJsonLd } from "@/lib/jsonld";
import { getMediaSize } from "@/lib/mediaSizes";
import { PRINTS } from "@/lib/prints";
import type { Project } from "@/lib/projects";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, getWork, prevNext, type Work } from "@/lib/works";
import styles from "./page.module.css";

/* One detail route for every kind of work. The frame is always the same — back
   to the wall, the title, the same annotation the card carries — and only the
   body changes with the material: an image stack for a rendering, the piece's
   own section for a report or a study. The CAD prints live
   in the shop (/shop/[slug]). The prev/next pair at the foot deliberately crosses kinds:
   there is one body of work, not four shelves. */

type Props = { params: Promise<{ slug: string }> };

// Currently inert (the locale cookie keeps every page dynamic), but kept so the
// route prerenders the moment i18n moves off cookies.
export function generateStaticParams() {
  return WORKS.map((work) => ({ slug: work.slug }));
}

/** The page's one description, reused for the meta tag and the social card. */
function describe(work: Work, t: Translate): string {
  switch (work.source.type) {
    case "project":
      return t(`projects.desc.${work.slug}`);
    case "piece":
      return t(PIECE_DESC[work.slug] ?? "meta.site.desc");
  }
}

/** Description for the work's JSON-LD. Same sentence as the meta description,
    except the KI-Kommission report: that sentence names the commissioning
    body. The two narrative paragraphs on the page describe the work without
    a client name. */
function workLdDescription(work: Work, t: Translate): string {
  if (work.slug === "abschlussbericht-ki-kommission") {
    return `${t("point.case.narrative1")} ${t("point.case.narrative2")}`;
  }
  return describe(work, t);
}

/** The alt text of a project image: the project's title and what the shot
    shows, or its running number where no line is written yet. */
/** How wide the stack actually paints this shot. .wa-project-img is
    min(100%, 1500px, 900px times the ratio): a tall frame is narrower than
    the sheet, and a sizes hint of 100vw made a ~670px plate download 1920. */
function projectImageSizes(width: number, height: number): string {
  const cap = Math.round((900 * width) / height);
  if (cap >= 1500) return "(max-width: 1500px) 100vw, 1500px";
  return `(max-width: ${cap}px) 100vw, ${cap}px`;
}

function imageAlt(slug: string, title: string, i: number, t: Translate): string {
  const key = `projects.alt.${slug}.${i + 1}`;
  const line = t(key);
  if (line !== key) return `${title}, ${line}`;
  return `${title}, ${t("projects.imageAlt").replace("{n}", String(i + 1))}`;
}

/** Existing copy that already says what each piece is. */
const PIECE_DESC: Record<string, string> = {
  "abschlussbericht-ki-kommission": "point.case.lead",
  "n-studie": "work.nstudie.lead",
  lichtspiel: "work.lichtspiel.lead",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};

  const t = await getT();
  const locale = await getLocale();
  const title = `${work.title} · nokta`;
  const description = describe(work, t);
  const path = `/arbeiten/${work.slug}`;
  const { width, height } = getMediaSize(work.thumb);
  const social = socialMetadata({ title, description, locale, path });

  return {
    title,
    description,
    alternates: { canonical: path },
    ...social,
    // Metadata merges shallowly, so the shared openGraph block is spread first
    // and only then given this work's own card image.
    openGraph: {
      ...social.openGraph,
      images: [{ url: work.thumb, width, height, alt: work.title }],
    },
  };
}

/* ── Bodies ─────────────────────────────────────────────────────────── */

/** Rendering: the images, stacked, at full width. Each plate opens on the way
    down the stack — a soft wipe from its bottom edge, never a fade of the
    first one (it is the page's preloaded image and is already on screen). */
function imageStack(project: Project, title: string, t: Translate) {
  return (
    <div className="wa-project-images">
      {project.images.map((src, i) => {
        const { width, height } = getMediaSize(src);
        return (
          <Reveal
            key={src}
            variant="wipe"
            className="wa-image-window"
            /* The shot's own proportion, in the form CSS spends it — the same
               `w / h` the home page hands its plates. It is what lets
               .wa-project-img state a width rather than wait for the file to
               arrive and tell it one. */
            style={{ "--nk-ratio": `${width} / ${height}` } as CSSProperties}
          >
            <Image
              src={src}
              /* Each shot says what it shows (projects.alt.<slug>.<n>). A shot
                 added without one falls back to its running number rather than
                 rendering the key. */
              alt={imageAlt(project.slug, title, i, t)}
              width={width}
              height={height}
              sizes={projectImageSizes(width, height)}
              preload={i === 0}
              className="wa-project-img"
            />
          </Reveal>
        );
      })}
    </div>
  );
}

/** The three renderings that carry a written case study under the stack.
    Every other project page stays as it is. */
const CASE_SLUGS = ["binome", "beatbuilding", "ipehouse"] as const;
const CASE_PARTS = ["aufgabe", "vorgehen", "ergebnis"] as const;

function hasCase(slug: string): slug is (typeof CASE_SLUGS)[number] {
  return (CASE_SLUGS as readonly string[]).includes(slug);
}

/** Fallstudie: the written account, under the images, in the same measure as
    the intro. German only; other locales fall back through getT. */
function projectCase(slug: string, t: Translate) {
  if (!hasCase(slug)) return null;
  const titleId = `fallstudie-${slug}`;
  return (
    <section className={styles.case} aria-labelledby={titleId}>
      <header className={styles.caseHead}>
        <p className={`nk-caption ${styles.caseKicker}`}>{t("projects.case.label")}</p>
        <h2 id={titleId} className={styles.caseTitle}>
          {t(`projects.case.${slug}.title`)}
        </h2>
        <p className={styles.caseLead}>{t(`projects.case.${slug}.lead`)}</p>
      </header>
      <div className={styles.caseBlocks}>
        {CASE_PARTS.map((part) => (
          <div className={styles.caseBlock} key={part}>
            <h3>{t(`projects.case.${part}`)}</h3>
            <p>{t(`projects.case.${slug}.${part}`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Rendering: what the images show and what was delivered, in one paragraph
    and two facts, before the stack itself. The desc line doubles as the page's
    meta description, so it is the sentence a shared link previews. */
function projectIntro(slug: string, t: Translate) {
  return (
    <div className={styles.body}>
      <div className={styles.intro}>
        <div>
          <p className={styles.introLead}>{t(`projects.desc.${slug}`)}</p>
          <p className={styles.lead}>{t(`projects.text.${slug}`)}</p>
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>{t("projects.label.service")}</dt>
            <dd>{t(`projects.service.${slug}`)}</dd>
          </div>
          <div>
            <dt>{t("projects.label.scope")}</dt>
            <dd>{t(`projects.scope.${slug}`)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/** Editorial, study: each piece brings its own section. */
function pieceBody(slug: string, t: Translate) {
  switch (slug) {
    case "abschlussbericht-ki-kommission":
      return <CaseStudy />;
    case "n-studie":
      return (
        <>
          <div className={styles.body}>
            <p className={styles.lead}>{t("work.nstudie.lead")}</p>
          </div>
          <ArtPlate />
        </>
      );
    case "lichtspiel":
      return (
        <>
          <div className={styles.body}>
            <p className={styles.lead}>{t("work.lichtspiel.lead")}</p>
          </div>
          <FilmPlate />
        </>
      );
    default:
      return null;
  }
}

function workBody(work: Work, t: Translate) {
  switch (work.source.type) {
    case "project":
      return (
        <>
          {projectIntro(work.slug, t)}
          {imageStack(work.source.project, work.title, t)}
          {projectCase(work.slug, t)}
        </>
      );
    case "piece":
      return pieceBody(work.slug, t);
  }
}

/* ── The page ───────────────────────────────────────────────────────── */

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  // The CAD prints left the wall for the shop; an old link to one still lands
  // on that print. Temporary on purpose: /arbeiten may carry CAD work again
  // once it is a service rather than a product.
  if (PRINTS.some((p) => p.slug === slug)) redirect(`/shop/${slug}`);
  const work = getWork(slug);
  if (!work) notFound();

  const t = await getT();
  const locale = await getLocale();
  const { prev, next } = prevNext(work.slug);

  return (
    <main>
      <JsonLd
        data={creativeWorkJsonLd({
          path: `/arbeiten/${work.slug}`,
          name: work.title,
          description: workLdDescription(work, t),
          imagePath: work.thumb,
          inLanguage: locale,
        })}
      />
      <ProjectHeader
        title={work.title}
        anno={<WorkAnno anno={workAnnotation(work, t)} />}
        // The label promises the wall ("Alle Arbeiten"), so the link keeps
        // that promise: since Kolonnade the wall hangs at /arbeiten, not on
        // the homepage this pointed at when the route was cut.
        backHref="/arbeiten"
        backLabel={t("work.back")}
      />

      {workBody(work, t)}

      {/* The neighbours are plates of their own: a caption kicker over a title set
          at reading-across-the-room scale. The arrows are marks, not words —
          aria-hidden, so the link is announced by its title alone. */}
      <nav className={styles.nav}>
        {prev ? (
          <Link href={`/arbeiten/${prev.slug}`} className={styles.navLink}>
            <span className="nk-caption">{t("work.prev")}</span>
            <span className={styles.navTitle}>
              <span className={styles.navArrow} aria-hidden="true">←</span>
              <span className={styles.navName}>{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/arbeiten/${next.slug}`} className={`${styles.navLink} ${styles.navNext}`}>
            <span className="nk-caption">{t("work.next")}</span>
            <span className={styles.navTitle}>
              <span className={styles.navName}>{next.title}</span>
              <span className={styles.navArrow} aria-hidden="true">→</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
