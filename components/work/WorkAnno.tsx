import type { Work } from "@/lib/works";
import styles from "./WorkAnno.module.css";

/* The one annotation every work carries — on its wall card and on its detail
   page, word for word the same: mode of representation · year · who it was for.
   Facts only; self-initiated work is annotated "Eigenprojekt" and stands beside
   the commissions without a word of explanation. Where a client is not named
   (the renderings, since 27.10.2026), the line simply ends after the year. */

export type WorkAnnotation = {
  /** translated kind stamp, e.g. "Rendering" */
  kind: string;
  year: string;
  /** client name, or the "own work" annotation; absent where no client is named */
  client?: string;
};

/** Build a work's annotation. Server pages call `getT()` and hand the finished
    strings down — the wall is a client component and never translates itself. */
export function workAnnotation(work: Work, t: (key: string) => string): WorkAnnotation {
  const client = work.own ? t("work.own") : work.client;
  return { kind: t(`work.kind.${work.kind}`), year: work.year, ...(client ? { client } : {}) };
}

/** The annotation as one line of text: the facts that are there, joined by
    the same middle dot everywhere. */
export function annotationLine(anno: WorkAnnotation): string {
  return [anno.kind, anno.year, anno.client].filter(Boolean).join(" · ");
}

export default function WorkAnno({ anno }: { anno: WorkAnnotation }) {
  // No colour and no per-word markup: the kind stamp used to borrow the old
  // filter bar's kind colour on hover, but since Kolonnade the filter spends
  // no colour and the whole line is simply set in the surrounding ink.
  return <span className={`nk-caption ${styles.anno}`}>{annotationLine(anno)}</span>;
}
