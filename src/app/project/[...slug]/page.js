"use client";

import styles from "./page.module.css";
import Image from "next/image";
import NavMenu from "../../components/NavMenu";
import PageTransition from "../../components/PageTransition";
import { use, useEffect, useState } from "react";
import { getMediaAssetByName, transformSanityMedia } from "../../../lib/sanity";

const projectTypeClassMap = {
  dev: "typeDotDev",
  design: "typeDotDesign",
  motion: "typeDotMotion",
  "3d": "typeDot3d",
};

const projectTypeTitleMap = {
  dev: "Development",
  design: "Design",
  motion: "Motion",
  "3d": "3D",
};

const normalizeProjectType = (type) => {
  if (typeof type !== "string") return "";
  return type.trim().toLowerCase();
};

export default function ProjectPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const projectName = Array.isArray(slug)
    ? decodeURIComponent(slug.join("/"))
    : slug
      ? decodeURIComponent(slug)
      : "";
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const asset = await getMediaAssetByName(projectName);
        if (asset) {
          setProject(transformSanityMedia(asset));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project:", error);
        setLoading(false);
      }
    }

    if (projectName) {
      fetchProject();
    }
  }, [projectName]);

  if (loading) {
    return (
      <NavMenu>
        <PageTransition>
          <main className={styles.projectMain}>
            <div className={styles.projectContainer}>
              <p>Loading...</p>
            </div>
          </main>
        </PageTransition>
      </NavMenu>
    );
  }

  if (!project) {
    return (
      <NavMenu>
        <PageTransition>
          <main className={styles.projectMain}>
            <div className={styles.projectContainer}>
              <p>Project not found.</p>
            </div>
          </main>
        </PageTransition>
      </NavMenu>
    );
  }

  const displayName = project.displayName || project.name;
  const projectTypes = Array.isArray(project.projectTypes)
    ? project.projectTypes.map(normalizeProjectType).filter(Boolean)
    : [];

  return (
    <NavMenu>
      <PageTransition>
        <main className={styles.projectMain}>
          <div className={styles.projectContainer}>
            <div className={styles.projectContent}>
              <div className={styles.textContainer}>
                <div className={styles.textContent}>
                  <p>{displayName}</p>
                  {projectTypes.length > 0 && (
                    <div className={styles.listMetaExtras}>
                      <div className={styles.listTypeList} aria-hidden="true">
                        {projectTypes
                          .filter((type) => projectTypeClassMap[type])
                          .map((type) => (
                            <span
                              key={`${project.name}-${type}`}
                              className={styles.listTypeItem}
                            >
                              <span
                                className={`${styles.typeDot} ${
                                  styles[projectTypeClassMap[type]]
                                }`}
                              />
                              <span
                                className={`${styles.listHoverTitle} ${
                                  (projectTypeTitleMap[type] || type) === "3D"
                                    ? styles.preserveCase
                                    : ""
                                }`}
                              >
                                {projectTypeTitleMap[type] || type}
                              </span>
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  <p
                    className={`${styles.projectDescription} ${styles.desktopOnlyDescription}`}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua
                  </p>
                </div>
              </div>
              <div className={styles.mediaWrapper}>
                {project.type === "image" ? (
                  <Image
                    src={project.src}
                    alt={project.alt || project.name}
                    width={project.width}
                    height={project.height}
                    className={styles.projectMedia}
                    style={{
                      filter: project.invertColor ? "invert(1)" : "none",
                    }}
                  />
                ) : (
                  <video
                    src={project.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                    controlsList="nodownload noplaybackrate noremoteplayback"
                    disablePictureInPicture
                    className={styles.projectMedia}
                    style={{
                      filter: project.invertColor ? "invert(1)" : "none",
                    }}
                  />
                )}
              </div>
              <p
                className={`${styles.projectDescription} ${styles.mobileOnlyDescription}`}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua
              </p>
            </div>
          </div>
        </main>
      </PageTransition>
    </NavMenu>
  );
}
