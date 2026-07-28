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

   The full thirteen-work wall lives at /arbeiten — this page shows the fewest
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

/* The four works the homepage shows, by slug and in the order they appear.
   Named rather than derived: the selection is an editorial decision — one
   rendering, one editorial commission, one print, one manual — and a rule
   like "first of each kind" would silently re-cut it the next time a work is
   added to the wall. The slugs are resolved against lib/works.ts, so a
   renamed work fails the build here instead of rendering a hole. */
const FEATURED = [
  "teahouse",
  "abschlussbericht-ki-kommission",
  "eiffel",
  "leuchtturm",
] as const;

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

function featured(): Work[] {
  return FEATURED.map((slug) => {
    const work = getWork(slug);
    if (!work) throw new Error(`app/page.tsx: no work "${slug}" in lib/works.ts`);
    return work;
  });
}

/** kind · year — the mono line above a spread's title and beside a pair's. */
function annotation(work: Work, t: Translate): string {
  return `${t(`work.kind.${work.kind}`)} · ${work.year}`;
}

/** A work's plate, sized from its real thumbnail so nothing shifts on load.

    `labelled` says whether the link around this plate already carries the
    work's title as text. On the pair it does, so the alt is dropped rather
    than announced twice; on a spread the plate is alone inside its link, and
    without the alt that link would have no accessible name at all. */
function Plate({ work, sizes, labelled = false }: { work: Work; sizes: string; labelled?: boolean }) {
  const { width, height } = getMediaSize(work.thumb);
  return (
    <span className={styles.plate}>
      <Image
        src={work.thumb}
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
  const [first, second, ...pair] = featured();

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
          <figcaption className={styles.figHidden}>
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
          Two spreads and a pair, then the door to all thirteen. */}
      <section className={styles.section} aria-labelledby="nk-reg-03">
        <SectionRule id="nk-reg-03" label={t("home.selected")} />

        {/* Spread one — plate left, caption right, both sitting on the same
            baseline so the caption reads as a note in the plate's margin. */}
        <Reveal as="article" className={styles.spread}>
          <Link href={`/arbeiten/${first.slug}`} className={styles.spreadPlate}>
            <Plate work={first} sizes="(max-width: 899px) 100vw, 57vw" />
          </Link>
          <div className={styles.caption}>
            <p className={styles.kicker}>{annotation(first, t)}</p>
            <h3 className={styles.captionTitle}>
              <Link href={`/arbeiten/${first.slug}`} className={styles.captionLink}>
                {first.title}
              </Link>
            </h3>
            <p className={styles.captionText}>{t(`home.work.${first.slug}.text`)}</p>
          </div>
        </Reveal>

        {/* Spread two — mirrored, so the page never settles into a rhythm. */}
        <Reveal as="article" className={`${styles.spread} ${styles.spreadMirror}`}>
          <div className={styles.caption}>
            <p className={styles.kicker}>{annotation(second, t)}</p>
            <h3 className={styles.captionTitle}>
              <Link href={`/arbeiten/${second.slug}`} className={styles.captionLink}>
                {second.title}
              </Link>
            </h3>
            <p className={styles.captionText}>{t(`home.work.${second.slug}.text`)}</p>
          </div>
          <Link href={`/arbeiten/${second.slug}`} className={styles.spreadPlate}>
            <Plate work={second} sizes="(max-width: 899px) 100vw, 57vw" />
          </Link>
        </Reveal>

        {/* The pair — two plates side by side, each captioned in one mono row. */}
        <div className={styles.pair}>
          {pair.map((work, i) => (
            <Reveal key={work.slug} delay={i * 90}>
              <Link href={`/arbeiten/${work.slug}`} className={styles.pairItem}>
                <Plate work={work} sizes="(max-width: 899px) 100vw, 46vw" labelled />
                <span className={styles.pairRow}>
                  <span>{work.title}</span>
                  <span className={styles.pairMeta}>{annotation(work, t)}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* The way on. A full-width row rather than a link in a heading: by the
            time a reader is under the fourth plate, "all thirteen" is the next
            thing they want, and it should be the size of that want. */}
        <Link href="/arbeiten" className={styles.allWorks}>
          <span>{t("home.selected.all").replace("{count}", String(WORKS.length))}</span>
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
