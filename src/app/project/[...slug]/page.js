"use client";

import styles from "./page.module.css";
import Image from "next/image";
import NavMenu from "../../components/NavMenu";
import PageTransition from "../../components/PageTransition";
import { use, useEffect, useState } from "react";
import { getMediaAssetByName, transformSanityMedia } from "../../../lib/sanity";

export default function ProjectPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const projectName = slug ? slug[0].replace(/%20/g, " ") : "";
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

  return (
    <NavMenu>
      <PageTransition>
        <main className={styles.projectMain}>
          <div className={styles.projectContainer}>
            <div className={styles.projectContent}>
              <div className={styles.textContainer}>
                <div className={styles.textContent}>
                  <h1 className={styles.projectTitle}>Project Title</h1>
                  <p>{displayName}</p>
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
                    className={styles.projectMedia}
                    style={{
                      filter: project.invertColor ? "invert(1)" : "none",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </PageTransition>
    </NavMenu>
  );
}
