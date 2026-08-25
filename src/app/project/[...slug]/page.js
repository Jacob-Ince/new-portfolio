"use client";

import styles from "./page.module.css";
import Image from "next/image";
import NavMenu from "../../components/NavMenu";
import { use, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const desktopDescriptionRef = useRef(null);
  const mobileDescriptionRef = useRef(null);
  const [desktopDescriptionLines, setDesktopDescriptionLines] = useState([]);
  const [mobileDescriptionLines, setMobileDescriptionLines] = useState([]);
  const [showDescriptionOverlay, setShowDescriptionOverlay] = useState(true);

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

  const projectDescriptionText =
    typeof project?.projectDescription === "string" &&
    project.projectDescription.trim().length > 0
      ? project.projectDescription.trim()
      : "Project description coming soon.";
  const descriptionWords = projectDescriptionText.split(/\s+/).filter(Boolean);
  const renderedDescriptionLines =
    desktopDescriptionLines.length > 0
      ? desktopDescriptionLines
      : [projectDescriptionText];
  const renderedMobileDescriptionLines =
    mobileDescriptionLines.length > 0
      ? mobileDescriptionLines
      : [projectDescriptionText];

  useLayoutEffect(() => {
    if (loading || !project) return;

    const projectTypeCount = Array.isArray(project.projectTypes)
      ? project.projectTypes.map(normalizeProjectType).filter(Boolean).length
      : 0;
    const MOBILE_SEQUENCE_START_MS = 780;
    const MOBILE_SEQUENCE_STEP_MS = 140;
    const MOBILE_LIST_ITEM_STAGGER_MS = 90;
    const listItemsStaggerSpanMs =
      projectTypeCount > 1
        ? (projectTypeCount - 1) * MOBILE_LIST_ITEM_STAGGER_MS
        : 0;
    const mobileDescriptionDelay =
      projectTypeCount > 0
        ? MOBILE_SEQUENCE_START_MS +
          MOBILE_SEQUENCE_STEP_MS +
          120 +
          listItemsStaggerSpanMs
        : MOBILE_SEQUENCE_START_MS + MOBILE_SEQUENCE_STEP_MS;
    const maxDescriptionLines = Math.max(
      desktopDescriptionLines.length,
      mobileDescriptionLines.length,
      1,
    );
    const descriptionLinesDuration = 160 + (maxDescriptionLines - 1) * 90 + 500;
    const hideOverlayDelay = Math.max(
      1400,
      mobileDescriptionDelay + descriptionLinesDuration + 120,
    );

    const splitDescriptionIntoRenderedLines = (container) => {
      if (!container) return;

      const wordNodes = Array.from(
        container.querySelectorAll("[data-line-word]"),
      );
      if (wordNodes.length === 0) return;

      const lines = [];
      let currentLineWords = [];
      let currentTop = wordNodes[0].offsetTop;

      wordNodes.forEach((wordNode) => {
        const word = wordNode.getAttribute("data-line-word");
        if (!word) return;

        if (wordNode.offsetTop !== currentTop) {
          if (currentLineWords.length > 0) {
            lines.push(currentLineWords.join(" "));
          }
          currentLineWords = [word];
          currentTop = wordNode.offsetTop;
        } else {
          currentLineWords.push(word);
        }
      });

      if (currentLineWords.length > 0) {
        lines.push(currentLineWords.join(" "));
      }

      return lines;
    };

    const updateDescriptionLines = () => {
      const nextDesktopLines = splitDescriptionIntoRenderedLines(
        desktopDescriptionRef.current,
      );
      if (nextDesktopLines && nextDesktopLines.length > 0) {
        setDesktopDescriptionLines(nextDesktopLines);
      }

      const nextMobileLines = splitDescriptionIntoRenderedLines(
        mobileDescriptionRef.current,
      );
      if (nextMobileLines && nextMobileLines.length > 0) {
        setMobileDescriptionLines(nextMobileLines);
      }
    };

    updateDescriptionLines();
    setShowDescriptionOverlay(true);
    const hideOverlayTimeout = window.setTimeout(() => {
      setShowDescriptionOverlay(false);
    }, hideOverlayDelay);

    return () => {
      window.clearTimeout(hideOverlayTimeout);
    };
  }, [
    loading,
    project,
    projectDescriptionText,
    desktopDescriptionLines.length,
    mobileDescriptionLines.length,
  ]);

  // Keep route transitions visually clean while project data resolves.
  if (loading) {
    return null;
  }

  if (!project) {
    return (
      <NavMenu>
        <main className={styles.projectMain}>
          <div className={styles.projectContainer}>
            <p>Project not found.</p>
          </div>
        </main>
      </NavMenu>
    );
  }

  const displayName = project.displayName || project.name;
  const projectTypes = Array.isArray(project.projectTypes)
    ? project.projectTypes.map(normalizeProjectType).filter(Boolean)
    : [];
  const hasProjectTypes = projectTypes.length > 0;
  const MOBILE_SEQUENCE_START_MS = 780;
  const MOBILE_SEQUENCE_STEP_MS = 140;
  const MOBILE_LIST_ITEM_STAGGER_MS = 90;
  const listItemsStaggerSpanMs =
    projectTypes.length > 1
      ? (projectTypes.length - 1) * MOBILE_LIST_ITEM_STAGGER_MS
      : 0;
  const mobileDisplayNameDelay = MOBILE_SEQUENCE_START_MS;
  const mobileListMetaDelay = mobileDisplayNameDelay + MOBILE_SEQUENCE_STEP_MS;
  const mobileDescriptionDelay = hasProjectTypes
    ? mobileListMetaDelay + 120 + listItemsStaggerSpanMs
    : mobileDisplayNameDelay + MOBILE_SEQUENCE_STEP_MS;
  const mobileMediaDelay = mobileDescriptionDelay + MOBILE_SEQUENCE_STEP_MS;

  return (
    <NavMenu>
      <main className={styles.projectMain}>
        <div className={styles.projectContainer}>
          <div className={styles.projectContent}>
            <div className={styles.textContainer}>
              <div className={styles.textContent}>
                <p
                  className={styles.mobileSequenceDisplayName}
                  style={{
                    "--mobile-enter-delay": `${mobileDisplayNameDelay}ms`,
                  }}
                >
                  {displayName}
                </p>
                {projectTypes.length > 0 && (
                  <div
                    className={`${styles.listMetaExtras} ${styles.mobileSequenceListMeta}`}
                    style={{
                      "--mobile-enter-delay": `${mobileListMetaDelay}ms`,
                    }}
                  >
                    <div className={styles.listTypeList} aria-hidden="true">
                      {projectTypes
                        .filter((type) => projectTypeClassMap[type])
                        .map((type, index) => (
                          <span
                            key={`${project.name}-${type}`}
                            className={`${styles.listTypeItem} ${styles.mobileSequenceListTypeItem}`}
                            style={{
                              "--mobile-list-item-delay": `${
                                mobileListMetaDelay +
                                80 +
                                index * MOBILE_LIST_ITEM_STAGGER_MS
                              }ms`,
                            }}
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
                  ref={desktopDescriptionRef}
                  className={`${styles.projectDescription} ${styles.desktopOnlyDescription} ${
                    showDescriptionOverlay ? styles.descriptionHasOverlay : ""
                  }`}
                >
                  {projectDescriptionText}
                  {showDescriptionOverlay && (
                    <span
                      className={styles.descriptionOverlay}
                      aria-hidden="true"
                    >
                      <span className={styles.descriptionMeasure}>
                        {descriptionWords.map((word, index) => (
                          <span
                            key={`${project.name}-measure-word-${index}`}
                            data-line-word={word}
                            className={styles.descriptionMeasureWord}
                          >
                            {word}{" "}
                          </span>
                        ))}
                      </span>
                      {renderedDescriptionLines.map((line, index) => (
                        <span
                          key={`${project.name}-description-line-${index}`}
                          className={styles.descriptionLineMask}
                        >
                          <span
                            className={styles.descriptionLine}
                            style={{ "--line-index": index }}
                          >
                            {line}
                          </span>
                        </span>
                      ))}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <p
              ref={mobileDescriptionRef}
              className={`${styles.projectDescription} ${styles.mobileOnlyDescription} ${styles.mobileSequenceDescription} ${
                showDescriptionOverlay ? styles.descriptionHasOverlay : ""
              }`}
              style={{
                "--mobile-enter-delay": `${mobileDescriptionDelay}ms`,
                "--description-line-delay-offset": `${mobileDescriptionDelay}ms`,
              }}
            >
              {projectDescriptionText}
              {showDescriptionOverlay && (
                <span className={styles.descriptionOverlay} aria-hidden="true">
                  <span className={styles.descriptionMeasure}>
                    {descriptionWords.map((word, index) => (
                      <span
                        key={`${project.name}-mobile-measure-word-${index}`}
                        data-line-word={word}
                        className={styles.descriptionMeasureWord}
                      >
                        {word}{" "}
                      </span>
                    ))}
                  </span>
                  {renderedMobileDescriptionLines.map((line, index) => (
                    <span
                      key={`${project.name}-mobile-description-line-${index}`}
                      className={styles.descriptionLineMask}
                    >
                      <span
                        className={styles.descriptionLine}
                        style={{ "--line-index": index }}
                      >
                        {line}
                      </span>
                    </span>
                  ))}
                </span>
              )}
            </p>
            <div
              className={`${styles.mediaWrapper} ${styles.mobileSequenceMedia}`}
              style={{ "--mobile-enter-delay": `${mobileMediaDelay}ms` }}
            >
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
                  preload="metadata"
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
          </div>
        </div>
      </main>
    </NavMenu>
  );
}
