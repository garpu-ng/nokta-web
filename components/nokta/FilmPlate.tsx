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
       of header rather than the whole film. The reader asks for the rest.
       That matters on a film page, where the file is the work itself.

   The poster is the film's own first frame, which is also the still the wall
   hangs and the image the social card carries — one frame doing three jobs, so
   the piece looks the same wherever it is met. */

/** The film's own proportion, spent the way .wa-project-img wants it. A cut
    that is not 16:9 stays that shape: the still, the wall's loop and this
    plate are all cut to the same ratio, so the piece is one shape wherever
    it is met. */
export type FilmRatio = { width: number; height: number };

/** i18n keys. The plate resolves them, the same way it always has, so a
    caller hands over which film this is and not a second translator. */
export type FilmTexts = {
  player: string;
  spec: string;
  noVideo: string;
};

export type FilmPlateProps = {
  /** Public directory of this film, leading slash, no trailing slash.
      `film.webm`, `film.mp4` and `still.jpg` live directly inside it. */
  base: string;
  ratio: FilmRatio;
  texts: FilmTexts;
};

/** Codec strings shared by every film on the plate. Stated in full rather
    than a bare "video/webm", because a bare type is a claim about the
    container only: a browser that plays WebM but not AV1 would accept the
    source and then fail on it, with no second chance at the fallback below.
    AV1 Main, level 8, 8-bit, with Opus. H.264 High @ L4.0 with the source's
    own AAC-LC. Safari only decodes AV1 on hardware that has it (M3 / A17
    and later), so the mp4 is not a legacy fallback. It is what a good many
    Macs will play. */
const WEBM = 'video/webm; codecs="av01.0.08M.08, opus"';
const MP4 = 'video/mp4; codecs="avc1.640028, mp4a.40.2"';

export default async function FilmPlate({ base, ratio, texts }: FilmPlateProps) {
  const t = await getT();
  // AV1 first: the first entry whose codecs a browser recognises is the one
  // it fetches, and it never downloads the others. On a film of this length
  // that is the difference between a page that starts playing and one that
  // buffers.
  const sources = [
    { src: `${base}/film.webm`, type: WEBM },
    { src: `${base}/film.mp4`, type: MP4 },
  ];

  return (
    /* The stack's own class does the figure's layout: a column with the same
       18px rhythm the project shots stand in, so the plate and its caption are
       one <figure>, and the caption is inside it where a figcaption belongs. */
    <figure className={`wa-project-images ${styles.plate}`}>
      <div
        className="wa-image-window"
        style={{ "--nk-ratio": `${ratio.width} / ${ratio.height}` } as React.CSSProperties}
      >
        <video
          className={`wa-project-img ${styles.film}`}
          poster={`${base}/still.jpg`}
          width={ratio.width}
          height={ratio.height}
          controls
          playsInline
          preload="metadata"
          /* A <video> has no accessible name of its own. A screen reader
             announces it as a media player and nothing else. The figcaption
             below states the format; this says what the film is. */
          aria-label={t(texts.player)}
        >
          {sources.map(({ src, type }) => (
            <source key={src} src={src} type={type} />
          ))}
          {t(texts.noVideo)}
        </video>
      </div>
      <figcaption className={`nk-caption ${styles.spec}`}>
        {t(texts.spec)}
      </figcaption>
    </figure>
  );
}
