/* A picture screened into the raster, rather than laid over it.

   The homepage plate shows one of the studio's renderings, and it shows it
   the only way a field of dots can: as a halftone. Nothing is drawn but the
   dots the plate already draws. Inside the picture a dot's size is set by the
   picture's tone at its centre instead of by the waves, which is what a
   halftone screen is. Same lattice, same ink, same angle, so the picture is
   plainly part of the field and not an image placed on it.

   What this file owns is the picture's side of that: loading the small
   greyscale source, fitting it into the room the plate offers, and answering
   three questions per dot (its tone, how much the picture owns it, how near
   it is). The plate asks them once per layout, never per frame.

   THE PREFILTER. The lattice samples the picture once per pitch, and a
   picture full of thin lines (balcony slabs, mullions) sampled that coarsely
   aliases: a one-pixel slab lands on a row of dot centres or between them,
   and on a 15-degree lattice that reads as the building leaning. So the source
   is first scaled down to about the lattice's own resolution, which turns a
   line thinner than a dot into the grey a printer would screen it as. */

/** Lattice samples per prefiltered pixel, inverted: the source is reduced to
    this many pixels per pitch. A little over one keeps edges crisp without
    bringing the aliasing back. */
const PREFILTER = 1.3;
/** How far in from the picture's edge it takes full ownership of a dot, in
    pitches. The field fades into the picture rather than stopping at a frame. */
const FEATHER = 3;
/** How far around the picture the field is quieted, in pitches. Without it the
    field's crests run straight up to the building and the eye cannot find
    where the picture ends. */
const HALO = 12;

type Pic = { img: HTMLImageElement | null; ready: Promise<unknown> };

/** Decoded once per source per document, as markKnockout.ts does with the
    wordmark: a re-mount gets the image it already has. */
const pics = new Map<string, Pic>();

function loadPicture(src: string): Pic {
  const held = pics.get(src);
  if (held) return held;
  const pic: Pic = { img: null, ready: Promise.resolve() };
  pic.ready = new Promise<void>((done) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      pic.img = img;
      done();
    };
    // A missing picture leaves the plate a plain field, which is still a
    // finished plate.
    img.onerror = () => done();
    img.src = src;
  });
  pics.set(src, pic);
  return pic;
}

/** A box in the canvas's CSS pixels. */
export type Room = { x0: number; y0: number; x1: number; y1: number };

export type PictureScreen = {
  ready: Promise<unknown>;
  /** The source's width over its height, once it has loaded; 0 before. */
  aspect: () => number;
  /** Fit the picture into `room` and prefilter it to `pitch`. A null room, or
      one too small to hold a legible picture, places nothing. */
  layout: (room: Room | null, pitch: number) => void;
  /** Whether a picture is placed at all. */
  placed: () => boolean;
  /** Tone 0..1 at a point inside the picture, -1 outside it. */
  tone: (x: number, y: number) => number;
  /** How much the picture owns a point, 0..1: 1 well inside, falling to 0 at
      its edge. */
  own: (x: number, y: number) => number;
  /** How near a point is to the picture, 0..1: 1 on it, 0 a halo away. */
  near: (x: number, y: number) => number;
};

const smooth = (a: number, b: number, x: number) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

export function makePictureScreen(src: string): PictureScreen {
  const pic = loadPicture(src);
  const off = document.createElement("canvas");
  let lum: Float32Array | null = null;
  let dw = 0;
  let dh = 0;
  /** The picture's box, CSS pixels. */
  let px = 0;
  let py = 0;
  let pw = 0;
  let ph = 0;
  let feather = 1;
  let halo = 1;

  const layout = (room: Room | null, pitch: number) => {
    lum = null;
    const img = pic.img;
    if (!img || !room) return;
    const rw = room.x1 - room.x0;
    const rh = room.y1 - room.y0;
    // Under this many dots across, a building is a smudge.
    const fit = Math.min(rw / img.width, rh / img.height);
    pw = img.width * fit;
    ph = img.height * fit;
    if (pw < pitch * 14 || ph < pitch * 14) return;
    px = room.x0 + (rw - pw) / 2;
    py = room.y0 + (rh - ph) / 2;
    feather = pitch * FEATHER;
    halo = pitch * HALO;

    dw = Math.max(2, Math.round((pw / pitch) * PREFILTER));
    dh = Math.max(2, Math.round((ph / pitch) * PREFILTER));
    off.width = dw;
    off.height = dh;
    const c = off.getContext("2d", { willReadFrequently: true });
    if (!c) return;
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = "high";
    c.clearRect(0, 0, dw, dh);
    c.drawImage(img, 0, 0, dw, dh);
    const data = c.getImageData(0, 0, dw, dh).data;
    const out = new Float32Array(dw * dh);
    // The source is greyscale, so any one channel is the tone.
    for (let i = 0; i < out.length; i++) out[i] = data[i * 4] / 255;
    lum = out;
  };

  const tone = (x: number, y: number) => {
    if (!lum || x < px || y < py || x > px + pw || y > py + ph) return -1;
    // Bilinear, between prefiltered pixel centres.
    const u = Math.min(dw - 1, Math.max(0, ((x - px) / pw) * dw - 0.5));
    const v = Math.min(dh - 1, Math.max(0, ((y - py) / ph) * dh - 0.5));
    const x0 = u | 0;
    const y0 = v | 0;
    const x1 = Math.min(dw - 1, x0 + 1);
    const y1 = Math.min(dh - 1, y0 + 1);
    const fx = u - x0;
    const fy = v - y0;
    const top = lum[y0 * dw + x0] * (1 - fx) + lum[y0 * dw + x1] * fx;
    const bot = lum[y1 * dw + x0] * (1 - fx) + lum[y1 * dw + x1] * fx;
    return top * (1 - fy) + bot * fy;
  };

  const own = (x: number, y: number) => {
    if (!lum) return 0;
    const edge = Math.min(x - px, px + pw - x, y - py, py + ph - y);
    return smooth(0, feather, edge);
  };

  const near = (x: number, y: number) => {
    if (!lum) return 0;
    const dx = Math.max(px - x, 0, x - px - pw);
    const dy = Math.max(py - y, 0, y - py - ph);
    return 1 - smooth(0, halo, Math.sqrt(dx * dx + dy * dy));
  };

  return {
    ready: pic.ready,
    aspect: () => (pic.img ? pic.img.width / pic.img.height : 0),
    layout,
    placed: () => lum !== null,
    tone,
    own,
    near,
  };
}
