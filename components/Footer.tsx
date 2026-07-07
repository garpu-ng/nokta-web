import Link from "next/link";
import { BRANCHES } from "@/lib/branches";
import styles from "./Footer.module.css";

// Global footer — pure black, mirrors the header's centred column. Social links
// are placeholders (href="#") until the real profiles exist.
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.mark}>
              nokta<span>.</span>
            </Link>
            <p className={styles.tag}>
              Ein Studio, drei Disziplinen.
              <br />
              Vom Punkt zur Linie zur Form.
            </p>
            <a href="mailto:hallo@waarchi.de" className={styles.email}>
              hallo@waarchi.de
            </a>
          </div>

          {/* Decorative dot-row animation, sits between the brand block and
              the link columns. Transparent-background animated WebP. */}
          <img
            src="/nokta_dots_row.webp"
            alt=""
            aria-hidden="true"
            className={styles.dotsRow}
          />

          <nav className={styles.cols} aria-label="Footer">
            <div className={styles.col}>
              <span className={styles.colH}>Disziplinen</span>
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
              <span className={styles.colH}>Studio</span>
              <Link href="/studio" className={styles.link}>team</Link>
              <Link href="/kontakt" className={styles.link}>kontakt</Link>
              <Link href="/impressum" className={styles.link}>impressum</Link>
              <Link href="/datenschutz" className={styles.link}>datenschutz</Link>
            </div>

            <div className={styles.col}>
              <span className={styles.colH}>Social</span>
              <a href="#" className={styles.link}>Instagram</a>
              <a href="#" className={styles.link}>LinkedIn</a>
              <a href="#" className={styles.link}>Behance</a>
              <a href="mailto:hallo@waarchi.de" className={styles.link}>E-Mail</a>
            </div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 nokta — Nordrhein-Westfalen, DE</span>
          <span>Architektur · Design · Liniendrucke</span>
        </div>
      </div>
    </footer>
  );
}
