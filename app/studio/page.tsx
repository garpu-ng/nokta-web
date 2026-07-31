import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PortraitClip from "@/components/PortraitClip";
import Reveal from "@/components/Reveal";
import PlateHead from "@/components/nokta/PlateHead";
import RidgeField from "@/components/nokta/RidgeField";
import ServiceIndex from "@/components/nokta/ServiceIndex";
import { getLocale, getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { socialMetadata } from "@/lib/socialMeta";
import styles from "./page.module.css";

/* The studio page: who we are, then what you get. The teaser no longer opens
   this page — it opens the homepage — so the h1 block is the first thing on
   the sheet. */

/* The three of us, in the order the studio lists itself. The portraits are
   drawn rather than photographed: one line figure per person, inside a ruled
   border in that person's colour.

   Kaan's is drawn twice. `clip` is the reveal — the halftone version coming
   into focus — and `src` is that same drawing's LAST frame. The clip plays
   once under a pointer and then holds exactly what `src` shows, so the two
   are one portrait at two moments, not two portraits. Everywhere the clip
   doesn't belong (a touch screen, a reader who asked for less motion) the
   still stands in and nothing is missing but the motion. */
type Member = {
  name: string;
  role: string;
  src: string;
  /** a play-once reveal for this plate; the still is its final frame */
  clip?: {
    sources: { src: string; type: string }[];
    width: number;
    height: number;
  };
};

const TEAM: Member[] = [
  {
    name: "Kaan",
    role: "studio.role.kaan",
    src: "/team/kaan.png",
    clip: {
      sources: [
        { src: "/team/kaan.webm", type: "video/webm" },
        { src: "/team/kaan.mp4", type: "video/mp4" },
      ],
      width: 720,
      height: 888,
    },
  },
  { name: "Mohammed", role: "studio.role.mohammed", src: "/team/mohammed.png" },
  { name: "Mert", role: "studio.role.mert", src: "/team/mert.png" },
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.studio.title");
  const description = t("meta.studio.desc");
  // One URL serves four cookie-picked languages, so the canonical is not a
  // formality. Without its own social block the page also inherited the root
  // layout's, and shared itself under the site's title rather than its own.
  return {
    title,
    description,
    alternates: { canonical: "/studio" },
    ...socialMetadata({ title, description, locale, path: "/studio" }),
  };
}

export default async function StudioPage() {
  const t = await getT();
  const title = `${t("studio.heading")}.`;
  return (
    <main>
      {/* The quiet member of the family, no longer behind the page but
          heading it, with the studio's name cut out of the ruling. */}
      <PlateHead title={title}>
        <RidgeField motto={title} />
      </PlateHead>

      {/* ── Header: the caption left, the practice right ───────────── */}
      <section className={styles.head}>
        <div>
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
          {TEAM.map((member, i) => {
            const { width, height } = getMediaSize(member.src);
            return (
              <Reveal className={styles.card} key={member.name} delay={i * 100}>
                <div className={styles.portrait}>
                  <Image
                    src={member.src}
                    /* Empty on purpose: the name is set as real text two lines
                       down, in this same card, and the drawing says nothing the
                       caption doesn't. An alt here would announce each of us
                       twice. */
                    alt=""
                    width={width}
                    height={height}
                    sizes="(max-width: 899px) 320px, (max-width: 1199px) 33vw, 452px"
                    /* .still only where there is a clip to stand down for.
                       On a plate with no clip it is the portrait, full stop —
                       marking it .still would hide it on every desktop. */
                    className={
                      member.clip
                        ? `${styles.portraitMedia} ${styles.still}`
                        : styles.portraitMedia
                    }
                  />
                  {/* Only one of the two is ever in the box — the CSS decides
                      which, so a plate without a pointer never waits on JS to
                      show a portrait. */}
                  {member.clip ? (
                    <PortraitClip
                      sources={member.clip.sources}
                      width={member.clip.width}
                      height={member.clip.height}
                      className={`${styles.portraitMedia} ${styles.clip}`}
                    />
                  ) : null}
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.name}>{member.name}</span>
                  <span className={styles.role}>{t(member.role)}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── What you get ───────────────────────────────────────────
          The one paper section in the whole site: four rows, each stated as a
          deliverable. It carries its own full-width field. */}
      <ServiceIndex />

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className={styles.cta}>
        <p className={styles.ctaText}>{t("studio.cta")}</p>
        {/* One button. It used to be two — the second pointed at /prozess,
            which is retired, and the pair was always an outline standing next
            to a fill anyway: a real choice offered where there is only one
            thing to do here. */}
        <div className={styles.ctaLinks}>
          <Link href="/kontakt" className={styles.ctaFill}>
            {t("studio.ctaWrite")}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
