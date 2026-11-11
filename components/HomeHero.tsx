import Link from "next/link";
import InterferenceField from "@/components/nokta/InterferenceField";
import styles from "./HomeHero.module.css";

/* The homepage's first screen: the studio's dot plate, with the studio's
   sentence to the left and one of its renderings to the right, screened into
   the raster as a halftone (plate/pictureScreen.ts). The masthead above
   already carries the wordmark, so the plate shows what the sentence claims:
   a building, made visible in dots. The text is real page text over the
   canvas, and every line of it, and each button, is marked data-dodge so the
   raster leaves it clean ground (InterferenceField's dodgeText). The picture
   is placed from those same boxes, so it cannot land on the text. A visitor
   who never scrolls still leaves knowing what nokta makes and where to go
   next.

   On a phone the picture stands at the top and the text below it. The copy is
   in the box's flow rather than laid over a fixed ratio, so a long headline
   makes the box taller instead of running into the picture. */

/** The halftone's source: Beat Building, the street front, reduced to a
    180x240 greyscale file (about 10KB). Sky and neighbours are darkened in
    it so the tower stands on ink. */
const PICTURE = "/projects/beatbuilding/halftone.jpg";

export default function HomeHero({
  eyebrow,
  title,
  sub,
  ctaWork,
  ctaContact,
  audiences = [],
  audiencesLabel,
  pictureAlt,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  ctaWork: string;
  ctaContact: string;
  /** the pages written for one kind of client, linked under the buttons */
  audiences?: { href: string; label: string }[];
  audiencesLabel?: string;
  /** One sentence saying what the halftone picture shows; the canvas itself
      is hidden from assistive tech. */
  pictureAlt: string;
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.box} data-dodge-scope>
        <InterferenceField picture={PICTURE} dodgeText className={styles.field} />

        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span data-dodge="lines">{eyebrow}</span>
          </p>
          <h1 className={styles.title}>
            <span data-dodge="lines">{title}</span>
          </h1>
          <p className={styles.sub}>
            <span data-dodge="lines">{sub}</span>
          </p>
          <div className={styles.actions}>
            <Link href="/kontakt" className={styles.primary} data-dodge="box">
              {ctaContact}
            </Link>
            <Link href="/arbeiten" className={styles.secondary} data-dodge="box">
              {ctaWork}
            </Link>
          </div>
          {audiences.length > 0 ? (
            <nav className={styles.audiences} aria-label={audiencesLabel}>
              {audiences.map(({ href, label }) => (
                <Link key={href} href={href} className={styles.audience} data-dodge="box">
                  {label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        {/* After the copy, so a screen reader meets the heading first. */}
        <p className="nk-sr-only">{pictureAlt}</p>
      </div>
    </section>
  );
}
