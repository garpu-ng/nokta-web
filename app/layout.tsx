import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import TabBar from "@/components/TabBar";
import BranchReveal from "@/components/BranchReveal";

export const metadata: Metadata = {
  title: "nokta — Studio für Design, Architekturvisualisierung & Liniendrucke",
  description:
    "nokta ist ein Studio mit drei Disziplinen: nokta (Layout, Design, Druck), nokta.arch (Architekturvisualisierung) und nokta.line (2D-, Vektor- und CAD-Kunstdrucke).",
  metadataBase: new URL("https://nokta.kaanmaan.cv"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        {/* mir.no layout CSS — used by the ported archviz (nokta.arch) pages */}
        <link rel="stylesheet" href="/mir.css" />
      </head>
      <body>
        {/* colour-flood overlay (sits below the header, above content) */}
        <BranchReveal />

        {/* persistent white header: big wordmark + the segmented tab bar.
            The inner wrapper is centred and capped at the tab group's width, so
            the logo's left edge always aligns with the (centred) home tab. */}
        <header className="nk-topbar">
          <div className="nk-topbar-inner">
            <div className="nk-topbar-row">
              <Link href="/" className="nk-brand" aria-label="nokta — Startseite">
                nokta<span className="nk-brand-dot">.</span>
              </Link>
              <nav className="nk-utility" aria-label="Weitere Seiten">
                <Link href="/studio" className="nk-util">team.</Link>
                <Link href="/impressum" className="nk-util">impressum.</Link>
                <Link href="/kontakt" className="nk-util">contact.</Link>
                <Link href="/datenschutz" className="nk-util">datenschutz.</Link>
              </nav>
            </div>
            <TabBar />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
