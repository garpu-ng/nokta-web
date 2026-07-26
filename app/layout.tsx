import type { Metadata } from "next";
import { DM_Sans, Space_Mono, Syne } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Footer from "@/components/Footer";
import LanguageToggle from "@/components/LanguageToggle";
import NavLinks from "@/components/NavLinks";
import Wordmark from "@/components/Wordmark";
import Schriftfeld from "@/components/print/Schriftfeld";
import DotCursor from "@/components/plotter/DotCursor";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";
import { WORK_SLUGS } from "@/lib/works";
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
// Syne is a variable font (wght 400–800), so — like DM Sans above and unlike
// the single-weight Righteous it replaced — no weight list is needed: the one
// variable woff2 covers the 600 / 700 / 800 the display scale asks for.
const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
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
      className={`${dmSans.variable} ${spaceMono.variable} ${syne.variable}`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. asbplayer) inject
          attributes on <body> before React hydrates; this scopes the warning
          to <body> only and doesn't hide real mismatches elsewhere. */}
      <body suppressHydrationWarning>
        {/* The sheet. Masthead, page and colophon are laid on one centred
            column capped at --content-max; past that the ink runs on to the
            edges of the screen, so a wide monitor shows a sheet on a ground
            instead of a layout stretched to fill it. */}
        <div className={styles.shell}>
          {/* The header is the title block of a sheet, not an app bar: the
              wordmark left, the four pages and the language right. It scrolls
              away with the page — nothing sticks. No hairline underneath: the
              page's own first edge (the hero, or the h1 block's rule) is the
              trim line. Impressum and Datenschutz are not pages you navigate
              to, they are pages you look up: they stay in the footer. */}
          <header className={styles.header}>
            <div className={styles.row}>
              {/* The logo links home, and home is the work. */}
              <Link href="/" className={styles.brandWord} aria-label={t("aria.home")}>
                {/* Drawn as a mask so it is exactly the paper the type is set
                    in — see components/Wordmark.tsx. */}
                <Wordmark className={styles.brandLogo} />
              </Link>
              <div className={styles.right}>
                <NavLinks
                  navLabel={t("aria.mainNav")}
                  items={[
                    { href: "/", label: t("nav.home") },
                    { href: "/studio", label: t("nav.studio") },
                    { href: "/prozess", label: t("nav.prozess") },
                    { href: "/kontakt", label: t("nav.contact") },
                  ]}
                />
                <LanguageToggle current={locale} label={t("aria.language")} />
              </div>
            </div>
          </header>

          {children}

          <Footer />
        </div>

        {/* Chrome that belongs to the sheet rather than to any one page. Both
            are decorative overlays: aria-hidden and pointer-events none. The
            sheet numbers are handed over as plain slugs so the client bundle
            never pulls in the work data itself. */}
        <Schriftfeld locale={locale} sheets={WORK_SLUGS} />
        <DotCursor />
      </body>
    </html>
  );
}
