import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import DiscField from "@/components/nokta/DiscField";
import KindMark, { type DoorKind } from "@/components/nokta/KindMark";
import PlateHead from "@/components/nokta/PlateHead";
import { toWallItem, type WallItem } from "@/components/work/WorkCard";
import WorkWall, { type WallFilter } from "@/components/work/WorkWall";
import { KIND_FIELD } from "@/lib/colors";
import { getLocale, getT, requestLocale } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { PRINTS, type Print } from "@/lib/prints";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, type WorkKind } from "@/lib/works";
import styles from "./page.module.css";

/* /arbeiten: the overview. A short line on what hangs here, two doors into
   the two materials the studio leads with, then the whole wall: every work
   and the shop's line prints, in one fixed shuffle, with "Alle" pressed.

   The doors are the homepage's material fields made larger: visualisation
   opens /3d-visualisierung, the page that states that service in words;
   editorial opens the report, which is the editorial work on the site.

   ?kind= still narrows the wall. The document itself is the full wall, one
   prerendered page per language. A blocking script and a style tag apply the
   query before the wall paints, so the filter is not a separate render.

   NOTE: this route previously answered with a 308 permanentRedirect to "/".
   Browsers cache permanent redirects hard, so a reader who hit /arbeiten
   before that change may keep landing on the homepage until they clear it. */

/* The three door colours, handed to the plate in the masthead. Module scope so
   it is given one array reference for the life of the page. */
const PLATE_COLOURS = [KIND_FIELD.rendering, KIND_FIELD.editorial, KIND_FIELD.cad];

/* The chips, in a fixed order whatever the shuffle does: a row that re-sorted
   itself on every visit would be one more thing to read. Kinds with nothing on
   the wall are left out. */
const KIND_ORDER: WorkKind[] = ["rendering", "editorial", "study", "cad", "manual"];

/* The two doors above the wall. */
const DOORS: { kind: DoorKind; href: string; key: string }[] = [
  { kind: "rendering", href: "/3d-visualisierung", key: "arbeiten.door.viz" },
  { kind: "editorial", href: "/arbeiten/abschlussbericht-ki-kommission", key: "arbeiten.door.editorial" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  requestLocale((await params).locale);
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

/** mulberry32. A fixed seed, not Math.random: the draw has to be the same on
    every request and in every language, or the page cannot be prerendered. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates, then a few more draws until no three cards of one kind stand
    in a row, so a shuffle never reads as a section by accident. Gives up after
    a handful of tries and keeps the last draw: it is a nicety, not a rule.
    The seed is constant, so the order is stable for the life of a build. */
function shuffle(items: WallItem[]): WallItem[] {
  const rand = mulberry32(0x6e6b7461);
  let out = items;
  for (let attempt = 0; attempt < 30; attempt++) {
    out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    const clumped = out.some(
      (item, i) => i >= 2 && item.kind === out[i - 1].kind && item.kind === out[i - 2].kind,
    );
    if (!clumped) break;
  }
  return out;
}

export default async function ArbeitenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  requestLocale((await params).locale);
  const t = await getT();

  // Every string the wall shows is translated here: WorkWall is a client
  // component and never reaches for a dictionary itself.
  const items = shuffle([
    ...WORKS.map((work) => toWallItem(work, t)),
    ...PRINTS.map((print) => printToWallItem(print, t)),
  ]);
  const kinds = KIND_ORDER.filter((kind) => items.some((item) => item.kind === kind)).map(
    (kind) => ({ kind, label: t(`work.kind.${kind}`) }),
  );

  // The document is always the whole wall, so the route stays static. The
  // script stamps the query onto <html> before the cards are parsed, and the
  // style tag hides the rest. Neither changes the HTML per query.
  const initialKind: WallFilter = "all";
  const presentKinds = kinds.map((entry) => entry.kind);
  // A real script tag, not next/script: Next queues that one until after the
  // first paint. This one is in the HTML and runs while the parser is still
  // above the wall, so ?kind= is applied before those cards are drawn.
  const wallFilterScript = `<script>(function(){try{var allowed=${JSON.stringify(presentKinds)};var k=new URLSearchParams(location.search).get("kind");if(k&&allowed.indexOf(k)!==-1)document.documentElement.dataset.nkWall=k;}catch(e){}})()</script>`;
  const wallFilterCss = [
    ...presentKinds.map(
      (kind) =>
        `html[data-nk-wall="${kind}"] [data-wall-kind]:not([data-wall-kind="${kind}"]){display:none}` +
        `html[data-nk-wall="${kind}"] [data-wall-filter="${kind}"]{background:var(--paper);border-color:var(--paper);color:var(--ink)}`,
    ),
    `html[data-nk-wall] [data-wall-filter="all"][aria-pressed="true"]{background:none;border-color:var(--nk-hair);color:var(--paper)}`,
  ].join("");

  const title = `${t("home.wall.label")}.`;

  return (
    <main className={styles.page}>
      {/* The studio's motto, turned into geometry: a field of discs hanging
          in depth, each of them a point, a line or a form depending only on
          how far round it has swung. */}
      <PlateHead title={title}>
        <DiscField palette={PLATE_COLOURS} motto={title} />
      </PlateHead>

      <section className={styles.intro}>
        <p className={styles.introText}>{t("arbeiten.intro")}</p>
      </section>

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

      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: wallFilterScript }} />
      <style dangerouslySetInnerHTML={{ __html: wallFilterCss }} />
      <WorkWall
        items={items}
        kinds={kinds}
        listLabel={t("home.wall.aria")}
        initialKind={initialKind}
        allLabel={t("arbeiten.filter.all")}
        wallClassName={styles.wall}
      />
    </main>
  );
}
