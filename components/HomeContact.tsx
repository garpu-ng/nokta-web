import Link from "next/link";
import styles from "./HomeContact.module.css";

export default function HomeContact({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <section className={styles.contact} aria-labelledby="home-contact-title">
      <div className={styles.dot} aria-hidden="true" />
      <h2 id="home-contact-title">{title}</h2>
      <p className={styles.body}>{body}</p>
      <Link href="/kontakt" className={styles.link}>
        {cta}
        <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
