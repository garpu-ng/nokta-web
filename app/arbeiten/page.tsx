import type { Metadata } from "next";
import { toWallItem } from "@/components/work/WorkCard";
import WorkWall from "@/components/work/WorkWall";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, type WorkKind } from "@/lib/works";
import styles from "./page.module.css";

/* The wall — one body of work, all thirteen sheets. It used to be the second
   half of the homepage; since Kolonnade the homepage shows four works large
   and the full set lives here, at the route every detail URL already implies
   (/arbeiten/teahouse advertises /arbeiten as its directory, and people try
   it). The label names the wall, it does not sort it.

   NOTE: this route previously answered with a 308 permanentRedirect to "/".
   Browsers cache permanent redirects hard, so a reader who hit /arbeiten
   before this change may keep landing on the homepage until they clear it —
   the redirect is gone from the code, but not from their browser. */

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

export default async function ArbeitenPage() {
  const t = await getT();

  // Every string the wall shows is translated here: WorkWall is a client
  // component and never reaches for a dictionary itself.
  const items = WORKS.map((work) => toWallItem(work, t));
  const kinds = WORKS.reduce<{ kind: WorkKind; label: string }[]>((acc, work) => {
    if (!acc.some((k) => k.kind === work.kind)) {
      acc.push({ kind: work.kind, label: t(`work.kind.${work.kind}`) });
    }
    return acc;
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.heading}>
          {t("home.wall.label")}
          <span className={styles.period}>.</span>
        </h1>
        <p className={styles.count}>
          {t("home.selected.all").replace("{count}", String(WORKS.length))}
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
        />
      </div>
    </main>
  );
}
