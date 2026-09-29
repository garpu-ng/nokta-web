import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ProjectHeader from "@/components/ProjectHeader";
import Reveal from "@/components/Reveal";
import ArtPlate from "@/components/nokta/ArtPlate";
import CaseStudy from "@/components/nokta/CaseStudy";
import FilmPlate from "@/components/nokta/FilmPlate";
import WorkAnno, { workAnnotation } from "@/components/work/WorkAnno";
import { getLocale, getT, type Translate } from "@/lib/i18n";
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

/** The alt text of a project image: the project's title and what the shot
    shows, or its running number where no line is written yet. */
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
              sizes="(max-width: 1500px) 100vw, 1500px"
              preload={i === 0}
              className="wa-project-img"
            />
          </Reveal>
        );
      })}
    </div>
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
  const { prev, next } = prevNext(work.slug);

  return (
    <main>
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
