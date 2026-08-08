import { getT } from "@/lib/i18n";
import styles from "./FilmPlate.module.css";

/* A film, shown the way a rendering is shown: one plate at the measure of the
   page, in the same window and behind the same ink hairline as every project
   shot (.wa-project-images / .wa-image-window / .wa-project-img, app/styles/
   nokta.css). A moving work is still a work on the wall — it does not get its
   own furniture.

   Everything about this player is the opposite of the homepage band, and on
   purpose. That one is a decoration: muted, looping, no controls, started from
   script, and aria-hidden because the headline already says what it says. This
   one is the work itself. It carries sound that was composed for it, so:

     - no autoplay. Sound that arrives unasked is a reason to leave a page, and
       every browser blocks it anyway — a clip that autoplays with audio simply
       does not start, which is worse than not trying.
     - native `controls`. A studio site is tempted to draw its own transport,
       and a drawn one has to re-earn what the browser gives away: a keyboard
       target, a volume control, a scrub bar a screen reader can announce, and
       the full-screen button that lets someone actually watch this. None of
       that is worth losing to match a hairline, and this component ships no
       JavaScript at all as a result.
     - `preload="metadata"`, so opening the page costs the poster and a few KB
       of header rather than the whole film. The reader asks for the rest —
       which matters more here than anywhere else on the site, because at 1:45
       this is the heaviest thing nokta serves.

   The poster is the film's own first frame, which is also the still the wall
   hangs and the image the social card carries — one frame doing three jobs, so
   the piece looks the same wherever it is met. */

/** The film's own proportion, spent the way .wa-project-img wants it. */
const RATIO = { width: 1280, height: 720 };

/** The film, in the order a browser should prefer it: the first entry whose
    codecs it recognises is the one it fetches, and it never downloads the
    others. The codec strings are stated in full rather than a bare
    "video/webm", because a bare type is a claim about the container only — a
    browser that plays WebM but not AV1 would accept the source and then fail
    on it, with no second chance at the fallback below. */
const SOURCES: { src: string; type: string }[] = [
  // AV1 + Opus: 8.3 MB against the mp4's 22.1, at a marginally *better* SSIM
  // against the master (0.9865 vs 0.9854). One file's worth of repo for a third
  // of the download, wherever the browser can take it.
  { src: "/lichtspiel/film.webm", type: 'video/webm; codecs="av01.0.08M.08, opus"' },
  // H.264 High @ L4.0 + the master's own AAC, copied rather than re-encoded.
  // Safari only decodes AV1 on hardware that has it (M3 / A17 and later), so
  // this is not a legacy fallback — it is what a good many Macs will play.
  { src: "/lichtspiel/film.mp4", type: 'video/mp4; codecs="avc1.640028, mp4a.40.2"' },
];

export default async function FilmPlate() {
  const t = await getT();

  return (
    /* The stack's own class does the figure's layout — a column with the same
       18px rhythm the project shots stand in — so the plate and its caption are
       one <figure>, and the caption is inside it where a figcaption belongs. */
    <figure className={`wa-project-images ${styles.plate}`}>
      <div
        className="wa-image-window"
        style={{ "--nk-ratio": `${RATIO.width} / ${RATIO.height}` } as React.CSSProperties}
      >
        <video
          className={`wa-project-img ${styles.film}`}
          poster="/lichtspiel/still.jpg"
          width={RATIO.width}
          height={RATIO.height}
          controls
          playsInline
          preload="metadata"
          /* A <video> has no accessible name of its own — a screen reader
             announces it as a media player and nothing else. The figcaption
             below states the format; this says what the film is. */
          aria-label={t("work.lichtspiel.player")}
        >
          {SOURCES.map(({ src, type }) => (
            <source key={src} src={src} type={type} />
          ))}
          {t("work.lichtspiel.noVideo")}
        </video>
      </div>
      <figcaption className={`nk-caption ${styles.spec}`}>
        {t("work.lichtspiel.spec")}
      </figcaption>
    </figure>
  );
}
