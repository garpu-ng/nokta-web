import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Footer from "@/components/Footer";
import LanguageToggle from "@/components/LanguageToggle";
import NavLinks from "@/components/NavLinks";
import Wordmark from "@/components/Wordmark";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";
import styles from "./layout.module.css";

/* Fonts are self-hosted at build time via next/font (GDPR: the browser never
   talks to Google Fonts). Exposed as CSS variables consumed by tokens.css.

   TWO faces, and that is the whole of it: DM Sans sets everything the reader
   reads, Syne everything the sheet announces. Space Mono was the third — the
   technical-annotation voice on every folio, spec line, count and caption —
   and it is gone. A studio that draws buildings, books and prints does not
   annotate them in a typewriter; the annotations keep their size, their
   tracking and their case, and simply speak in the site's own voice. That is
   also 2 static weights of a non-variable face no longer fetched. */
const dmSans = DM_Sans({
  // DM Sans is a variable font — no weight list needed; the variable woff2
  // covers the full weight range.
  //
  // NORMAL ONLY. Italic is a separate 38.9KB file, it was being fetched on
  // every cold load, and nothing on this site is ever set in it: no <em>, no
  // <i>, no rule that computes font-style: italic anywhere in the repo. That
  // was 30% of the site's whole font transfer spent on a face the browser
  // never matched. Add "italic" back the day italic copy exists.
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
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
      className={`${dmSans.variable} ${syne.variable}`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. asbplayer) inject
          attributes on <body> before React hydrates; this scopes the warning
          to <body> only and doesn't hide real mismatches elsewhere. */}
      <body suppressHydrationWarning>
        {/* The sheet. Masthead, page and colophon are laid on one centred
            column capped at --content-max; past that the ink runs on to the
            edges of the screen, so a wide monitor shows a sheet on a ground
            instead of a layout stretched to fill it. */}
        {/* First in the tab order on every page: without it a keyboard reader
            walked the wordmark, four nav links and four language buttons again
            on every single navigation before reaching the page itself. */}
        <a href="#nk-main" className="nk-skip">
          {t("aria.skip")}
        </a>
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
                  // The work comes before the studio: a reader who has just met
                  // the wordmark wants to see what was made, not who made it.
                  // The order is set once here, so every locale reads it the
                  // same way round — and it is the order the colophon already
                  // lists them in (components/Footer.tsx).
                  items={[
                    { href: "/", label: t("nav.home") },
                    { href: "/arbeiten", label: t("nav.arbeiten") },
                    { href: "/studio", label: t("nav.studio") },
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

        {/* Nothing floats over the sheet any more. A plotted pointer — an
            accent dot on a trailing pen, swelling on links and shrinking to a
            registration mark on the work cards — used to live here, and a live
            Schriftfeld ticking 1:500 down to 1:1 before it. Both followed the
            reader down every page and sat over whatever happened to be in that
            corner. The pointer is the browser's own now. The per-page title
            blocks, which are part of a layout rather than floating above one,
            stay. */}
      </body>
    </html>
  );
}
