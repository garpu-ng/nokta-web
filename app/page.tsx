import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HomeContact from "@/components/HomeContact";
import Reveal from "@/components/Reveal";
import HomeHero from "@/components/HomeHero";
import OneLine from "@/components/nokta/OneLine/OneLine";
import KindMark, { type DoorKind } from "@/components/nokta/KindMark";
import SectionRule from "@/components/nokta/SectionRule";
import { KIND_FIELD } from "@/lib/colors";
import { getLocale, getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { socialMetadata } from "@/lib/socialMeta";
import { getWork, type Work } from "@/lib/works";
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

   The full wall lives at /arbeiten. This page shows three housing
   visualisations in one row, at the size the sheet gives that row. */

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

/* The three works the homepage shows, in wall order. Named rather than
   derived: the selection is an editorial cut of lib/projects.ts — housing
   visualisations a developer can read as the kind of building they commission.
   Sanktgores and Binome are houses; Beat Building is a mixed-use residential
   building. A rule like "first three renderings" would pull in the tea salon
   the moment the wall order changed. The slugs are resolved against
   lib/works.ts, and each one has to be a project, so a renamed or non-project
   work fails the build here instead of rendering a hole. */
const FEATURED = ["sanktgores", "beatbuilding", "binome"] as const;

/* Where a door leads when it is not the wall. Visualisation opens the page
   that states the service in words (and links on to every rendering). CAD is offered as a service
   (floor plans, sections, site plans) before there is any on the wall, so its
   door opens the inquiry with CAD already chosen. The line prints are a shop
   of their own (/shop), not this service. */
const DOOR_HREF: Partial<Record<string, string>> = {
  rendering: "/3d-visualisierung",
  // Editorial opens the page written for institutions, which leads on to the
  // one editorial work and states scope and process.
  editorial: "/fuer-institutionen",
  cad: "/kontakt?kind=cad",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.home.title");
  // The landing page names the services and the region it serves — the words a
  // search for this studio starts with.
  const description = t("meta.home.desc");
  return {
    title,
    description,
    alternates: { canonical: "/" },
    ...socialMetadata({ title, description, locale, path: "/" }),
  };
}

/** A featured project and the image it is shown with: its wall thumbnail. */
type Featured = Work & { plate: string };

function featured(): Featured[] {
  return FEATURED.map((slug) => {
    const work = getWork(slug);
    if (!work) throw new Error(`app/page.tsx: no work "${slug}" in lib/works.ts`);
    if (work.source.type !== "project") {
      throw new Error(`app/page.tsx: "${slug}" is not a project in lib/projects.ts`);
    }
    return { ...work, plate: work.thumb };
  });
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

/** A plate in the row is its share of a justified row — the row's width divided
    in proportion to the ratios standing in it. One row of all of them on a
    desktop sheet, two to a row below 1200px, one per row on a phone. */
function setSizes(work: Featured, set: Featured[]): string {
  const sum = set.reduce((total, w) => total + ratioOf(w), 0);
  const share = ratioOf(work) / sum;
  const gaps = GAP * (set.length - 1);
  const row = MEASURE - gaps;
  return [
    "(max-width: 899px) calc(100vw - 40px)",
    `(max-width: 1199px) calc((100vw - ${64 + GAP}px) / 2)`,
    // Above 1199 the three plates share one row, and the row is the viewport
    // until the sheet hits --content-max. A hint sized for 1420px made a
    // 1350px window fetch the next bucket up.
    `(max-width: 1500px) calc((100vw - ${80 + gaps}px) * ${share.toFixed(4)})`,
    `${Math.round(row * share)}px`,
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
  const works = featured();

  return (
    <main>
      <HomeHero
        eyebrow={t("home.hero.eyebrow")}
        title={t("home.hero.title")}
        sub={t("home.hero.sub")}
        ctaWork={t("home.hero.ctaWork")}
        ctaContact={t("home.hero.ctaContact")}
        audiences={[
          { href: "/fuer-bautraeger", label: t("home.hero.forBt") },
          { href: "/fuer-institutionen", label: t("home.hero.forInst") },
        ]}
        audiencesLabel={t("home.hero.forAria")}
      />

      {/* ── 01 · Studio ────────────────────────────────────────────────
          Who the studio works for, beside the plate: a single point draws a
          whole building without lifting, holds it, and takes the line back.
          The claim itself now stands in the hero above. */}
      <section className={styles.section} aria-labelledby="nk-reg-01">
        <SectionRule id="nk-reg-01" label={t("home.reg.studio")} />

        <div className={styles.opening}>
          <p className={styles.body}>{t("home.intro.body")}</p>
          <Reveal as="figure" className={styles.figure} variant="wipe">
            <div className={styles.fieldPlate}>
              <OneLine />
            </div>
            {/* The canvas is decoration and hidden from assistive tech, so what
                happens in it is also rendered as real text, off-screen rather
                than display:none, so a screen reader still reaches it. */}
            <figcaption className="nk-sr-only">{t("home.plate.oneline")}</figcaption>
          </Reveal>
        </div>
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
                href={DOOR_HREF[kind] ?? `/arbeiten?kind=${kind}`}
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
          Three equal plates in one row, then the door to the wall. The caption
          under each is the name and the service line already written for that
          project. No client and no count: both live on the work's own page. */}
      <section className={styles.section} aria-labelledby="nk-reg-03">
        <SectionRule id="nk-reg-03" label={t("home.selected")} />

        <p className={`${styles.body} ${styles.lead}`}>{t("home.selected.lede")}</p>

        <div className={styles.set}>
          {works.map((work, i) => (
            <Reveal
              key={work.slug}
              className={styles.setItem}
              delay={i * 90}
              // The ratio is the item's share of the row, so it is wanted here as
              // well as on the plate inside — see .setItem in the stylesheet.
              style={ratio(work)}
            >
              <Link href={`/arbeiten/${work.slug}`} className={styles.setLink}>
                <Plate work={work} sizes={setSizes(work, works)} labelled />
                <span className={styles.setCaption}>
                  <span className={styles.setTitle}>{work.title}</span>
                  <span className={`${styles.anno} ${styles.setAnno}`}>
                    {t(`projects.service.${work.slug}`)}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Link href="/arbeiten" className={styles.allWorks}>
          {/* The way on, without a figure: the wall opens on one material, so any
              count here named a different set than the one you land on. */}
          <span>{t("work.back")}</span>
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
