import Image from "next/image";
import styles from "./WordmarkHeadline.module.css";

type Props = {
  /** Public SVG path for the branch-specific wordmark. */
  logoSrc?: string;
  /** Intrinsic SVG width, used to reserve stable image space. */
  logoWidth?: number;
  /** Intrinsic SVG height, used to reserve stable image space. */
  logoHeight?: number;
  /** Branch suffix without the trailing accent dot (for example, "point"). */
  suffix: string;
  /** Branch-specific headline class for colour, scale, and layout. */
  className?: string;
  /** Branch-specific class for the trailing accent dot. */
  dotClassName?: string;
};

/**
 * Shared branch wordmark headline. The logo is kept as a vector asset so it
 * stays crisp at the large hero sizes; the suffix remains live Righteous text
 * so it wraps and remains accessible as a real heading.
 */
export default function WordmarkHeadline({
  logoSrc = "/nokta_logo-dot-lab.svg",
  logoWidth = 2016,
  logoHeight = 416,
  suffix,
  className,
  dotClassName,
}: Props) {
  return (
    <h1 className={`${styles.title}${className ? ` ${className}` : ""}`}>
      <Image
        src={logoSrc}
        alt="nokta"
        width={logoWidth}
        height={logoHeight}
        preload
        className={styles.logo}
      />
      <span className={styles.suffix}>
        .{suffix}
        <span className={dotClassName ?? styles.dot}>.</span>
      </span>
    </h1>
  );
}
