import Link from "next/link";
import { getT } from "@/lib/i18n";
import Wordmark from "@/components/Wordmark";
import styles from "./Footer.module.css";

// Global footer — the colophon of the sheet, and the masthead's counterpart:
// the same ink, the same full-bleed gutter, the same wordmark asset, so the
// header's left edge and this one are the single left edge of the page.
// Three short link columns (the pages, the legal ones, the profiles) beside
// the contact block. Social links are placeholders (href="#") until the real
// profiles exist. The wordmark stands on its own here — the closing period
// used to be set beside it as type, which the headline font renders square,
// so it was dropped rather than faked.
export default async function Footer() {
  const t = await getT();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.mark}>
            <Link href="/" className={styles.markLink} aria-label={t("aria.home")}>
              {/* The same masked wordmark the masthead carries, a step
                  smaller — see components/Wordmark.tsx. */}
              <Wordmark className={styles.markLogo} />
            </Link>
          </span>
          <p className={styles.tag}>
            {t("footer.tag1")}
            <br />
            {t("studio.motto")}
          </p>
          <a href="mailto:hallo@nokta-studio.de" className={styles.email}>
            hallo@nokta-studio.de
          </a>
        </div>

        {/* The nav keeps its landmark but gives up its box (display:contents),
            so its three columns are items of the footer grid above. */}
        <nav className={styles.cols} aria-label="Footer">
          {/* The pages. "Arbeiten" is the full wall, which since Kolonnade
              lives at its own route — the homepage shows four. */}
          <div className={styles.col}>
            <span className={styles.colH}>{t("footer.col.seiten")}</span>
            <Link href="/arbeiten" className={styles.link}>{t("footer.link.arbeiten")}</Link>
            <Link href="/studio" className={styles.link}>{t("footer.link.studio")}</Link>
            <Link href="/kontakt" className={styles.link}>{t("footer.link.kontakt")}</Link>
          </div>

          <div className={styles.col}>
            <span className={styles.colH}>{t("footer.col.rechtliches")}</span>
            <Link href="/impressum" className={styles.link}>{t("footer.link.impressum")}</Link>
            <Link href="/datenschutz" className={styles.link}>{t("footer.link.datenschutz")}</Link>
          </div>

          <div className={styles.col}>
            <span className={styles.colH}>{t("footer.col.social")}</span>
            <a href="#" className={styles.link}>Instagram</a>
            <a href="#" className={styles.link}>LinkedIn</a>
            <a href="#" className={styles.link}>Behance</a>
            <a href="mailto:hallo@nokta-studio.de" className={styles.link}>E-Mail</a>
          </div>
        </nav>
      </div>

      <div className={styles.bottom}>
        <span>© 2026 nokta · Nordrhein-Westfalen, DE</span>
        <span>{t("footer.disciplines")}</span>
      </div>
    </footer>
  );
}
