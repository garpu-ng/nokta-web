import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HomeContact from "@/components/HomeContact";
import TeaserVideo from "@/components/TeaserVideo";
import { KIND_FIELD } from "@/lib/colors";
import { getLocale, getT, type Translate } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, getWork, type Work, type WorkKind } from "@/lib/works";
import styles from "./page.module.css";

/* The homepage states what the studio does, proves it with four works shown
   large, and asks for the project. The full thirteen-work wall lives at
   /arbeiten — this page shows the fewest works it can get away with, at the
   biggest size it can give them. */

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

/* The three rows under the hero — the four services on /studio compressed to
   three, and each one a door into the WORK rather than into the process: a
   reader who wants renderings wants to see renderings, not to read how they
   are made. Each row lands on the wall already filtered to its material, and
   wears that material's motto colour as a solid field.

   The colours are the old site's palette, back for this one job. It is the
   single place on the site where anything other than the red is a surface —
   which is why they are here and nowhere else. */
const SERVICES: { kind: WorkKind }[] = [
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

/** A work's plate, sized from its real thumbnail so nothing shifts on load. */
function Plate({ work, sizes }: { work: Work; sizes: string }) {
  const { width, height } = getMediaSize(work.thumb);
  return (
    <span className={styles.plate}>
      <Image
        src={work.thumb}
        alt={work.title}
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

      {/* ── Intro: the claim left, the practice right ─────────────── */}
      <section className={styles.intro}>
        <p className={styles.introStatement}>{t("home.intro.statement")}</p>
        <p className={styles.introBody}>{t("home.intro.body")}</p>
      </section>

      {/* ── What we sell, in three fields ─────────────────────────── */}
      <section className={styles.services} aria-label={t("home.services.aria")}>
        {SERVICES.map(({ kind }, i) => (
          <Link
            key={kind}
            href={`/arbeiten?kind=${kind}`}
            className={styles.service}
            // The material's own colour, spent as the field it stands on.
            style={{ "--nk-field": KIND_FIELD[kind] } as CSSProperties}
          >
            <span className={styles.serviceFolio}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={styles.serviceTitle}>{t(`home.svc.${i}.title`)}</span>
            <span className={styles.serviceText}>{t(`home.svc.${i}.short`)}</span>
            <span className={styles.serviceArrow} aria-hidden="true">
              ↗
            </span>
          </Link>
        ))}
      </section>

      {/* ── Four works, large ─────────────────────────────────────── */}
      <section className={styles.works} aria-labelledby="nk-selected">
        <div className={styles.worksHead}>
          <h2 id="nk-selected" className={styles.worksTitle}>
            {t("home.selected")}
          </h2>
          <Link href="/arbeiten" className={styles.worksAll}>
            {t("home.selected.all").replace("{count}", String(WORKS.length))}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </div>

        {/* Spread one — plate left, caption right, both sitting on the same
            baseline so the caption reads as a note in the plate's margin. */}
        <article className={styles.spread}>
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
        </article>

        {/* Spread two — mirrored, so the page never settles into a rhythm. */}
        <article className={`${styles.spread} ${styles.spreadMirror}`}>
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
        </article>

        {/* The pair — two plates side by side, each captioned in one mono row. */}
        <div className={styles.pair}>
          {pair.map((work) => (
            <Link
              key={work.slug}
              href={`/arbeiten/${work.slug}`}
              className={styles.pairItem}
            >
              <Plate work={work} sizes="(max-width: 899px) 100vw, 46vw" />
              <span className={styles.pairRow}>
                <span>{work.title}</span>
                <span className={styles.pairMeta}>{annotation(work, t)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <HomeContact
        title={t("home.contact.title")}
        body={t("home.contact.body")}
        cta={t("home.contact.cta")}
      />
    </main>
  );
}
