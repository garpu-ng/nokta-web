import type { Metadata } from "next";
import HomeContact from "@/components/HomeContact";
import ProgressionMark from "@/components/home/ProgressionMark";
import { toWallItem } from "@/components/work/WorkCard";
import WorkWall from "@/components/work/WorkWall";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, type WorkKind } from "@/lib/works";

// The two colours the progression diagram is drawn in: the studio's red for the
// opening point, ink for the line and the form. (A later restructure step moves
// these into lib/colors.ts together with paper and ink.)
const RED = "#b83636";
const INK = "#1a1a18";
const MARK_COLORS = { point: RED, line: INK, form: INK };

/* The motto is one i18n string with {tokens} so every locale can phrase the
   progression its own way — German chains "vom … zur …", Turkish attaches case
   suffixes, Japanese uses particles. All three words are ink; the only colour in
   the sentence is its closing period, set as the studio's red dot, so the
   template's own final period is dropped here. */
function motto(t: (key: string) => string): string {
  const words: Record<string, string> = {
    point: t("home.motto.point"),
    line: t("home.motto.line"),
    form: t("home.motto.form"),
  };
  return t("home.motto")
    .replace(/\{(point|line|form)\}/g, (match, key: string) => words[key] ?? match)
    .replace(/[.。]\s*$/, "");
}

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

export default async function HomePage() {
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
    <main className="nk-home">
      <section className="nk-statement">
        <h1 className="nk-statement-lead">{t("home.lead")}</h1>
        <p className="nk-mono-caption nk-statement-sub">{t("home.sub")}</p>
        <p className="nk-statement-motto">
          {motto(t)}
          <span className="nk-statement-dot">.</span>
        </p>
        {/* The same progression, drawn. */}
        <ProgressionMark colors={MARK_COLORS} />
      </section>

      {/* The wall — one body of work. The label names it, it does not sort it. */}
      <section className="nk-wall" aria-labelledby="nk-wall-label">
        <h2 id="nk-wall-label" className="nk-mono-caption nk-wall-label">
          {t("home.wall.label")}
        </h2>
        <WorkWall
          items={items}
          kinds={kinds}
          allLabel={t("work.filter.all")}
          listLabel={t("home.wall.aria")}
        />
      </section>

      <HomeContact
        title={t("home.contact.title")}
        body={t("home.contact.body")}
        cta={t("home.contact.cta")}
      />
    </main>
  );
}
