import { getT } from "@/lib/i18n";
import styles from "./ColorStrip.module.css";

/* Keep these source-of-truth palette values in sync with app/styles/tokens.css
   (and lib/branches.ts). A print control strip needs the literal ink values. */
const colours = [
  { key: "ink", hex: "1a1a18" },
  { key: "red", hex: "b83636" },
  { key: "cobalt", hex: "4b5cbe" },
  { key: "green", hex: "5f6f53" },
] as const;

const strengths = [100, 70, 40] as const;

export default async function ColorStrip() {
  const t = await getT();
  const swatches = colours.flatMap((colour) =>
    strengths.map((strength) => ({ ...colour, strength })),
  );

  return (
    <section className={styles.section} aria-label={t("nokta.strip.label")}>
      <div className={styles.inner}>
        <p className={styles.label}>{t("nokta.strip.label")}</p>
        <div className={styles.cells} aria-hidden="true">
          {swatches.map((swatch) => (
            <span
              key={`${swatch.hex}-${swatch.strength}`}
              className={`${styles.cell} ${styles[swatch.key]} ${styles[`tone${swatch.strength}`]}`}
            />
          ))}
        </div>
        <div className={styles.labels} aria-hidden="true">
          {swatches.map((swatch) => (
            <span key={`${swatch.hex}-${swatch.strength}`}>
              {swatch.hex} · {swatch.strength}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
