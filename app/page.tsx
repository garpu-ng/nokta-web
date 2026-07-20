import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";
import { BRANCHES, BRANCH_BY_KEY, type BranchKey, inkOn } from "@/lib/branches";
import TeaserVideo from "@/components/TeaserVideo";
import HomeContact from "@/components/HomeContact";
import ProgressionMark from "@/components/home/ProgressionMark";
import BranchCardMark from "@/components/home/BranchCardMark";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";

// The three motto words each carry their branch's motto-colour:
//   point → nokta (red) · line → line (green) · form → cube/arch (cobalt)
// Sourced from lib/branches.ts so the words, the SVG progression and the branch
// heroes share one source of truth for the colours.
const MOTTO_KEYS = ["point", "line", "form"] as const;
type MottoKey = (typeof MOTTO_KEYS)[number];
const MOTTO: Record<MottoKey, string> = {
  point: BRANCH_BY_KEY.nokta.accent,
  line: BRANCH_BY_KEY.line.accent,
  form: BRANCH_BY_KEY.arch.accent,
};

// Which miniature mark each landing card carries (home is unused — it isn't a
// landing card — but keeps the map total over BranchKey).
const CARD_MARK: Record<BranchKey, "point" | "line" | "cube"> = {
  home: "point",
  nokta: "point",
  arch: "cube",
  line: "line",
};

/* Splits the motto template ("Vom {point} zur {line} zur {form}.") into plain
   text and coloured word segments, wrapping each {token} in its motto-colour.
   Keeping the sentence in one i18n string (with tokens) lets every locale phrase
   the progression its own way — German chains "vom … zur …", Turkish attaches
   case suffixes ("{point}dan {line}ye"), Japanese uses particles — while the
   three words stay individually colour-wrappable. */
function renderMotto(template: string, word: (k: MottoKey) => string): ReactNode[] {
  return template.split(/(\{point\}|\{line\}|\{form\})/).map((part, i) => {
    const key = MOTTO_KEYS.find((k) => `{${k}}` === part);
    if (!key) return <Fragment key={i}>{part}</Fragment>;
    return (
      <span key={i} className="nk-motto-word" style={{ color: MOTTO[key] }}>
        {word(key)}
      </span>
    );
  });
}

/* Trim brackets hugging the four corners of the pillar — the one quiet
   print-forensics touch that frames the manifesto as a press sheet, tying home
   into the family of crop marks · registration · Schriftfeld already worn by the
   branch heroes. Paper stroke, low opacity (styled in nokta.css). */
function CropMark({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const d = {
    tl: "M0 14V0H14",
    tr: "M16 0H30V14",
    bl: "M0 16V30H14",
    br: "M30 16V30H16",
  }[corner];
  return (
    <svg className={`nk-pillar__crop nk-pillar__crop--${corner}`} viewBox="0 0 30 30" aria-hidden="true">
      <path d={d} />
    </svg>
  );
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
  return (
    <div className="nk-home">
      {/* Teaser banner — tab-width, footage with the wordmark centred on it. */}
      <TeaserVideo />

      {/* Black pillar — video-wide, extends from below the video to the footer */}
      <div className="nk-pillar">
        {/* Trim marks framing the pillar as a press sheet. */}
        <CropMark corner="tl" />
        <CropMark corner="tr" />
        <CropMark corner="bl" />
        <CropMark corner="br" />

        <main className="nk-landing">
          {/* The descriptive lead … */}
          <p className="nk-landing-lead">{t("home.lead.body")}</p>

          {/* … its closing motto, performed: the three words in branch colours … */}
          <p className="nk-landing-motto">
            {renderMotto(t("home.motto"), (k) => t(`home.motto.${k}`))}
          </p>

          {/* … then the same progression, drawn. */}
          <ProgressionMark colors={MOTTO} />

          <div className="nk-branch-grid">
            {BRANCHES.map((b, i) => (
              <Link
                key={b.key}
                href={b.path}
                className="nk-branch-card"
                style={{ "--accent": b.accent, "--card-fg": inkOn(b.accent) } as CSSProperties}
              >
                {/* Header of the press sheet: a mono folio ("01" …) sitting on the
                    card's hairline top rule, the miniature discipline mark stamped
                    opposite it, top-right. The folio is derived from the map index
                    (same idiom as the /point ServiceIndex rows), so it needs no
                    i18n string. */}
                <span className="nk-branch-card__head">
                  <span className="nk-branch-card__folio">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <BranchCardMark variant={CARD_MARK[b.key]} />
                </span>
                <span className="nk-branch-card__key">
                  nokta.{b.label}
                  <span className="nk-dot">.</span>
                </span>
                <span className="nk-branch-card__tag">{t(`branch.${b.key}.tag`)}</span>
                <span className="nk-branch-card__desc">{t(`branch.${b.key}.desc`)}</span>
              </Link>
            ))}
          </div>
        </main>
      </div>

      <HomeContact
        title={t("home.contact.title")}
        body={t("home.contact.body")}
        cta={t("home.contact.cta")}
      />
    </div>
  );
}
