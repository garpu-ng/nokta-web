import type { Metadata } from "next";
import { Fragment, type CSSProperties, type ReactNode } from "react";
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
  "highway-score": "work.highway-score.lead",
  "flock-score": "work.flock-score.lead",
  ma: "work.ma.lead",
};

/** Ma's plates, in reading order: cover, three chapters, the full sheet.
    The work itself carries no client; this list is only the gallery. */
const MA_IMAGES = [
  "/ma/cover.webp",
  "/ma/day.webp",
  "/ma/two-voices.webp",
  "/ma/space.webp",
  "/ma/sheet.webp",
];

/** The contact sheet is the one Ma image that is not height-capped. It paints
    the full content column (1500px), so a retina screen can ask for the
    3144px master instead of a ~800px reduction of it. */
const MA_SHEET_SIZES = "(max-width: 1500px) 100vw, 1500px";

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
function imageStack(
  project: { slug: string; images: string[] },
  title: string,
  t: Translate,
  opts?: { quality?: number; sheetSrc?: string; sheetSizes?: string; sheetClassName?: string },
) {
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
              sizes={
                opts?.sheetSrc === src && opts.sheetSizes
                  ? opts.sheetSizes
                  : projectImageSizes(width, height)
              }
              quality={opts?.quality}
              preload={i === 0}
              className={
                opts?.sheetSrc === src && opts.sheetClassName
                  ? opts.sheetClassName
                  : "wa-project-img"
              }
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

/** A film study, in the proportion of its own cut. The plate is the same
    component Lichtspiel uses; only the files and the sentences change. */
const FILMS = {
  lichtspiel: { width: 1920, height: 912 },
  "highway-score": { width: 1920, height: 892 },
  "flock-score": { width: 1920, height: 1080 },
} as const;

type FilmSlug = keyof typeof FILMS;

/** Where a lead names Ma, that name links to the design system. The word
    stays in the sentence, so the meta description (the same string, without
    this pass) still reads as prose. */
function leadWithMa(text: string): ReactNode {
  const parts = text.split(/(\bMa\b)/);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part === "Ma" ? (
      <Link key={i} href="/arbeiten/ma">
        Ma
      </Link>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function filmPiece(slug: FilmSlug, t: Translate) {
  const ratio = FILMS[slug];
  return (
    <>
      <div className={styles.body}>
        <p className={styles.lead}>{leadWithMa(t(`work.${slug}.lead`))}</p>
      </div>
      <FilmPlate
        base={`/${slug}`}
        ratio={ratio}
        texts={{
          player: `work.${slug}.player`,
          spec: `work.${slug}.spec`,
          noVideo: `work.${slug}.noVideo`,
        }}
      />
    </>
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
    case "highway-score":
    case "flock-score":
      return filmPiece(slug, t);
    case "ma":
      return (
        <>
          <div className={styles.body}>
            <div className={styles.intro}>
              <div>
                <p className={styles.introLead}>{t("work.ma.subtitle")}</p>
                <p className={styles.lead}>{t("work.ma.lead")}</p>
                <p className={styles.download}>
                  <a href="/ma/ma-design-bible.pdf" download="ma-design-bible.pdf">
                    {t("work.ma.download")}
                  </a>
                </p>
              </div>
              <dl className={styles.facts}>
                <div>
                  <dt>{t("projects.label.service")}</dt>
                  <dd>{t("work.ma.service")}</dd>
                </div>
                <div>
                  <dt>{t("projects.label.scope")}</dt>
                  <dd>{t("work.ma.scope")}</dd>
                </div>
              </dl>
            </div>
          </div>
          {imageStack({ slug: "ma", images: MA_IMAGES }, "Ma (間)", t, {
            quality: 90,
            sheetSrc: "/ma/sheet.webp",
            sheetSizes: MA_SHEET_SIZES,
            sheetClassName: styles.maSheet,
          })}
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
