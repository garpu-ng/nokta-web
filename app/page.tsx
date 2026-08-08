import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HomeContact from "@/components/HomeContact";
import Reveal from "@/components/Reveal";
import TeaserVideo from "@/components/TeaserVideo";
import InterferenceField from "@/components/nokta/InterferenceField";
import KindMark, { type DoorKind } from "@/components/nokta/KindMark";
import SectionRule from "@/components/nokta/SectionRule";
import { workAnnotation } from "@/components/work/WorkAnno";
import { KIND_FIELD } from "@/lib/colors";
import { getLocale, getT, type Translate } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, getWork, type Work } from "@/lib/works";
import styles from "./page.module.css";

/* The homepage, as a numbered register.

   Three sections, each opened by a Registerband that names it
   (components/nokta/SectionRule). That is the whole clarity argument: the
   name stands in a break in the rule, so a reader always knows which part of
   the page they are in and where one part ends.

   The motion argument sits inside the same frame. Every animated thing here
   is a drawn abstraction of something the studio actually does — a halftone
   raster with two wave sources through it (01), a moiré band that is two line
   screens hung out of register (every rule), three marks that are a contour
   stack, a set column and a plan (02). None of it is ornament borrowed from
   elsewhere; it is the studio's own material, moving. The teaser film still
   opens the page above all of it.

   The full wall lives at /arbeiten — this page shows the fewest
   works it can get away with, at the biggest size it can give them. */

/* The three doors. Each lands on the wall already filtered to its material,
   wears that material's motto colour as a solid field, and carries the mark
   drawn for it in components/nokta/KindMark.

   The colours are the old site's palette, back for this one job. It is the
   single place on the site where anything other than the red is a surface —
   which is why they are here and nowhere else. */
const SERVICES: { kind: DoorKind }[] = [
  { kind: "rendering" }, // Visualisierung
  { kind: "editorial" }, // Editorial & Satz
  { kind: "cad" }, // Druck & CAD
];

/* The works the homepage shows, in the order they appear: the first takes the
   lead — the whole measure of the sheet, and the one work introduced with a line
   of its own — and the rest stand together in the row that closes the section.
   Named rather than derived: the selection is an editorial decision — two
   renderings, one editorial commission, one print, one manual — and a rule like
   "first of each kind" would silently re-cut it the next time a work is added to
   the wall. The slugs are resolved against lib/works.ts, so a renamed work fails
   the build here instead of rendering a hole.

   `plate` overrides the image a work is shown at plate size with, for the case
   where its wall thumbnail is the wrong shape to be given a whole plate. The
   wall wants one small image per work and hangs them all by ratio;
   teahouse's is a square the client cropped, which is a shape the interior was
   never shot in, so the home page shows the project's first image instead
   (resized and recompressed to plate size). The wall keeps its square: its
   columns are tuned to the thumbnails it has (see lib/works.ts). */
const FEATURED: { slug: string; plate?: string }[] = [
  { slug: "teahouse", plate: "/projects/teahouse/plate.jpg" },
  { slug: "abschlussbericht-ki-kommission" },
  { slug: "sanktgores" },
  { slug: "eiffel" },
  { slug: "leuchtturm" },
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.home.title");
  // No dedicated home description key — the studio blurb reads as the landing
  // summary, so reuse it for the <meta> + og/twitter description.
  const description = t("meta.site.desc");
  return {
    title,
    description,
    alternates: { canonical: "/" },
    ...socialMetadata({ title, description, locale, path: "/" }),
  };
}

/** A featured work and the image it is shown at plate size with — its own
    thumbnail unless FEATURED names another. */
type Featured = Work & { plate: string };

function featured(): Featured[] {
  return FEATURED.map(({ slug, plate }) => {
    const work = getWork(slug);
    if (!work) throw new Error(`app/page.tsx: no work "${slug}" in lib/works.ts`);
    return { ...work, plate: plate ?? work.thumb };
  });
}

/** kind · year · who it was for — the same annotation the wall and every detail
    page carries, word for word, built by the same function
    (components/work/WorkAnno.tsx). This section used to set a line of its own
    that dropped the client; it was the third fact a reader wants, and it was
    already written and already translated. */
function annotation(work: Work, t: Translate): string {
  const { kind, year, client } = workAnnotation(work, t);
  return `${kind} · ${year} · ${client}`;
}

/** The line that tells a work, where the studio has written one. The dictionary
    answers an unknown key with the key itself (lib/i18n.ts), which is what makes
    this askable: a work's own description is preferred, because it states the
    work without repeating the client that the annotation already carries, and
    the home page's own line stands in for works that are not projects. Only the
    lead is introduced this way — eiffel and leuchtturm have no such line in any
    locale, and a set where one plate of four is explained and three are not
    reads as an omission rather than a rhythm. */
function description(work: Featured, t: Translate): string | undefined {
  for (const key of [`projects.desc.${work.slug}`, `home.work.${work.slug}.text`]) {
    const line = t(key);
    if (line !== key) return line;
  }
  return undefined;
}

/** The work's own proportion, in the form CSS spends it: `w / h`, which is at
    once the plate's aspect-ratio and (in the set) its share of the row. */
function ratio(work: Featured): CSSProperties {
  const { width, height } = getMediaSize(work.plate);
  return { "--nk-ratio": `${width} / ${height}` } as CSSProperties;
}

function ratioOf(work: Featured): number {
  const { width, height } = getMediaSize(work.plate);
  return width / height;
}

/* The measure of the sheet at the width the design was drawn at: --content-max
   less its two gutters, and the gap between plates in the set
   (app/styles/tokens.css, app/page.module.css). `sizes` has to be stated in
   pixels now that a plate is not a share of the viewport but a share of a row,
   so these two figures are named here as well. Nothing but the hint is wrong if
   they drift. */
const MEASURE = 1420;
const GAP = 56;

/** The lead takes the measure, so its hint is the measure: the gutter tightens
    twice on the way down to a phone, and the sheet stops growing at
    --content-max. */
function leadSizes(): string {
  return [
    "(max-width: 899px) calc(100vw - 40px)",
    "(max-width: 1199px) calc(100vw - 64px)",
    "(max-width: 1500px) calc(100vw - 80px)",
    `${MEASURE}px`,
  ].join(", ");
}

/** A plate in the set is its share of a justified row — the row's width divided
    in proportion to the ratios standing in it. One row of all of them on a
    desktop sheet, two to a row below 1200px, one per row on a phone. */
function setSizes(work: Featured, set: Featured[]): string {
  const sum = set.reduce((total, w) => total + ratioOf(w), 0);
  const row = MEASURE - GAP * (set.length - 1);
  return [
    "(max-width: 899px) calc(100vw - 40px)",
    `(max-width: 1199px) calc((100vw - ${64 + GAP}px) / 2)`,
    `${Math.round((row * ratioOf(work)) / sum)}px`,
  ].join(", ");
}

/** A work's plate, cut to the work's own proportion.

    The image's real dimensions do three jobs: they reserve the right space so
    nothing shifts on load, they hand the stylesheet the work's ratio, and they
    size the `sizes` hint the caller passes in.

    `labelled` says whether the link around this plate already carries the work's
    title as text. In the set it does, so the alt is dropped rather than announced
    twice; the lead's plate is alone inside its link, and without the alt that
    link would have no accessible name at all. */
function Plate({
  work,
  sizes,
  labelled = false,
}: {
  work: Featured;
  sizes: string;
  labelled?: boolean;
}) {
  const { width, height } = getMediaSize(work.plate);
  return (
    <span className={styles.plate} style={ratio(work)}>
      <Image
        src={work.plate}
        alt={labelled ? "" : work.title}
        width={width}
        height={height}
        sizes={sizes}
        className={styles.plateImg}
      />
    </span>
  );
}

export default async function HomePage() {
  const t = await getT();
  const [lead, ...set] = featured();
  const leadText = description(lead, t);

  return (
    <main>
      <TeaserVideo lead1={t("home.hero.lead1")} lead2={t("home.hero.lead2")} />

      {/* ── 01 · Studio ────────────────────────────────────────────────
          The claim, then the plate across the full measure of the sheet, with
          the studio's line standing inside it. The raster does not run behind
          the type — it is knocked out around it, the way this page would be
          printed, so the line is read on clean ground and the field is still
          moving everywhere else. */}
      <section className={styles.section} aria-labelledby="nk-reg-01">
        <SectionRule id="nk-reg-01" label={t("home.reg.studio")} />

        <div className={styles.opening}>
          <p className={styles.claim}>{t("home.intro.statement")}</p>
          <p className={styles.body}>{t("home.intro.body")}</p>
        </div>

        <Reveal as="figure" className={styles.figure} variant="wipe">
          <div className={styles.fieldPlate}>
            <InterferenceField motto={t("studio.motto")} />
          </div>
          {/* The canvas is decoration and hidden from assistive tech, so the
              line it carries is also rendered as real text — off-screen, not
              display:none, so a screen reader still reaches it. Nothing on
              this site is ever spoken only by a canvas. */}
          <figcaption className="nk-sr-only">
            {t("studio.motto")}
          </figcaption>
        </Reveal>
      </section>

      {/* ── 02 · Leistungen ───────────────────────────────────────────
          Three doors into the work rather than into the process: a reader who
          wants renderings wants to see renderings, not to read how they are
          made. Each one carries its material's own drawn mark. */}
      <section className={styles.section} aria-labelledby="nk-reg-02">
        <SectionRule id="nk-reg-02" label={t("home.services.aria")} />

        <div className={styles.doors}>
          {SERVICES.map(({ kind }, i) => (
            <Reveal key={kind} delay={i * 90}>
              <Link
                href={`/arbeiten?kind=${kind}`}
                // nk-door is a global hook, not decoration: the mark's own
                // stylesheet keys its hover state off it (a CSS module cannot
                // see the class its consumer hovers).
                className={`${styles.door} nk-door`}
                // The material's own colour, spent as the field it stands on.
                style={{ "--nk-field": KIND_FIELD[kind] } as CSSProperties}
              >
                <span className={styles.doorFolio}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.doorMark}>
                  <KindMark kind={kind} />
                </span>
                <span className={styles.doorTitle}>
                  {t(`home.svc.${i}.title`)}
                </span>
                <span className={styles.doorText}>
                  {t(`home.svc.${i}.short`)}
                </span>
                <span className={styles.doorArrow} aria-hidden="true">
                  ↗
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 03 · Ausgewählte Arbeiten ─────────────────────────────────
          A lead and a set, and the same caption under both: a plate, a hairline,
          a title, a line of facts. The lead takes the measure of the sheet and is
          the one work introduced with a sentence; the rest stand in a row
          justified to that same measure, so they come out one height whatever
          their proportions. Then the door to the rest. */}
      <section className={styles.section} aria-labelledby="nk-reg-03">
        <SectionRule id="nk-reg-03" label={t("home.selected")} />

        <Reveal as="article" className={styles.lead}>
          <Link href={`/arbeiten/${lead.slug}`} className={styles.plateLink}>
            <Plate work={lead} sizes={leadSizes()} />
          </Link>
          <div className={styles.leadCaption}>
            <h3 className={styles.leadTitle}>
              <Link href={`/arbeiten/${lead.slug}`} className={styles.titleLink}>
                {lead.title}
              </Link>
            </h3>
            <div>
              <p className={`${styles.anno} ${styles.leadAnno}`}>{annotation(lead, t)}</p>
              {leadText ? <p className={styles.leadText}>{leadText}</p> : null}
            </div>
          </div>
        </Reveal>

        <div className={styles.set}>
          {set.map((work, i) => (
            <Reveal
              key={work.slug}
              className={styles.setItem}
              delay={i * 90}
              // The ratio is the item's share of the row, so it is wanted here as
              // well as on the plate inside — see .setItem in the stylesheet.
              style={ratio(work)}
            >
              <Link href={`/arbeiten/${work.slug}`} className={styles.setLink}>
                <Plate work={work} sizes={setSizes(work, set)} labelled />
                <span className={styles.setCaption}>
                  <span className={styles.setTitle}>{work.title}</span>
                  <span className={`${styles.anno} ${styles.setAnno}`}>
                    {annotation(work, t)}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Link href="/arbeiten" className={styles.allWorks}>
          {/* The way on. It used to promise "alle 13 arbeiten", which the wall
              no longer answers with: /arbeiten stands on one material at a
              time. The figure still says how much work is over there. */}
          <span>{t("work.count").replace("{count}", String(WORKS.length))}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <HomeContact
        title={t("home.contact.title")}
        body={t("home.contact.body")}
        cta={t("home.contact.cta")}
      />
    </main>
  );
}
