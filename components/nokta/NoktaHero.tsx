import type { CSSProperties } from "react";
import { getT } from "@/lib/i18n";
import PlotterReveal from "@/components/PlotterReveal";
import WordmarkHeadline from "@/components/WordmarkHeadline";
import Registration from "@/components/print/Registration";
import styles from "./NoktaHero.module.css";

/* Press-proof hero. The accent plane is one giant rasterised dot: nokta.point
   rendered literally as a dot made of dots. The grid and radius ramp are
   deliberately deterministic, keeping the server output stable. When the hero
   scrolls into view the dot arrives the way a press lands: it stamps in ring by
   ring from the centre out over ~0.8s (see PlotterReveal + the stylesheet). */
const SIZE = 800;
const STEP = 20;
const RADIUS = SIZE / 2;

/* Grouping the ~1,250 dots into concentric rings keeps the sweep cheap: every
   dot in a ring shares one staggered delay, so we carry ~14 delay values on
   <g> wrappers instead of a style attribute per circle. */
const RINGS = 14;
const RING_STEP_MS = 40; // per-ring stagger (centre = 0, outermost ≈ 520ms)

const halftoneRings = (() => {
  const rings: { x: number; y: number; r: number }[][] = Array.from(
    { length: RINGS },
    () => [],
  );
  for (let y = STEP / 2; y < SIZE; y += STEP) {
    for (let x = STEP / 2; x < SIZE; x += STEP) {
      const distance = Math.hypot(x - RADIUS, y - RADIUS);
      if (distance > RADIUS - STEP / 2) continue;
      const ring = Math.min(RINGS - 1, Math.floor((distance / RADIUS) * RINGS));
      rings[ring].push({
        x,
        y,
        r: 1.5 + 7 * Math.pow(1 - distance / RADIUS, 0.55),
      });
    }
  }
  return rings;
})();

export default async function NoktaHero() {
  const t = await getT();

  return (
    <section className={`${styles.hero} nk-grain`}>
      {/* A thin client shell observes this SVG and toggles the draw-in classes;
          the SVG itself is server-rendered and shipped once as its children. */}
      <PlotterReveal armedClassName={styles.armed} animateClassName={styles.animate}>
        <svg className={styles.halftone} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          {halftoneRings.map((ring, index) => (
            <g
              key={index}
              style={{ "--nk-ring-delay": `${index * RING_STEP_MS}ms` } as CSSProperties}
            >
              {ring.map((dot, dotIndex) => (
                <circle key={dotIndex} cx={dot.x} cy={dot.y} r={dot.r} fill="#b83636" />
              ))}
            </g>
          ))}
        </svg>
      </PlotterReveal>

      <Registration className={styles.registration} />

      <WordmarkHeadline suffix="point" className={styles.title} dotClassName={styles.titleDot} />
      <p className={`nk-mono-caption ${styles.caption}`}>{t("nokta.hero.caption")}</p>
      <p className={styles.claim}>{t("nokta.hero.claim")}</p>
    </section>
  );
}
