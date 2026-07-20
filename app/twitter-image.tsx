// The Twitter card reuses the OpenGraph poster verbatim — same canvas, same
// render. Re-exporting keeps them in lockstep from one source of truth, and lets
// Next emit the twitter:image tags (which the opengraph-image file alone does
// not). Twitter's card type is set to summary_large_image in socialMetadata.
export { default, alt, size, contentType } from "./opengraph-image";
