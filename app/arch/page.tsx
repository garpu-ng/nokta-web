import type { Metadata } from "next";
import Carousel from "@/components/Carousel";
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
      {/* Scrolling carousel — mirrors mir.no top strip */}
      <Carousel />

      <div className="wa-grid-column">
        <div className="wa-divider">
          <span className="wa-divider-label">nokta.arch — {branch.tagline}</span>
        </div>
        <WorkGrid />
      </div>
    </>
  );
}
