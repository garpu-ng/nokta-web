import type { Metadata } from "next";
import { Jost, Space_Mono, Fraunces } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import TabBar from "@/components/TabBar";
import BranchReveal from "@/components/BranchReveal";
import Footer from "@/components/Footer";
import LanguageToggle from "@/components/LanguageToggle";
import { getLocale, getT } from "@/lib/i18n";
import styles from "./layout.module.css";

/* Fonts are self-hosted at build time via next/font (GDPR: the browser never
   talks to Google Fonts). Exposed as CSS variables consumed by tokens.css. */
const jost = Jost({
  // Jost is a variable font — no weight list needed; the variable woff2
  // covers the full weight range. Italic is a separate file, so list both styles.
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-jost",
});

const spaceMono = Space_Mono({
  // Space Mono is NOT variable — its static weights must be listed.
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

// Display face for the /arch poster redesign — variable font with the
// soft/wonk axes that give it the chunky retro-serif voice of the moodbook.
// Self-hosted like the others (GDPR: no runtime Google Fonts requests).
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.site.title"),
    description: t("meta.site.desc"),
    metadataBase: new URL("https://www.nokta-studio.de"),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getT();
  const taglines = {
    home: t("branch.home.tag"),
    nokta: t("branch.nokta.tag"),
    arch: t("branch.arch.tag"),
    line: t("branch.line.tag"),
  };
  return (
    // data-scroll-behavior="smooth" → Next disables smooth scrolling *during
    // route transitions* (so navigation lands cleanly at the top) while keeping
    // CSS smooth-scroll for in-page scrolling.
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${jost.variable} ${spaceMono.variable} ${fraunces.variable}`}
    >
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
              {/* Logo links home. (Testing a new wordmark logo — the standalone
                  dot easter egg is parked for now.) */}
              <div className={styles.brand}>
                <Link href="/" className={styles.brandWord} aria-label={t("aria.home")}>
                  {/* Brand wordmark — above the fold on every page, so preload it.
                      Intrinsic size is the source PNG; .brandLogo CSS (height clamp,
                      width auto) governs the rendered size. */}
                  <Image
                    src="/nokta_logo.png"
                    alt="nokta"
                    width={2000}
                    height={410}
                    preload
                    className={styles.brandLogo}
                  />
                </Link>
              </div>
              <nav className={styles.utility} aria-label={t("aria.morePages")}>
                <Link href="/studio" className={styles.util}>{t("nav.team")}</Link>
                <Link href="/impressum" className={styles.util}>{t("nav.impressum")}</Link>
                <Link href="/kontakt" className={styles.util}>{t("nav.contact")}</Link>
                <Link href="/datenschutz" className={styles.util}>{t("nav.datenschutz")}</Link>
                <LanguageToggle current={locale} label={t("aria.language")} />
              </nav>
            </div>
          </div>
        </header>

        {/* Tab bar — sticks to the top of the viewport once reached. */}
        <div className={styles.tabsticky}>
          <div className={styles.topbarInner}>
            <TabBar taglines={taglines} navLabel={t("aria.mainNav")} />
          </div>
        </div>

        {children}

        <Footer />
      </body>
    </html>
  );
}
