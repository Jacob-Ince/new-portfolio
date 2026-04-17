"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useEffect, useState, useRef, useCallback } from "react";
import NavMenu from "./components/NavMenu";
import Link from "next/link";
import { getAllMediaAssets, transformSanityMedia } from "../lib/sanity";

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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loadedItems, setLoadedItems] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [photosData, setPhotosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [isViewCursorVisible, setIsViewCursorVisible] = useState(false);
  const videoRefs = useRef({});
  const observerRef = useRef(null);
  const viewCursorRef = useRef(null);
  const cursorTargetPosRef = useRef({ x: 0, y: 0 });
  const cursorCurrentPosRef = useRef({ x: 0, y: 0 });
  const cursorRafRef = useRef(null);

  // Fetch media assets from Sanity
  useEffect(() => {
    async function fetchMediaAssets() {
      try {
        const assets = await getAllMediaAssets();
        const transformed = assets.map(transformSanityMedia).filter(Boolean);
        setPhotosData(transformed);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching media assets:", error);
        // Fallback to empty array or handle error
        setPhotosData([]);
        setLoading(false);
      }
    }

    fetchMediaAssets();
  }, []);

  // Initial setup effect
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    setMounted(true);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Setup intersection observer for videos
  useEffect(() => {
    if (!mounted) return;

    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const videoId = video.dataset.videoId;

          if (entry.isIntersecting) {
            console.log(
              `Video ${videoId} is intersecting, readyState:`,
              video.readyState,
            );

            // Start loading video data immediately when it comes into view
            if (video.preload === "metadata") {
              video.preload = "auto";
            }

            // Try to play the video if it's ready
            if (video.readyState >= 2) {
              console.log(
                `Video ${videoId} ready to play, attempting playback`,
              );
              playVideo(videoId);
            }
          } else {
            // Only pause if video is significantly out of view
            const rect = video.getBoundingClientRect();
            const isSignificantlyOutOfView =
              rect.bottom < -300 || rect.top > window.innerHeight + 300;

            if (isSignificantlyOutOfView) {
              console.log(`Video ${videoId} paused - out of view`);
              video.pause();
            }
          }
        });
      },
      {
        rootMargin: "100px 0px",
        threshold: 0.1,
      },
    );

    // Pause all videos when page becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        Object.values(videoRefs.current).forEach((video) => {
          if (video && !video.paused) {
            video.pause();
          }
        });
      }
    };

    // Additional safety measure: pause videos that are out of view on scroll
    const handleScroll = () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video && !video.paused) {
          const rect = video.getBoundingClientRect();
          const isSignificantlyOutOfView =
            rect.bottom < -100 || rect.top > window.innerHeight + 100;

          if (isSignificantlyOutOfView) {
            video.pause();
          }
        }
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      // Pause all videos on cleanup
      Object.values(videoRefs.current).forEach((video) => {
        if (video && !video.paused) {
          video.pause();
        }
      });

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted]);

  // Function to observe a video element
  const observeVideo = useCallback((videoElement) => {
    if (observerRef.current && videoElement) {
      observerRef.current.observe(videoElement);
    }
  }, []);

  // Function to safely play a video with retry logic
  const playVideo = useCallback((videoId, retryCount = 0) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    if (video.readyState >= 2) {
      video
        .play()
        .then(() => {
          console.log(`Video ${videoId} playing successfully`);
        })
        .catch((error) => {
          console.warn(
            `Failed to play video ${videoId} (attempt ${retryCount + 1}):`,
            error,
          );

          // Retry after a short delay if we haven't exceeded max retries
          if (retryCount < 3) {
            setTimeout(() => {
              playVideo(videoId, retryCount + 1);
            }, 1000);
          }
        });
    } else if (retryCount < 3) {
      // Video not ready yet, retry after a delay
      setTimeout(() => {
        playVideo(videoId, retryCount + 1);
      }, 500);
    }
  }, []);

  const handleLoad = (id) => {
    setLoadedItems((prev) => new Set([...prev, id]));
  };

  const getVideoMimeType = (src) => {
    if (!src) return undefined;
    const ext = src.split(".").pop()?.toLowerCase();
    if (!ext) return undefined;
    if (ext === "mp4") return "video/mp4";
    if (ext === "m4v") return "video/x-m4v";
    if (ext === "webm") return "video/webm";
    if (ext === "mov") return "video/quicktime";
    return undefined;
  };

  const applyViewCursorPosition = useCallback((x, y) => {
    if (!viewCursorRef.current) return;
    viewCursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  }, []);

  const animateViewCursor = useCallback(() => {
    const smoothing = 0.15;
    const target = cursorTargetPosRef.current;
    const current = cursorCurrentPosRef.current;

    current.x += (target.x - current.x) * smoothing;
    current.y += (target.y - current.y) * smoothing;

    applyViewCursorPosition(current.x, current.y);

    const dx = Math.abs(target.x - current.x);
    const dy = Math.abs(target.y - current.y);

    if (dx < 0.1 && dy < 0.1) {
      cursorRafRef.current = null;
      return;
    }

    cursorRafRef.current = requestAnimationFrame(animateViewCursor);
  }, [applyViewCursorPosition]);

  const updateViewCursorPosition = useCallback(
    (event) => {
      cursorTargetPosRef.current = { x: event.clientX, y: event.clientY };

      if (!cursorRafRef.current) {
        cursorRafRef.current = requestAnimationFrame(animateViewCursor);
      }
    },
    [animateViewCursor],
  );

  const handleGridCursorAreaMouseEnter = useCallback(
    (event) => {
      if (isMobile || viewMode !== "grid") return;
      const nextPosition = { x: event.clientX, y: event.clientY };
      cursorTargetPosRef.current = nextPosition;
      cursorCurrentPosRef.current = nextPosition;
      applyViewCursorPosition(nextPosition.x, nextPosition.y);
      setIsViewCursorVisible(true);
    },
    [applyViewCursorPosition, isMobile, viewMode],
  );

  const handleGridCursorAreaMouseMove = useCallback(
    (event) => {
      if (isMobile || viewMode !== "grid") return;
      updateViewCursorPosition(event);
    },
    [isMobile, updateViewCursorPosition, viewMode],
  );

  const handleGridCursorAreaMouseLeave = useCallback(() => {
    setIsViewCursorVisible(false);
    if (cursorRafRef.current) {
      cancelAnimationFrame(cursorRafRef.current);
      cursorRafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (viewMode !== "grid") {
      setIsViewCursorVisible(false);
      if (cursorRafRef.current) {
        cancelAnimationFrame(cursorRafRef.current);
        cursorRafRef.current = null;
      }
    }
  }, [viewMode]);

  useEffect(() => {
    return () => {
      if (cursorRafRef.current) {
        cancelAnimationFrame(cursorRafRef.current);
      }
    };
  }, []);

  const renderMedia = (photo) => {
    if (!photo?.src) return null;
    const isLoaded = loadedItems.has(photo.id);
    const projectTypes = Array.isArray(photo.projectTypes)
      ? photo.projectTypes.map(normalizeProjectType).filter(Boolean)
      : [];
    const displayName = photo.displayName || photo.name;
    const videoType =
      photo.type === "video" ? getVideoMimeType(photo.src) : undefined;

    return (
      <Link href={`/project/${encodeURIComponent(photo.name)}`} key={photo.id}>
        <div
          className={`${styles.gridItem} ${
            photo.invertColor ? styles.gridItemInverted : ""
          }`}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          {photo.type === "video" ? (
            <div className={styles.mediaWrapper}>
              <video
                ref={(el) => {
                  if (el) {
                    videoRefs.current[photo.id] = el;
                    observeVideo(el);
                  }
                }}
                data-video-id={photo.id}
                muted
                playsInline
                autoPlay
                loop
                preload={photo.id <= 4 ? "auto" : "metadata"}
                onLoadedData={() => {
                  handleLoad(photo.id);
                }}
                onCanPlay={() => {
                  playVideo(photo.id);
                }}
                onTouchStart={() => {
                  playVideo(photo.id);
                }}
                onPointerDown={() => {
                  playVideo(photo.id);
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: photo.invertColor ? "invert(1)" : "none",
                }}
              >
                <source src={photo.src} type={videoType} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className={styles.mediaWrapper}>
              <Image
                src={photo.src}
                alt={photo.alt || "Image"}
                width={photo.width}
                height={photo.height}
                onLoad={() => {
                  handleLoad(photo.id);
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: photo.invertColor ? "invert(1)" : "none",
                }}
                loading={photo.id <= 4 ? undefined : "lazy"}
                quality={isMobile ? 50 : 75}
                priority={photo.id <= 4}
                sizes={
                  isMobile
                    ? "(max-width: 350px) 100vw, (max-width: 600px) 100vw"
                    : "(max-width: 350px) 100vw, (max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                }
              />
            </div>
          )}
          <div className={styles.mediaMeta}>
            <p className={styles.mediaText}>{displayName}</p>
            {projectTypes.length > 0 && (
              <div className={styles.listMetaExtras}>
                <div className={styles.listTypeList} aria-hidden="true">
                  {projectTypes
                    .filter((type) => projectTypeClassMap[type])
                    .map((type) => (
                      <span
                        key={`${photo.id}-${type}`}
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
          </div>
        </div>
      </Link>
    );
  };

  const renderListItem = (photo) => {
    if (!photo?.src) return null;
    const projectTypes = Array.isArray(photo.projectTypes)
      ? photo.projectTypes.map(normalizeProjectType).filter(Boolean)
      : [];
    const displayName = photo.displayName || photo.name;

    return (
      <li key={photo.id} className={styles.listItem}>
        <Link
          href={`/project/${encodeURIComponent(photo.name)}`}
          className={styles.listLink}
        >
          <div className={styles.listMeta}>
            <p className={styles.listTitle}>{displayName}</p>
            {projectTypes.length > 0 && (
              <div className={styles.listMetaExtras}>
                <div className={styles.listTypeList} aria-hidden="true">
                  {projectTypes
                    .filter((type) => projectTypeClassMap[type])
                    .map((type) => (
                      <span
                        key={`${photo.id}-${type}`}
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
          </div>
        </Link>
      </li>
    );
  };

  const getSizeClass = (photo) => {
    if (photo.type === "video") {
      return styles.extraLarge;
    }

    const aspectRatio = photo.width / photo.height;
    if (aspectRatio > 1.5) {
      return styles.wide;
    } else if (aspectRatio < 0.7) {
      return styles.tall;
    } else if (photo.width > 1000 || photo.height > 1000) {
      return styles.large;
    }
    return "";
  };

  // Sort photos by orderRank (string like "a0", "a1", etc.)
  const sortedPhotos = [...photosData]
    .filter((photo) => photo?.src)
    .sort((a, b) => {
      // orderRank is a string, so we can sort lexicographically
      const orderA = a.orderRank || a.id || "a0";
      const orderB = b.orderRank || b.id || "a0";
      return orderA.localeCompare(orderB);
    });

  // Don't render anything until after hydration and data is loaded
  if (!mounted || loading) {
    return null;
  }

  return (
    <NavMenu viewMode={viewMode} onViewModeChange={setViewMode}>
      <main className={styles.main}>
        <div
          className={styles.mobileViewToggle}
          role="group"
          aria-label="View mode"
        >
          <button
            type="button"
            className={`${styles.mobileViewButton} ${
              viewMode === "grid" ? styles.mobileViewButtonActive : ""
            }`}
            aria-pressed={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
          >
            grid
          </button>
          <span className={styles.mobileViewDivider} aria-hidden="true">
            /
          </span>
          <button
            type="button"
            className={`${styles.mobileViewButton} ${
              viewMode === "list" ? styles.mobileViewButtonActive : ""
            }`}
            aria-pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
          >
            list
          </button>
        </div>
        {viewMode === "grid" ? (
          <div
            className={styles.gridCursorArea}
            onMouseEnter={handleGridCursorAreaMouseEnter}
            onMouseMove={handleGridCursorAreaMouseMove}
            onMouseLeave={handleGridCursorAreaMouseLeave}
          >
            <ResponsiveMasonry
              columnsCountBreakPoints={{
                0: 2,
                600: 2,
                900: 3,
                1200: 4,
              }}
            >
              <Masonry gutter="12px">
                {sortedPhotos.map((photo) => renderMedia(photo))}
              </Masonry>
            </ResponsiveMasonry>
          </div>
        ) : (
          <div className={styles.listContainer}>
            <ul className={styles.listView}>
              {sortedPhotos.map((photo) => renderListItem(photo))}
            </ul>
          </div>
        )}
      </main>
      <div
        ref={viewCursorRef}
        className={`${styles.viewCursor} ${
          isViewCursorVisible ? styles.viewCursorVisible : ""
        }`}
        aria-hidden="true"
      >
        view
      </div>
    </NavMenu>
  );
}
