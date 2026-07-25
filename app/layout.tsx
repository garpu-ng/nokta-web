import type { Metadata } from "next";
import { DM_Sans, Space_Mono, Righteous } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import Footer from "@/components/Footer";
import LanguageToggle from "@/components/LanguageToggle";
import DotCursor from "@/components/plotter/DotCursor";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";
import styles from "./layout.module.css";

/* Fonts are self-hosted at build time via next/font (GDPR: the browser never
   talks to Google Fonts). Exposed as CSS variables consumed by tokens.css. */
const dmSans = DM_Sans({
  // DM Sans is a variable font — no weight list needed; the variable woff2
  // covers the full weight range. Italic is a separate file, so list both styles.
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-dm-sans",
});

const spaceMono = Space_Mono({
  // Space Mono is NOT variable — its static weights must be listed.
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

// Headline face used throughout the site, including the browser tabs.
// Righteous is a static single-weight face, so explicitly request its only
// available weight while keeping the same self-hosted, swap-loading setup.
const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-righteous",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.site.title");
  const description = t("meta.site.desc");
  return {
    title,
    description,
    metadataBase: new URL("https://www.nokta-studio.de"),
    // Studio-wide default social card. No `path` → no og:url here, so the
    // pages that inherit this block (studio, kontakt, legal…) don't pick up a
    // wrong canonical; home and the work pages set their own url. The card
    // image comes from app/opengraph-image.tsx + app/twitter-image.tsx.
    ...socialMetadata({ title, description, locale }),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getT();
  return (
    // data-scroll-behavior="smooth" → Next disables smooth scrolling *during
    // route transitions* (so navigation lands cleanly at the top) while keeping
    // CSS smooth-scroll for in-page scrolling.
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${spaceMono.variable} ${righteous.variable}`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. asbplayer) inject
          attributes on <body> before React hydrates; this scopes the warning
          to <body> only and doesn't hide real mismatches elsewhere. */}
      <body suppressHydrationWarning>
        {/* The header is the title block of a sheet, not an app bar: the
            wordmark left, three pages and the language right, one hairline
            underneath. It scrolls away with the page — nothing sticks.
            Impressum and Datenschutz are not pages you navigate to, they are
            pages you look up: they stay in the footer. */}
        <header className={styles.header}>
          <div className={styles.inner}>
            <div className={styles.row}>
              {/* The logo links home, and home is the work. */}
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
              <nav className={styles.nav} aria-label={t("aria.mainNav")}>
                <Link href="/studio" className={styles.navLink}>{t("nav.studio")}</Link>
                <Link href="/prozess" className={styles.navLink}>{t("nav.prozess")}</Link>
                <Link href="/kontakt" className={styles.navLink}>{t("nav.contact")}</Link>
                <LanguageToggle current={locale} label={t("aria.language")} />
              </nav>
            </div>
          </div>
        </header>

        {children}

        <Footer />

        {/* Chrome that belongs to the sheet rather than to any one page. Both
            are decorative overlays: aria-hidden, pointer-events none, and both
            render nothing at all until JS has read the environment. */}
        <DotCursor />
      </body>
    </html>
  );
}
