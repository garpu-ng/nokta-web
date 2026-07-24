import type { Work } from "@/lib/works";
import styles from "./WorkAnno.module.css";

/* The one annotation every work carries — on its wall card and on its detail
   page, word for word the same: mode of representation · year · who it was for.
   Facts only; self-initiated work is annotated "Eigenprojekt" and stands beside
   the commissions without a word of explanation. */

export type WorkAnnotation = {
  /** translated kind stamp, e.g. "Rendering" */
  kind: string;
  year: string;
  /** client name, or the "own work" annotation */
  client: string;
};

/** Build a work's annotation. Server pages call `getT()` and hand the finished
    strings down — the wall is a client component and never translates itself. */
export function workAnnotation(work: Work, t: (key: string) => string): WorkAnnotation {
  // "Privatkunde" is the one client value that is a generic noun and has an
  // i18n key; every other client is a proper name and stays as written.
  let client: string;
  if (!work.client) client = t("work.own");
  else if (work.client === "Privatkunde") client = t("projects.client.private");
  else client = work.client;

  return { kind: t(`work.kind.${work.kind}`), year: work.year, client };
}

export default function WorkAnno({ anno }: { anno: WorkAnnotation }) {
  return (
    <span className={`nk-mono-caption ${styles.anno}`}>
      {anno.kind} · {anno.year} · {anno.client}
    </span>
  );
}
