import { Fragment } from "react";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import HomeContact from "@/components/HomeContact";
import MottoDot from "@/components/home/MottoDot";
import ProgressionMark from "@/components/home/ProgressionMark";
import { toWallItem } from "@/components/work/WorkCard";
import WorkWall from "@/components/work/WorkWall";
import { INK, RED } from "@/lib/colors";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";
import { WORKS, type WorkKind } from "@/lib/works";

// The two colours the progression diagram is drawn in: the studio's red for the
// opening point, ink for the line and the form.
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

/* The masthead entrance is choreographed in CSS off two custom properties:
   each word carries its own index, and the block below the headline waits for
   the whole line to have landed. Splitting on whitespace changes no character
   of the copy — the words are re-joined by the real spaces between the spans —
   and a script that doesn't space its words (Japanese) simply yields one span
   and rises as a single line. The step is capped so a long locale can't drag
   the arrival out. */
const STAGGER_CAP = 5;

/* Arms the masthead ceremony — once per session, and before the browser has
   painted a single word of it.

   The markup below states the FINISHED masthead; every entrance rule is gated
   on .nk-ceremony (app/styles/nokta.css, components/home/ProgressionMark.module
   .css). This runs inline, during parsing, above the statement it governs, so
   the class is already on <html> when those rules are matched — there is no
   moment where the finished sheet is painted and then pulled back to restart.
   Without JS, in a session that has already seen it, or if sessionStorage is
   unavailable (private modes, blocked storage), nothing is armed and the sheet
   is simply printed.

   The class is dropped again four seconds later, comfortably after the last
   stroke of the progression mark: a client-side navigation back to this page
   remounts the statement, and a class left on <html> would replay the whole
   arrival every time the reader came home. */
const ARM_CEREMONY = `try{var d=document,k='nk-ceremony';if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,'1');d.documentElement.classList.add(k);setTimeout(function(){d.documentElement.classList.remove(k)},4000)}}catch(e){}`;

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

  const leadWords = t("home.lead").split(" ");
  // How long the headline takes to land — everything under it queues behind.
  const leadSteps = Math.min(leadWords.length - 1, STAGGER_CAP);

  return (
    <main className="nk-home">
      {/* Runs before the statement below it is parsed — see ARM_CEREMONY. */}
      <script dangerouslySetInnerHTML={{ __html: ARM_CEREMONY }} />
      <section
        className="nk-statement"
        style={{ "--nk-lead-steps": leadSteps } as CSSProperties}
      >
        <h1 className="nk-statement-lead">
          {leadWords.map((word, i) => (
            <Fragment key={`${i}-${word}`}>
              {i > 0 ? " " : null}
              <span
                className="nk-statement-word"
                style={{ "--i": Math.min(i, STAGGER_CAP) } as CSSProperties}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </h1>
        <p className="nk-mono-caption nk-statement-sub">{t("home.sub")}</p>
        <p className="nk-statement-motto">
          {motto(t)}
          {/* The one coloured mark on the page — and the one that wanders. */}
          <MottoDot />
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
