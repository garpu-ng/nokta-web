import type { SVGProps } from "react";

/**
 * Dot — the nokta brand mark. "nokta" is Turkish for "dot", and this organic,
 * hand-drawn blob is the studio's core visual device. The silhouette was traced
 * (potrace) from the original raster nokta_dot_black.webp, so the viewBox is
 * cropped tight to the blob — no transparent padding, unlike the old webps that
 * forced sizing corrections in every consumer. Size the box and it fills it edge
 * to edge.
 *
 * Server-compatible (pure markup, no client hooks). Fills `currentColor` by
 * default, so it inherits the surrounding text colour; pass `color` to tint it
 * explicitly (e.g. a branch motto colour). `size` sets both width and height;
 * omit it to size the box from CSS instead. Any other SVG props (className,
 * style, aria-*) pass straight through.
 */
export default function Dot({
  color,
  size,
  ...props
}: { color?: string; size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 167 157"
      width={size}
      height={size}
      fill={color ?? "currentColor"}
      aria-hidden="true"
      {...props}
    >
      <path d="M77 3C51.9 4.8 35.8 11.2 22.1 24.8 2.5 44.2-1.3 66 8.7 100.5 16.3 126.7 24.5 136.3 47 145.1 74.7 156 94.4 156.8 112.4 147.9 153.5 127.7 176.5 73.8 156.7 44.1 152.7 38.1 137.9 23.1 130.5 17.5 113.5 4.8 100.7 1.3 77 3Z" />
    </svg>
  );
}
