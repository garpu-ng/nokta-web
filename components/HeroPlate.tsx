import InterferenceField from "@/components/nokta/InterferenceField";
import styles from "./HeroPlate.module.css";

/* The studio's name, drawn, opening the homepage.

   The band used to carry the teaser film. It carries the plate now, which is
   the same argument the rest of the sheet makes and one the film could not:
   nokta is the dot, the plate is a field of dots, and the name is the one
   shape that field leaves empty — knocked out of the raster rather than laid
   over it, so the mark is read on clean ground while everything around it is
   still moving. The masthead's wordmark and this one are the same file.

   The band carries the page's h1 off-screen, which is why the copy still
   arrives as props: the plate is a client component and never reaches for a
   dictionary itself. */

export default function HeroPlate({
  lead1,
  lead2,
}: {
  lead1: string;
  lead2: string;
}) {
  return (
    <section className={styles.hero}>
      <InterferenceField mark="/nokta_logo.png" />
      {/* Nothing is set over the plate itself. The h1 stays, off-screen rather
          than display:none, so the document still opens on a heading for the
          outline and for a screen reader: the two sentences, each closing on
          its point, as they used to be set. */}
      <h1 className="nk-sr-only">{`${lead1}. ${lead2}.`}</h1>
    </section>
  );
}
