import Link from "next/link";
import Image from "next/image";
import { BRANCHES } from "@/lib/branches";
import { getT } from "@/lib/i18n";
import styles from "./Footer.module.css";

// Global footer — pure black, mirrors the header's centred column. Social links
// are placeholders (href="#") until the real profiles exist.
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
            <a href="mailto:hallo@waarchi.de" className={styles.email}>
              hallo@waarchi.de
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
            <div className={styles.col}>
              <span className={styles.colH}>{t("footer.col.disciplines")}</span>
              <Link href="/" className={styles.link}>
                nokta.home
              </Link>
              {BRANCHES.map((b) => (
                <Link key={b.key} href={b.path} className={styles.link}>
                  nokta.<span style={{ color: b.bg }}>{b.label}</span>
                </Link>
              ))}
            </div>

            <div className={styles.col}>
              <span className={styles.colH}>{t("footer.col.studio")}</span>
              <Link href="/studio" className={styles.link}>{t("footer.link.team")}</Link>
              <Link href="/kontakt" className={styles.link}>{t("footer.link.kontakt")}</Link>
              <Link href="/impressum" className={styles.link}>{t("footer.link.impressum")}</Link>
              <Link href="/datenschutz" className={styles.link}>{t("footer.link.datenschutz")}</Link>
            </div>

            <div className={styles.col}>
              <span className={styles.colH}>{t("footer.col.social")}</span>
              <a href="#" className={styles.link}>Instagram</a>
              <a href="#" className={styles.link}>LinkedIn</a>
              <a href="#" className={styles.link}>Behance</a>
              <a href="mailto:hallo@waarchi.de" className={styles.link}>E-Mail</a>
            </div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 nokta · Nordrhein-Westfalen, DE</span>
          <span>{t("footer.disciplines")}</span>
        </div>
      </div>
    </footer>
  );
}
