import Link from "next/link";
import Image from "next/image";
import { getT } from "@/lib/i18n";
import Registration from "@/components/print/Registration";
import styles from "./Footer.module.css";

// Global footer — the colophon slab: ink, full width, under every page. Two
// short link columns (the pages, then the legal ones) plus the contact block.
// Social links are placeholders (href="#") until the real profiles exist.
export default async function Footer() {
  const t = await getT();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.mark}>
              nokta<span>.</span>
            </Link>
            <p className={styles.tag}>
              {t("footer.tag1")}
              <br />
              {t("footer.tag2")}
            </p>
            <a href="mailto:hallo@nokta-studio.de" className={styles.email}>
              hallo@nokta-studio.de
            </a>
          </div>

          {/* Decorative dot-row animation, sits between the brand block and
              the link columns. Transparent-background *animated* WebP — next/image
              can't optimize animated frames, so `unoptimized` passes it through
              as-is (the file itself was already resized down to 600×200). */}
          <Image
            src="/nokta_dots_row.webp"
            alt=""
            aria-hidden="true"
            width={600}
            height={200}
            unoptimized
            className={styles.dotsRow}
          />

          <nav className={styles.cols} aria-label="Footer">
            {/* The pages. "Arbeiten" is the home page — the work is the site,
                so it needs no separate route to point at. */}
            <div className={styles.col}>
              <span className={styles.colH}>{t("footer.col.seiten")}</span>
              <Link href="/" className={styles.link}>{t("footer.link.arbeiten")}</Link>
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
              one print-forensics detail on the dark footer. currentColor resolves
              to the footer's paper; --reg-opacity keeps it at a whisper. */}
          <Registration className={styles.regMark} />
          <span>© 2026 nokta · Nordrhein-Westfalen, DE</span>
          <span>{t("footer.disciplines")}</span>
        </div>
      </div>
    </footer>
  );
}
