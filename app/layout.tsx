import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import TabBar from "@/components/TabBar";
import BranchReveal from "@/components/BranchReveal";
import Footer from "@/components/Footer";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "nokta · Studio für Design, Architekturvisualisierung und Liniendrucke",
  description:
    "nokta ist ein interdisziplinäres Designstudio aus NRW: Design und Druck, Architekturvisualisierung und CAD-Liniendrucke. Eigene Tools, viele Ideen, kurze Wege.",
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
      {/* suppressHydrationWarning: browser extensions (e.g. asbplayer) inject
          attributes on <body> before React hydrates; this scopes the warning
          to <body> only and doesn't hide real mismatches elsewhere. */}
      <body suppressHydrationWarning>
        {/* colour-flood overlay (sits below the header, above content) */}
        <BranchReveal />

        {/* Brand row — wordmark + utility links. Scrolls away with the page. */}
        <header className={styles.brandbar}>
          <div className={styles.topbarInner}>
            <div className={styles.topbarRow}>
              <Link href="/" className={styles.brand} aria-label="nokta, Startseite">
                nokta
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/nokta_dot_black.webp"
                  alt=""
                  aria-hidden="true"
                  className={styles.brandDot}
                />
              </Link>
              <nav className={styles.utility} aria-label="Weitere Seiten">
                <Link href="/studio" className={styles.util}>team.</Link>
                <Link href="/impressum" className={styles.util}>impressum.</Link>
                <Link href="/kontakt" className={styles.util}>contact.</Link>
                <Link href="/datenschutz" className={styles.util}>datenschutz.</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Tab bar — sticks to the top of the viewport once reached. */}
        <div className={styles.tabsticky}>
          <div className={styles.topbarInner}>
            <TabBar />
          </div>
        </div>

        {children}

        <Footer />
      </body>
    </html>
  );
}
