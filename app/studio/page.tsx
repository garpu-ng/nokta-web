import type { Metadata } from "next";
import Link from "next/link";
import GifVideo from "@/components/GifVideo";
import Reveal from "@/components/Reveal";
import ServiceIndex from "@/components/nokta/ServiceIndex";
import { getT } from "@/lib/i18n";
import styles from "./page.module.css";

/* The studio page: who we are, then what you get. The teaser no longer opens
   this page — it opens the homepage — so the h1 block is the first thing on
   the sheet. */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.studio.title"),
    description: t("meta.studio.desc"),
  };
}

export default async function StudioPage() {
  const t = await getT();
  return (
    <main>
      {/* ── Header: the name left, the practice right ─────────────── */}
      <section className={styles.head}>
        <div>
          <h1 className={styles.heading}>
            {t("studio.heading")}
            <span className={styles.period}>.</span>
          </h1>
          <p className={styles.caption}>{t("studio.caption")}</p>
        </div>
        <div className={styles.headText}>
          <p>{t("studio.p1")}</p>
          <p>{t("studio.p2")}</p>
          <p>{t("studio.p3")}</p>
        </div>
      </section>

      {/* ── Team ───────────────────────────────────────────────────
          Three portraits, pinned up one after the other. */}
      <section className={styles.team} aria-labelledby="nk-team">
        <h2 id="nk-team" className={styles.label}>
          {t("studio.team")}
        </h2>
        <div className={styles.teamGrid}>
          <Reveal className={styles.card}>
            <div className={styles.portrait}>
              <GifVideo
                src="/flymekaan.mp4"
                label="Kaan"
                width={502}
                height={1014}
                className={styles.portraitMedia}
              />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.name}>Kaan</span>
              <span className={styles.role}>{t("studio.role.kaan")}</span>
            </div>
          </Reveal>

          <Reveal className={styles.card} delay={100}>
            <div className={styles.portrait}>
              <GifVideo
                src="/flymehammed.mp4"
                label="Mohammed"
                width={502}
                height={1014}
                className={styles.portraitMedia}
              />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.name}>Mohammed</span>
              <span className={styles.role}>{t("studio.role.mohammed")}</span>
            </div>
          </Reveal>

          <Reveal className={styles.card} delay={200}>
            {/* Mert's portrait asset isn't in /public yet — there's no
                /flymemert.mp4 (the old /flymemert.gif 404'd too), so a
                <GifVideo> here would render an empty frame. Until it lands,
                the frame says so in the press-sheet vocabulary: an outlined
                plate with a centred crosshair and a mono caption.

                TO SWAP IN THE REAL PORTRAIT: drop the converted clip at
                public/flymemert.mp4 and replace this whole <div.placeholder>
                with the same two lines the other cards use:
                  <div className={styles.portrait}>
                    <GifVideo src="/flymemert.mp4" label="Mert" width={502}
                              height={1014} className={styles.portraitMedia} />
                  </div> */}
            <div className={styles.placeholder} aria-hidden="true">
              <span className={styles.crosshair} />
              <span className={styles.placeholderLabel}>
                {t("studio.mert.placeholder")}
              </span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.name}>Mert</span>
              <span className={styles.role}>{t("studio.role.mert")}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What you get ───────────────────────────────────────────
          The one paper section in the whole site: four rows, each stated as a
          deliverable. It carries its own full-width field. */}
      <ServiceIndex />

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className={styles.cta}>
        <p className={styles.ctaText}>{t("studio.cta")}</p>
        <div className={styles.ctaLinks}>
          <Link href="/prozess" className={styles.ctaOutline}>
            {t("studio.ctaProcess")}
          </Link>
          <Link href="/kontakt" className={styles.ctaFill}>
            {t("studio.ctaWrite")}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
