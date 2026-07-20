import styles from "./CropMarks.module.css";

/* Printer's trim marks — the four corner brackets a press sheet carries so the
   cut can be registered. Lifted verbatim from the geometry NoktaHero drew
   locally (68×68 viewBox, the two arms meeting at the box centre so the elbow
   sits offset from the trim, as a real crop mark does) and promoted to a shared
   kit, so every sheet on the site wears the same registered trim.

   The four marks pin to the corners of the nearest positioned ancestor — the
   host element only needs `position: relative`. Stroke is currentColor, so the
   marks read on any surface (ink on paper, paper on ink); tune their strength
   with the --crop-opacity custom property (default 0.6) and placement/size via
   `className`. Purely decorative (aria-hidden). */
const CORNERS = {
  topLeft: "M12 34H34M34 12V34",
  topRight: "M34 34H56M34 12V34",
  bottomLeft: "M12 34H34M34 34V56",
  bottomRight: "M34 34H56M34 34V56",
} as const;

type Corner = keyof typeof CORNERS;

export default function CropMarks({ className }: { className?: string }) {
  return (
    <>
      {(Object.keys(CORNERS) as Corner[]).map((corner) => (
        <svg
          key={corner}
          className={`${styles.mark} ${styles[corner]}${className ? ` ${className}` : ""}`}
          viewBox="0 0 68 68"
          aria-hidden="true"
        >
          <path d={CORNERS[corner]} />
        </svg>
      ))}
    </>
  );
}
