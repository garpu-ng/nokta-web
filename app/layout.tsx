import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import TabBar from "@/components/TabBar";
import BranchReveal from "@/components/BranchReveal";
import Footer from "@/components/Footer";

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
    // data-scroll-behavior="smooth" → Next disables smooth scrolling *during
    // route transitions* (so navigation lands cleanly at the top) while keeping
    // CSS smooth-scroll for in-page scrolling.
    <html lang="de" data-scroll-behavior="smooth">
      <head>
        {/* mir.no layout CSS — used by the ported archviz (nokta.arch) pages */}
        <link rel="stylesheet" href="/mir.css" />
      </head>
      <body>
        {/* colour-flood overlay (sits below the header, above content) */}
        <BranchReveal />

        {/* Brand row — wordmark + utility links. Scrolls away with the page. */}
        <header className="nk-brandbar">
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
          </div>
        </header>

        {/* Tab bar — sticks to the top of the viewport once reached. */}
        <div className="nk-tabsticky">
          <div className="nk-topbar-inner">
            <TabBar />
          </div>
        </div>

        {children}

        <Footer />
      </body>
    </html>
  );
}
