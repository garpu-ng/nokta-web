import Link from "next/link";
import Image from "next/image";
import { getT } from "@/lib/i18n";
import Registration from "@/components/print/Registration";
import styles from "./Footer.module.css";

// Global footer — the colophon of the sheet, and the masthead's counterpart:
// the same ink, the same full-bleed gutter, the same wordmark asset, so the
// header's left edge and this one are the single left edge of the page.
// Three short link columns (the pages, the legal ones, the profiles) beside
// the contact block. Social links are placeholders (href="#") until the real
// profiles exist.
export default async function Footer() {
  const t = await getT();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.mark}>
            <Link href="/" className={styles.markLink} aria-label={t("aria.home")}>
              {/* The same wordmark the masthead carries, flipped to paper by
                  the same filter. Below the fold on every page, so unlike the
                  header's copy it is left to load lazily. */}
              <Image
                src="/nokta_logo.png"
                alt="nokta"
                width={2000}
                height={410}
                className={styles.markLogo}
              />
            </Link>
            {/* The wordmark's closing period — the footer's one coloured mark,
                and the quiet door to the easter egg at /punkt. The asset
                carries no period of its own, so the dot is set beside it the
                way the Schriftfeld sets its own. */}
            <Link href="/punkt" className={styles.punkt} aria-label={t("aria.punkt")}>
              .
            </Link>
          </span>
          <p className={styles.tag}>
            {t("footer.tag1")}
            <br />
            {t("footer.tag2")}
          </p>
          <a href="mailto:hallo@nokta-studio.de" className={styles.email}>
            hallo@nokta-studio.de
          </a>
        </div>

        {/* The nav keeps its landmark but gives up its box (display:contents),
            so its three columns are items of the footer grid above. */}
        <nav className={styles.cols} aria-label="Footer">
          {/* The pages. "Arbeiten" is the full thirteen-work wall, which since
              Kolonnade lives at its own route — the homepage shows four. */}
          <div className={styles.col}>
            <span className={styles.colH}>{t("footer.col.seiten")}</span>
            <Link href="/arbeiten" className={styles.link}>{t("footer.link.arbeiten")}</Link>
            <Link href="/studio" className={styles.link}>{t("footer.link.studio")}</Link>
            <Link href="/prozess" className={styles.link}>{t("footer.link.prozess")}</Link>
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
        {/* A quiet registration mark sitting on the colophon's trim line, the
            one print-forensics detail on the footer. currentColor resolves to
            the footer's paper; --reg-opacity keeps it at a whisper. */}
        <Registration className={styles.regMark} />
        <span>© 2026 nokta · Nordrhein-Westfalen, DE</span>
        <span>{t("footer.disciplines")}</span>
      </div>
    </footer>
  );
}
