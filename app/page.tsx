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

/* The works the homepage shows, in the order they appear: the first two take a
   spread each, the rest stand together in the strip that closes the section.
   Named rather than derived: the selection is an editorial decision — two
   renderings, one editorial commission, one print, one manual — and a rule like
   "first of each kind" would silently re-cut it the next time a work is added to
   the wall. The slugs are resolved against lib/works.ts, so a renamed work fails
   the build here instead of rendering a hole.

   `plate` overrides the image a work is shown at plate size with, for the case
   where its wall thumbnail is the wrong shape to be given a whole plate. The
   wall wants one small image per work and hangs thirteen of them by ratio;
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

/** kind · year — the mono line above a spread's title and beside a strip's. */
function annotation(work: Work, t: Translate): string {
  return `${t(`work.kind.${work.kind}`)} · ${work.year}`;
}

/** The work's own proportion, in the form CSS spends it: `w / h`, which is at
    once the plate's aspect-ratio, the width it derives from its height, and (in
    the strip) its share of the row. */
function ratio(work: Featured): CSSProperties {
  const { width, height } = getMediaSize(work.plate);
  return { "--nk-ratio": `${width} / ${height}` } as CSSProperties;
}

/* What app/page.module.css cuts a plate to above the phone breakpoint, per
   context and in two steps: the desktop figure and the tablet one (≤1199px).
   `h` is the height; `max` is the widest the plate's column gets on that sheet,
   where a column caps it — a plate renders at the smaller of h × ratio and that.
   (A spread's plate shares the row with the caption's measure; a strip's plate is
   only ever capped by its own height.)

   They are named here because a plate is no longer a share of the sheet but its
   height times its work's ratio, so `sizes` has to be stated in pixels. Keep
   them in step with --plate-h in the stylesheet; nothing but the hint is wrong
   if they drift. */
const PLATE = {
  spread: [{ h: 560, max: 820 }, { h: 460, max: 540 }],
  strip: [{ h: 520 }, { h: 420 }],
} as const;

type PlateStep = { readonly h: number; readonly max?: number };

/** What the browser needs to choose a source: the plate's rendered width, per
    sheet. Where the plate stands in a column it is that column's figure — its
    height times the work's own ratio, held to what the column allows. Where it
    takes the whole measure it is the sheet less its two gutters, and the gutter
    tightens twice on the way down to a phone (see --nk-gutter in
    app/styles/tokens.css): a plate is full-measure on a phone, and a wide-plated
    spread is full-measure from the breakpoint it stacks at. */
function plateSizes(work: Featured, at: keyof typeof PLATE): string {
  const { width, height } = getMediaSize(work.plate);
  const r = width / height;
  const [desktop, tablet] = PLATE[at];
  const px = ({ h, max }: PlateStep) => Math.round(Math.min(h * r, max ?? Infinity));
  const measure = ["(max-width: 899px) calc(100vw - 40px)"];
  if (at === "spread" && isWide(work)) {
    measure.push(
      "(max-width: 1199px) calc(100vw - 64px)",
      "(max-width: 1279px) calc(100vw - 80px)",
    );
  } else {
    measure.push(`(max-width: 1199px) ${px(tablet)}px`);
  }
  return [...measure, `${px(desktop)}px`].join(", ");
}

/** A plate is wide when its own ratio asks for more width than the column the
    caption leaves it — the point at which sharing the row starts costing the
    plate its height instead of costing the caption its measure. A spread with
    one stacks a breakpoint early (see .spreadWide in the stylesheet), rather
    than shrinking a panorama to a strip of itself on a middling sheet. */
function isWide(work: Featured): boolean {
  const { width, height } = getMediaSize(work.plate);
  const [{ h, max }] = PLATE.spread;
  return width / height > max / h;
}

/** The classes a spread wears: mirrored or not, and wide-plated or not. */
function spreadClass(work: Featured, mirror = false): string {
  return [styles.spread, mirror && styles.spreadMirror, isWide(work) && styles.spreadWide]
    .filter(Boolean)
    .join(" ");
}

/** A work's plate, cut to the work's own proportion.

    The image's real dimensions do three jobs: they reserve the right space so
    nothing shifts on load, they hand the stylesheet the work's ratio, and they
    size the `sizes` hint. `at` says which context's figures to hint with.

    `labelled` says whether the link around this plate already carries the
    work's title as text. In the strip it does, so the alt is dropped rather
    than announced twice; on a spread the plate is alone inside its link, and
    without the alt that link would have no accessible name at all. */
function Plate({
  work,
  at,
  labelled = false,
}: {
  work: Featured;
  at: keyof typeof PLATE;
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
        sizes={plateSizes(work, at)}
        className={styles.plateImg}
      />
    </span>
  );
}

export default async function HomePage() {
  const t = await getT();
  const [first, second, ...strip] = featured();

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
          Two spreads and a strip, then the door to all thirteen. */}
      <section className={styles.section} aria-labelledby="nk-reg-03">
        <SectionRule id="nk-reg-03" label={t("home.selected")} />

        {/* Spread one — plate left, caption right, both sitting on the same
            baseline so the caption reads as a note in the plate's margin. */}
        <Reveal as="article" className={spreadClass(first)}>
          <Link href={`/arbeiten/${first.slug}`} className={styles.spreadPlate}>
            <Plate work={first} at="spread" />
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
        <Reveal as="article" className={spreadClass(second, true)}>
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
            <Plate work={second} at="spread" />
          </Link>
        </Reveal>

        {/* The strip — the rest of the selection, side by side on one baseline,
            each plate captioned in a single mono row. Every item carries its
            work's ratio because that is its share of the row: the strip is
            justified to the measure, so the plates come out the same height
            whatever their proportions (see .strip in the stylesheet). */}
        <div className={styles.strip}>
          {strip.map((work, i) => (
            <Reveal key={work.slug} className={styles.stripItem} delay={i * 90} style={ratio(work)}>
              <Link href={`/arbeiten/${work.slug}`} className={styles.stripLink}>
                <Plate work={work} at="strip" labelled />
                <span className={styles.stripRow}>
                  <span>{work.title}</span>
                  <span className={styles.stripMeta}>{annotation(work, t)}</span>
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
