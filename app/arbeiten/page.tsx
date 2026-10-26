import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import KindMark, { type DoorKind } from "@/components/nokta/KindMark";
import { toWallItem, type WallItem } from "@/components/work/WorkCard";
import WorkWall, { type WallFilter } from "@/components/work/WorkWall";
import { KIND_FIELD } from "@/lib/colors";
import { getLocale, getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { PRINTS, type Print } from "@/lib/prints";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, isWorkKind, type Work, type WorkKind } from "@/lib/works";
import styles from "./page.module.css";

/* /arbeiten: the overview, and the page a first mail to a developer or an
   architecture office lands on.

   The masthead is a short title, not the turning-disc plate. That plate is a
   canvas that keeps drawing, and on a phone it sat between the reader and the
   first rendering. The title is real text. Under it, one line on what hangs
   here and the address, so writing to the studio does not mean scrolling to
   the colophon.

   Then the wall. Architecture leads: the six renderings, in a fixed order,
   then the other work in the order lib/works.ts already keeps, then the shop
   prints. Detail pages still step through WORKS, which alternates kinds on
   purpose. This page does not. The order is the same on every visit.

   The two doors (visualisation, editorial) come after the wall. They are the
   way into one material in words; they are not the first thing a reader sees.

   ?kind= still narrows the wall on the server (a link can land on its own
   material). A missing or unknown kind opens on "Alle" rather than 404ing.

   NOTE: this route previously answered with a 308 permanentRedirect to "/".
   Browsers cache permanent redirects hard, so a reader who hit /arbeiten
   before that change may keep landing on the homepage until they clear it.

   The route stays dynamic because the root layout reads the locale cookie.
   Nothing on this page calls connection() or Math.random(). */

/* The chips, in a fixed order: a row that re-sorted itself would be one more
   thing to read. Kinds with nothing on the wall are left out. */
const KIND_ORDER: WorkKind[] = ["rendering", "editorial", "study", "cad", "manual"];

/* The two doors below the wall. */
const DOORS: { kind: DoorKind; href: string; key: string }[] = [
  { kind: "rendering", href: "/3d-visualisierung", key: "arbeiten.door.viz" },
  { kind: "editorial", href: "/arbeiten/abschlussbericht-ki-kommission", key: "arbeiten.door.editorial" },
];

/* Renderings first, strongest projects leading. The rest keep the relative
   order they have in WORKS, so editorial and the studies follow the
   architecture instead of interrupting it. */
const RENDERING_FIRST = [
  "sanktgores",
  "beatbuilding",
  "binome",
  "velostation",
  "teahouse",
  "ipehouse",
] as const;

function orderedWorks(): Work[] {
  const lead: Work[] = [];
  for (const slug of RENDERING_FIRST) {
    const work = WORKS.find((item) => item.slug === slug);
    if (!work) throw new Error(`arbeiten: no work "${slug}"`);
    lead.push(work);
  }
  const leadSlugs = new Set<string>(RENDERING_FIRST);
  return [...lead, ...WORKS.filter((work) => !leadSlugs.has(work.slug))];
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.arbeiten.title");
  const description = t("meta.arbeiten.desc");
  return {
    title,
    description,
    alternates: { canonical: "/arbeiten" },
    ...socialMetadata({ title, description, locale, path: "/arbeiten" }),
  };
}

/** A shop print as a card on the wall. It leads to its page in the shop, and
    its annotation reads CAD-Druck · city · Shop: the building's year is not
    the print's, and the price stays on the print's own page. */
function printToWallItem(print: Print, t: (key: string) => string): WallItem {
  const { width, height } = getMediaSize(print.image);
  return {
    slug: `shop-${print.slug}`,
    href: `/shop/${print.slug}`,
    title: print.title,
    kind: "cad",
    thumb: print.image,
    width,
    height,
    span: 6,
    lift: 0,
    anno: { kind: t("work.kind.cad"), year: print.subtitle, client: t("arbeiten.shopLabel") },
  };
}

/** The first rendering is what a phone paints. Its master thumbnail is a
    1125px JPEG; the card only needs a 640px frame, already encoded, so the
    image optimiser does not build a second, larger file on the way out. */
function leadThumb(item: WallItem): WallItem {
  if (item.slug !== "sanktgores") return item;
  return {
    ...item,
    thumb: "/projects/sanktgores/wall.webp",
    width: 640,
    height: 853,
    unoptimized: true,
  };
}

export default async function ArbeitenPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [t, params] = await Promise.all([getT(), searchParams]);
  const requested = params.kind;

  // Every string the wall shows is translated here: WorkWall is a client
  // component and never reaches for a dictionary itself.
  const items = [
    ...orderedWorks().map((work) => toWallItem(work, t)),
    ...PRINTS.map((print) => printToWallItem(print, t)),
  ].map(leadThumb);
  const kinds = KIND_ORDER.filter((kind) => items.some((item) => item.kind === kind)).map(
    (kind) => ({ kind, label: t(`work.kind.${kind}`) }),
  );

  const initialKind: WallFilter =
    isWorkKind(requested) && kinds.some((k) => k.kind === requested) ? requested : "all";

  const title = `${t("home.wall.label")}.`;

  return (
    <main className={`${styles.page} nk-flat`}>
      <header className={styles.mast}>
        <div className={styles.band}>
          <h1 className={styles.title}>{title}</h1>
        </div>
        <p className={styles.introText}>{t("arbeiten.intro")}</p>
        <p className={styles.contact}>
          <a className={styles.mail} href="mailto:hallo@nokta-studio.de">
            hallo@nokta-studio.de
          </a>
          <Link className={styles.form} href="/kontakt">
            {t("arbeiten.contact.form")}
            <span aria-hidden="true">↗</span>
          </Link>
        </p>
      </header>

      <WorkWall
        items={items}
        kinds={kinds}
        listLabel={t("home.wall.aria")}
        initialKind={initialKind}
        allLabel={t("arbeiten.filter.all")}
        wallClassName={styles.wall}
      />

      <nav className={styles.doors} aria-label={t("arbeiten.doors.aria")}>
        {DOORS.map(({ kind, href, key }, i) => (
          <Reveal key={kind} delay={i * 90} className={styles.doorCell}>
            <Link
              href={href}
              // nk-door is a global hook: KindMark keys its hover state off it.
              className={`${styles.door} nk-door`}
              style={{ "--nk-field": KIND_FIELD[kind] } as CSSProperties}
            >
              <span className={styles.doorMark}>
                <KindMark kind={kind} />
              </span>
              <span className={styles.doorTitle}>{t(`${key}.title`)}</span>
              <span className={styles.doorText}>{t(`${key}.text`)}</span>
              <span className={styles.doorArrow} aria-hidden="true">
                ↗
              </span>
            </Link>
          </Reveal>
        ))}
      </nav>
    </main>
  );
}
