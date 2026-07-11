import { getT } from "@/lib/i18n";
import styles from "./NoktaHero.module.css";

/* Press-proof hero. The accent plane is one giant rasterised dot: nokta.point
   rendered literally as a dot made of dots. The grid and radius ramp are
   deliberately deterministic, keeping the server output stable. */
const SIZE = 800;
const STEP = 20;
const RADIUS = SIZE / 2;

const halftoneDots = (() => {
  const dots: { x: number; y: number; r: number }[] = [];
  for (let y = STEP / 2; y < SIZE; y += STEP) {
    for (let x = STEP / 2; x < SIZE; x += STEP) {
      const distance = Math.hypot(x - RADIUS, y - RADIUS);
      if (distance > RADIUS - STEP / 2) continue;
      dots.push({
        x,
        y,
        r: 1.5 + 7 * Math.pow(1 - distance / RADIUS, 0.55),
      });
    }
  }
  return dots;
})();

function CropMark({ corner }: { corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" }) {
  const path = {
    topLeft: "M12 34H34M34 12V34",
    topRight: "M34 34H56M34 12V34",
    bottomLeft: "M12 34H34M34 34V56",
    bottomRight: "M34 34H56M34 34V56",
  }[corner];

  return (
    <svg
      className={`${styles.cropMark} ${styles[corner]}`}
      viewBox="0 0 68 68"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default async function NoktaHero() {
  const t = await getT();

  return (
    <section className={`${styles.hero} nk-grain`}>
      <svg className={styles.halftone} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        {halftoneDots.map((dot, index) => (
          <circle key={index} cx={dot.x} cy={dot.y} r={dot.r} fill="#b83636" />
        ))}
      </svg>

      <CropMark corner="topLeft" />
      <CropMark corner="topRight" />
      <CropMark corner="bottomLeft" />
      <CropMark corner="bottomRight" />

      <svg className={styles.registration} viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r="12" />
        <path d="M26 4v44M4 26h44" />
      </svg>

      <h1 className={styles.title}>
        nokta.point<span className={styles.titleDot}>.</span>
      </h1>
      <p className={styles.caption}>{t("nokta.hero.caption")}</p>
      <p className={styles.claim}>{t("nokta.hero.claim")}</p>
    </section>
  );
}
