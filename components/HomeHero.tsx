import Link from "next/link";
import InterferenceField from "@/components/nokta/InterferenceField";
import styles from "./HomeHero.module.css";

/* The homepage's first screen: the studio's dot plate, with the wordmark set
   to the right and the studio's sentence to the left. The dots keep clear of
   both. The mark is knocked out of the raster (plate/markKnockout.ts); the
   text is real page text laid over the canvas, and every line of it, and each
   button, is marked data-dodge so the raster leaves it clean ground too
   (InterferenceField's dodgeText). A visitor who never scrolls still leaves
   knowing what nokta makes and where to go next.

   On a phone the plate turns portrait: the mark hangs at the top, the text
   stands at the foot. */

export default function HomeHero({
  eyebrow,
  title,
  sub,
  ctaWork,
  ctaContact,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  ctaWork: string;
  ctaContact: string;
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.box} data-dodge-scope>
        <InterferenceField
          mark="/nokta_logo.png"
          markAside
          dodgeText
          className={styles.field}
        />

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
              <span aria-hidden="true"> ↗</span>
            </Link>
            <Link href="/arbeiten" className={styles.secondary} data-dodge="box">
              {ctaWork}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
