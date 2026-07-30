// Intrinsic pixel dimensions for the raster content images under /public.
// next/image needs an explicit width/height for every non-`fill` image so it can
// reserve the correct aspect ratio and avoid layout shift. These paths are read
// from data (project.images, print.image, step images) rather than statically
// imported, so their dimensions can't be inferred at build time — hence this
// generated lookup. Values were measured from the actual files with Pillow.

export type MediaSize = { width: number; height: number };

const SIZES: Record<string, MediaSize> = {
  "/projects/beatbuilding/01.jpg": { width: 1920, height: 1920 },
  "/projects/beatbuilding/02.jpg": { width: 1728, height: 1728 },
  "/projects/beatbuilding/03.jpg": { width: 2260, height: 2260 },
  "/projects/beatbuilding/04.jpg": { width: 1500, height: 1000 },
  "/projects/beatbuilding/thumb.jpg": { width: 1920, height: 1920 },
  "/projects/binome/01.jpg": { width: 1304, height: 1761 },
  "/projects/binome/02.jpg": { width: 1304, height: 1761 },
  "/projects/binome/03.jpg": { width: 1304, height: 1761 },
  "/projects/binome/04.jpg": { width: 1246, height: 1920 },
  "/projects/binome/05.jpg": { width: 1246, height: 1920 },
  "/projects/binome/06.jpg": { width: 1920, height: 1080 },
  "/projects/binome/thumb.jpg": { width: 1150, height: 1281 },
  "/projects/ipehouse/01.jpg": { width: 2112, height: 2640 },
  "/projects/ipehouse/02.jpg": { width: 2112, height: 2640 },
  "/projects/ipehouse/03.jpg": { width: 2996, height: 2000 },
  "/projects/ipehouse/04.jpg": { width: 2996, height: 2000 },
  "/projects/ipehouse/thumb.jpg": { width: 2112, height: 2640 },
  "/projects/sanktgores/01.jpg": { width: 1125, height: 1500 },
  "/projects/sanktgores/02.jpg": { width: 1125, height: 1500 },
  "/projects/sanktgores/03.jpg": { width: 1125, height: 1500 },
  "/projects/sanktgores/04.jpg": { width: 1125, height: 1500 },
  "/projects/sanktgores/05.jpg": { width: 1125, height: 1500 },
  "/projects/sanktgores/06.jpg": { width: 1125, height: 1500 },
  "/projects/sanktgores/thumb.jpg": { width: 1125, height: 1500 },
  "/projects/teahouse/01.jpg": { width: 3017, height: 1420 },
  "/projects/teahouse/02.jpg": { width: 1920, height: 1080 },
  "/projects/teahouse/03.jpg": { width: 1920, height: 1080 },
  "/projects/teahouse/04.jpg": { width: 1920, height: 1080 },
  "/projects/teahouse/05.jpg": { width: 1920, height: 1080 },
  "/projects/teahouse/06.jpg": { width: 1920, height: 1080 },
  "/projects/teahouse/07.jpg": { width: 1920, height: 1080 },
  // The home page's plate for this work: 01.jpg resized and recompressed. Its
  // thumbnail is a square the client cropped, which is the wall's shape but not
  // a proportion the work was ever photographed in (see FEATURED in app/page.tsx).
  // Wide enough for the lead plate at two device pixels to the CSS pixel: the
  // lead takes the sheet's whole 1420px measure, so it asks for 2840 of them.
  "/projects/teahouse/plate.jpg": { width: 2840, height: 1337 },
  "/projects/teahouse/thumb.jpg": { width: 1415, height: 1415 },
  "/projects/velostation/01.jpg": { width: 3754, height: 2112 },
  "/projects/velostation/02.jpg": { width: 3562, height: 2004 },
  "/projects/velostation/thumb.jpg": { width: 1422, height: 800 },
  "/point/abschlussbericht/cover.webp": { width: 1477, height: 2085 },
  "/point/abschlussbericht/contents.webp": { width: 1477, height: 2085 },
  "/point/abschlussbericht/prinzipien.webp": { width: 1477, height: 2085 },
  "/point/abschlussbericht/empfehlung.webp": { width: 1477, height: 2085 },
  "/point/abschlussbericht/opinion.webp": { width: 1477, height: 2085 },
  "/point/abschlussbericht/termine.webp": { width: 1477, height: 2085 },
  "/point/n-study.png": { width: 536, height: 918 },
  "/point/leuchtturm-cover.webp": { width: 1194, height: 1701 },
  "/line/chrysler.webp": { width: 1600, height: 2400 },
  "/line/eiffel.webp": { width: 1600, height: 2355 },
  "/line/empire-state.webp": { width: 1600, height: 2433 },
  "/line/osaka.webp": { width: 1600, height: 2400 },
};

// Fallback keeps a wrong path from crashing the build; aspect ratio defaults to
// a portrait 3:4 (the dominant shape here) so any missing entry degrades gracefully.
const FALLBACK: MediaSize = { width: 1200, height: 1600 };

export function getMediaSize(src: string): MediaSize {
  return SIZES[src] ?? FALLBACK;
}
