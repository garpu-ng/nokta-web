import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectHeader from "@/components/ProjectHeader";
import Reveal from "@/components/Reveal";
import ArtPlate from "@/components/nokta/ArtPlate";
import CaseStudy from "@/components/nokta/CaseStudy";
import Leuchtturm from "@/components/nokta/Leuchtturm";
import WorkAnno, { workAnnotation } from "@/components/work/WorkAnno";
import { getLocale, getT, type Translate } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import type { Print } from "@/lib/prints";
import type { Project } from "@/lib/projects";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, getWork, prevNext, type Work } from "@/lib/works";
import styles from "./page.module.css";

/* One detail route for every kind of work. The frame is always the same — back
   to the wall, the title, the same annotation the card carries — and only the
   body changes with the material: an image stack for a rendering, the technical
   passport for a print, the piece's own section for a report, a study or the
   house manual. The prev/next pair at the foot deliberately crosses kinds:
   there is one body of work, not five shelves. */

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
    case "print": {
      const print = work.source.print;
      return `${print.title}, ${print.subtitle} · ${print.year} · ${print.architect}. ${t(
        "line.metaDescSuffix",
      )} ${print.price} €.`;
    }
    case "piece":
      return t(PIECE_DESC[work.slug] ?? "meta.site.desc");
  }
}

/** Existing copy that already says what each piece is. */
const PIECE_DESC: Record<string, string> = {
  "abschlussbericht-ki-kommission": "point.case.lead",
  "n-studie": "work.nstudie.lead",
  leuchtturm: "point.manual.text",
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
function imageStack(project: Project, title: string) {
  return (
    <div className="wa-project-images">
      {project.images.map((src, i) => {
        const { width, height } = getMediaSize(src);
        return (
          <Reveal key={src} variant="wipe" className="wa-image-window">
            <Image
              src={src}
              alt={`${title}, Bild ${i + 1}`}
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

/** CAD print: the sheet, its passport, its price and its checkout. This is the
    only place in the studio where a price is stated. */
function printPassport(print: Print, t: Translate) {
  const { width, height } = getMediaSize(print.image);

  return (
    <div className={styles.body}>
      <div className={styles.print}>
        <div className={styles.frame}>
          <Image
            src={print.image}
            alt={`${print.title}, ${t("line.altSuffix")}`}
            width={width}
            height={height}
            sizes="(max-width: 767px) 100vw, 50vw"
            preload
            className={styles.art}
          />
        </div>

        <div className={styles.info}>
          {/* The print's Schriftfeld: the data engraved on the sheet itself. */}
          <dl className={styles.passport}>
            <div>
              <dt>{t("line.tb.subject")}</dt>
              <dd>{print.title}</dd>
            </div>
            <div>
              <dt>{t("line.tb.city")}</dt>
              <dd>{print.subtitle}</dd>
            </div>
            <div>
              <dt>{t("line.spec.year")}</dt>
              <dd>{print.year}</dd>
            </div>
            <div>
              <dt>{t("line.spec.architect")}</dt>
              <dd>{print.architect}</dd>
            </div>
            <div>
              <dt>{t("line.spec.coords")}</dt>
              <dd>{print.coordinates}</dd>
            </div>
            <div>
              <dt>{t("line.spec.technique")}</dt>
              <dd>{t("line.spec.techniqueVal")}</dd>
            </div>
            <div>
              <dt>{t("line.spec.format")}</dt>
              <dd>{t("line.spec.formatVal")}</dd>
            </div>
            <div>
              <dt>{t("line.tb.price")}</dt>
              <dd>{print.price} €</dd>
            </div>
          </dl>

          <p className={styles.lead}>{t("line.detailLead")}</p>

          <div className={styles.buy}>
            {print.paymentLink ? (
              // Live: a fixed-price Stripe Payment Link (see Print.paymentLink).
              // Opens Stripe's hosted checkout in a new tab; the price rides in
              // the label so this button carries the price on its own.
              <a
                href={print.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btn}
              >
                {t("line.buy")} · {print.price} €
              </a>
            ) : (
              // No link pasted yet: fall back to the /kontakt inquiry route.
              // The passport above still states the price.
              <>
                <span className={styles.price}>{print.price} €</span>
                <Link href="/kontakt" className={styles.btn}>
                  {t("line.order")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Editorial, study, manual: each piece brings its own section. */
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
    case "leuchtturm":
      // Deliberately no CTA: the manual is not for sale and not obtainable.
      return <Leuchtturm />;
    default:
      return null;
  }
}

function workBody(work: Work, t: Translate) {
  switch (work.source.type) {
    case "project":
      return imageStack(work.source.project, work.title);
    case "print":
      return printPassport(work.source.print, t);
    case "piece":
      return pieceBody(work.slug, t);
  }
}

/* ── The page ───────────────────────────────────────────────────────── */

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  const t = await getT();
  const { prev, next } = prevNext(work.slug);

  return (
    <main>
      <ProjectHeader
        title={work.title}
        anno={<WorkAnno anno={workAnnotation(work, t)} />}
        backHref="/"
        backLabel={t("work.back")}
      />

      {workBody(work, t)}

      {/* The neighbours are plates of their own: a mono kicker over a title set
          at reading-across-the-room scale. The arrows are marks, not words —
          aria-hidden, so the link is announced by its title alone. */}
      <nav className={styles.nav}>
        {prev ? (
          <Link href={`/arbeiten/${prev.slug}`} className={styles.navLink}>
            <span className="nk-mono-caption">{t("work.prev")}</span>
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
            <span className="nk-mono-caption">{t("work.next")}</span>
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
