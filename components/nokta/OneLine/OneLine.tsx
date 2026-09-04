"use client";

import { useEffect, useRef } from "react";
import styles from "./OneLine.module.css";
import { mountOneLine } from "./mount";

type Props = {
  /** Fixed seed → same sequence of buildings on every visit. Default: random per mount. */
  seed?: number;
  className?: string;
};

/**
 * Ein Punkt zeichnet ein Gebäude in einer einzigen Linie — und nimmt sie wieder mit.
 * Drop-in for a plate container (e.g. the home `fieldPlate`); fills its parent.
 */
export default function OneLine({ seed, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    return mountOneLine(canvas, seed);
  }, [seed]);

  return <canvas ref={ref} className={`${styles.field}${className ? ` ${className}` : ""}`} aria-hidden="true" />;
}
