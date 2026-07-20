import styles from "./Registration.module.css";

/* Registration mark — the circle-and-cross a press uses to align the colour
   separations onto one another. Lifted verbatim from NoktaHero and promoted to
   the shared kit. This renders only the mark; the host positions and sizes it
   (via `className`). Stroke is currentColor, so it reads on paper or ink; tune
   its strength with the --reg-opacity custom property (default 0.5). Purely
   decorative (aria-hidden). */
export default function Registration({ className }: { className?: string }) {
  return (
    <svg
      className={`${styles.registration}${className ? ` ${className}` : ""}`}
      viewBox="0 0 52 52"
      aria-hidden="true"
    >
      <circle cx="26" cy="26" r="12" />
      <path d="M26 4v44M4 26h44" />
    </svg>
  );
}
