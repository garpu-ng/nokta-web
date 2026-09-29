import InterferenceField from "@/components/nokta/InterferenceField";
import styles from "./HeroPlate.module.css";

/* The studio's name, drawn: a field of dots with the wordmark knocked out of
   it. It opened the homepage until the first screen was given to a rendering
   and the studio's sentence (components/HomeHero.tsx); it now closes the page,
   directly above the footer, as the sign-off. Pure decoration, so it is hidden
   from assistive tech and carries no heading. */

export default function HeroPlate() {
  return (
    <section className={styles.hero} aria-hidden="true">
      <InterferenceField mark="/nokta_logo.png" />
    </section>
  );
}
