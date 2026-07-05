import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { BRANCHES } from "@/lib/branches";

export const metadata: Metadata = {
  title: "nokta — ein Studio, drei Disziplinen",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="nk-landing">
      <p className="nk-landing-lead">
        Ein Studio, drei Disziplinen. Vom Punkt zur Linie zur Form.
      </p>

      <div className="nk-branch-grid">
        {BRANCHES.map((b) => (
          <Link
            key={b.key}
            href={b.path}
            className="nk-branch-card"
            style={{ "--accent": b.accent } as CSSProperties}
          >
            <span className="nk-branch-card__key">
              nokta.{b.label}
              <span className="nk-dot">.</span>
            </span>
            <span className="nk-branch-card__tag">{b.tagline}</span>
            <span className="nk-branch-card__desc">{b.desc}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
