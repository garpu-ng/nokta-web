import { PROJECTS } from "@/lib/projects";
import Image from "next/image";
import Link from "next/link";

export default function Carousel() {
  // Duplicate projects for seamless loop
  const items = [...PROJECTS, ...PROJECTS];

  return (
    <div className="carousel-wrapper">
      <div className="carousel-inner">
        <div className="carousel-track">
          {items.map((project, i) => (
            <Link
              key={`${project.slug}-${i}`}
              href={`/projekte/${project.slug}`}
              className="carousel-card w-dyn-item"
              style={{ aspectRatio: "4/3" }}
            >
              <Image
                src={project.thumb}
                alt={project.title}
                fill
                sizes="33vw"
                style={{ objectFit: "cover" }}
              />
              <div className="carousel-card-label">
                <div
                  style={{
                    fontSize: "0.65rem",
                    opacity: 0.75,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "3px",
                  }}
                >
                  {project.client}
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.2 }}>
                  {project.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
