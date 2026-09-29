import Image from "next/image";
import Link from "next/link";
import { getMediaSize } from "@/lib/mediaSizes";
import styles from "./HomeHero.module.css";

/* The homepage's first screen: one rendering, whole, with the studio's
   sentence set over it. A visitor who never scrolls still leaves knowing
   what nokta makes and where to go next.

   The picture is the long tea table of the Teahouse, the widest and sharpest
   render the studio has. A dark wash rises from the lower left so the type
   stands on shadow, never on the bright wall; the credit in the lower right
   says which work the picture is and links to it.

   The h1 lives here now. The dot plate that used to open the page (and carried
   the h1 off-screen) hangs at the foot of the page instead. */

const SRC = "/projects/teahouse/01.jpg";

export default function HomeHero({
  eyebrow,
  title,
  sub,
  ctaWork,
  ctaContact,
  caption,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  ctaWork: string;
  ctaContact: string;
  caption: string;
}) {
  const { width, height } = getMediaSize(SRC);
  return (
    <section className={styles.hero}>
      <div className={styles.box}>
        <Image
          src={SRC}
          alt=""
          width={width}
          height={height}
          sizes="(max-width: 1500px) 100vw, 1420px"
          preload
          className={styles.img}
        />
        <div className={styles.wash} aria-hidden="true" />

        <div className={styles.copy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.sub}>{sub}</p>
          <div className={styles.actions}>
            <Link href="/kontakt" className={styles.primary}>
              {ctaContact}
              <span aria-hidden="true"> ↗</span>
            </Link>
            <Link href="/arbeiten" className={styles.secondary}>
              {ctaWork}
            </Link>
          </div>
        </div>

        <Link href="/arbeiten/teahouse" className={styles.credit}>
          {caption}
        </Link>
      </div>
    </section>
  );
}
