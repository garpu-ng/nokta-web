import { PROJECTS } from "@/lib/projects";
import Link from "next/link";
import Image from "next/image";

export default function WorkGrid() {
  return (
    <div className="work-section top work-new">
      <div className="work_wrapper w-dyn-list">
        <div className="work_list new w-dyn-items">
          {PROJECTS.map((project) => (
            <div
              key={project.slug}
              className="work_item w-dyn-item"
              style={{
                gridColumn: `span ${project.span}`,
              }}
            >
              <Link
                href={`/projekte/${project.slug}`}
                className={`work-link${project.span >= 6 ? " big" : ""}`}
                style={{ display: "block", position: "relative", overflow: "hidden" }}
              >
                <div className="work-project" style={{ position: "relative", width: "100%", height: "100%" }}>
                  <Image
                    src={project.thumb}
                    alt={project.title}
                    fill
                    priority={project.span >= 6}
                    sizes={
                      project.span === 6
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 50vw, 25vw"
                    }
                    className="project-image-main"
                  />

                  {/* Overlay */}
                  <div className="project-card new">
                    <div
                      className="project-name re new small"
                      style={{ marginBottom: "4px" }}
                    >
                      {project.client}
                    </div>
                    <div className="project-name new">
                      {project.title}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
