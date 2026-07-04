import type { Metadata } from "next";
import Carousel from "@/components/Carousel";
import WorkGrid from "@/components/WorkGrid";

export const metadata: Metadata = {
  title: "WaArchi Studio — Architekturvisualisierung NRW",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* Scrolling carousel — mirrors mir.no top strip */}
      <Carousel />

      {/* Divider + grid share the same column so lines align with image edges */}
      <div className="wa-grid-column">
        <div className="wa-divider">
          <span className="wa-divider-label">WaArchi Studio</span>
        </div>
        <WorkGrid />
      </div>
    </>
  );
}
