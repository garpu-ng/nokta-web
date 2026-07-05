import Link from "next/link";
import { BRANCHES } from "@/lib/branches";

// Global footer — pure black, mirrors the header's centred column. Social links
// are placeholders (href="#") until the real profiles exist.
export default function Footer() {
  return (
    <footer className="nk-footer">
      <div className="nk-footer-inner">
        <div className="nk-footer-top">
          <div className="nk-footer-brand">
            <Link href="/" className="nk-footer-mark">
              nokta<span>.</span>
            </Link>
            <p className="nk-footer-tag">
              Ein Studio, drei Disziplinen.
              <br />
              Vom Punkt zur Linie zur Form.
            </p>
            <a href="mailto:hallo@waarchi.de" className="nk-footer-email">
              hallo@waarchi.de
            </a>
          </div>

          <nav className="nk-footer-cols" aria-label="Footer">
            <div className="nk-footer-col">
              <span className="nk-footer-col-h">Disziplinen</span>
              <Link href="/" className="nk-footer-link">
                nokta.home
              </Link>
              {BRANCHES.map((b) => (
                <Link key={b.key} href={b.path} className="nk-footer-link">
                  nokta.<span style={{ color: b.bg }}>{b.label}</span>
                </Link>
              ))}
            </div>

            <div className="nk-footer-col">
              <span className="nk-footer-col-h">Studio</span>
              <Link href="/studio" className="nk-footer-link">team</Link>
              <Link href="/kontakt" className="nk-footer-link">kontakt</Link>
              <Link href="/impressum" className="nk-footer-link">impressum</Link>
              <Link href="/datenschutz" className="nk-footer-link">datenschutz</Link>
            </div>

            <div className="nk-footer-col">
              <span className="nk-footer-col-h">Social</span>
              <a href="#" className="nk-footer-link">Instagram</a>
              <a href="#" className="nk-footer-link">LinkedIn</a>
              <a href="#" className="nk-footer-link">Behance</a>
              <a href="mailto:hallo@waarchi.de" className="nk-footer-link">E-Mail</a>
            </div>
          </nav>
        </div>

        <div className="nk-footer-bottom">
          <span>© 2026 nokta — Nordrhein-Westfalen, DE</span>
          <span>Architektur · Design · Liniendrucke</span>
        </div>
      </div>
    </footer>
  );
}
