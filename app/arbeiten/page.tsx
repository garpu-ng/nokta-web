import type { Metadata } from "next";
import DiscField from "@/components/nokta/DiscField";
import PlateHead from "@/components/nokta/PlateHead";
import { toWallItem } from "@/components/work/WorkCard";
import WorkWall from "@/components/work/WorkWall";
import { KIND_FIELD } from "@/lib/colors";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, isWorkKind, type WorkKind } from "@/lib/works";
import styles from "./page.module.css";

/* The wall — one body of work, all thirteen sheets. It used to be the second
   half of the homepage; since Kolonnade the homepage shows four works large
   and the full set lives here, at the route every detail URL already implies
   (/arbeiten/teahouse advertises /arbeiten as its directory, and people try
   it). The label names the wall, it does not sort it.

   ?kind= narrows it to one material, which is where the homepage's three
   doors land. The filter is read here rather than in the browser, so the
   narrowed wall is what the server sends — no flash of the full set, and the
   URL is shareable. An unknown kind is simply ignored and the whole wall is
   shown; a filter is not worth a 404.

   NOTE: this route previously answered with a 308 permanentRedirect to "/".
   Browsers cache permanent redirects hard, so a reader who hit /arbeiten
   before this change may keep landing on the homepage until they clear it —
   the redirect is gone from the code, but not from their browser. */

/* The three materials the wall is made of, handed to the plate in the
   masthead. Module scope so it is given one array reference for the life of
   the page rather than a fresh one on each render. */
const DOOR_COLOURS = [KIND_FIELD.rendering, KIND_FIELD.editorial, KIND_FIELD.cad];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.arbeiten.title");
  const description = t("meta.site.desc");
  return {
    title,
    description,
    alternates: { canonical: "/arbeiten" },
    ...socialMetadata({ title, description, locale, path: "/arbeiten" }),
  };
}

export default async function ArbeitenPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getT();
  const requested = (await searchParams).kind;
  const initialKind = isWorkKind(requested) ? requested : null;

  // Every string the wall shows is translated here: WorkWall is a client
  // component and never reaches for a dictionary itself.
  const items = WORKS.map((work) => toWallItem(work, t));
  const kinds = WORKS.reduce<{ kind: WorkKind; label: string }[]>((acc, work) => {
    if (!acc.some((k) => k.kind === work.kind)) {
      acc.push({ kind: work.kind, label: t(`work.kind.${work.kind}`) });
    }
    return acc;
  }, []);

  const title = `${t("home.wall.label")}.`;

  return (
    <main className={styles.page}>
      {/* The studio's motto, turned into geometry: a field of discs hanging
          in depth, each of them a point, a line or a form depending only on
          how far round it has swung. Nothing is cut around the title — the
          discs nearest it have turned edge on to make the room. */}
      <PlateHead title={title}>
        <DiscField palette={DOOR_COLOURS} motto={title} />
      </PlateHead>

      <div className={styles.head}>
        <p className={styles.count}>
          {t("home.selected.all").replace(
            "{count}",
            String(
              initialKind
                ? WORKS.filter((w) => w.kind === initialKind).length
                : WORKS.length,
            ),
          )}
        </p>
      </div>

      {/* The wall carries no gutter of its own — it is handed one, the same
          one every other block on the page stands on. */}
      <div className={styles.wall}>
        <WorkWall
          items={items}
          kinds={kinds}
          allLabel={t("work.filter.all")}
          listLabel={t("home.wall.aria")}
          initialKind={initialKind}
        />
      </div>
    </main>
  );
}
