import type { Metadata } from "next";
import WorkGrid from "@/components/WorkGrid";
import { BRANCH_BY_KEY } from "@/lib/branches";

const branch = BRANCH_BY_KEY.arch;

export const metadata: Metadata = {
  title: "nokta.arch — Architekturvisualisierung NRW",
  description: branch.desc,
  alternates: { canonical: "/arch" },
};

export default function ArchPage() {
  return (
    <>
      <div className="nk-branch" style={{ paddingBottom: "1.5rem" }}>
        <header className="nk-branch-head" style={{ marginBottom: 0 }}>
          <h1 className="nk-branch-title">
            nokta.arch<span className="nk-dot">.</span>
          </h1>
          <p className="nk-branch-tag">{branch.tagline}</p>
          <p className="nk-branch-lead">{branch.desc}</p>
        </header>
      </div>

      <div className="wa-grid-column">
        <WorkGrid />
      </div>
    </>
  );
}
