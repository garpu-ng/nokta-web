import styles from "./Wordmark.module.css";

/* The nokta wordmark, set in the same paper the type is set in.

   The asset is black on transparent, so it used to be flipped with
   `filter: invert(1)` — which lands on pure white, a colder thing than every
   word around it. A filter chain can only ever approximate a target colour,
   so the mark is drawn as a MASK instead: the PNG supplies the silhouette and
   `background-color` supplies the colour, which means it is exactly
   var(--paper) and stays exact if that token ever moves.

   Decorative by itself — every consumer wraps it in a link that carries the
   accessible name. */
export default function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={className ? `${styles.mark} ${className}` : styles.mark}
      aria-hidden="true"
    />
  );
}
