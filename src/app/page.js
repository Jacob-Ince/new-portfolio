"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import NavMenu from "./components/NavMenu";
import Splash from "./components/Splash";
import Link from "next/link";
import fallbackMediaList from "./media-list.json";
import { transformSanityMedia } from "../lib/sanity";

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
  const initialPhotosData = useMemo(
    () =>
      (Array.isArray(fallbackMediaList) ? fallbackMediaList : [])
        .map(transformSanityMedia)
        .filter(Boolean),
    [],
  );
  const searchParams = useSearchParams();
  const urlViewMode = searchParams.get("view");
  const initialViewMode = urlViewMode === "list" ? "list" : "grid";
  const [mounted, setMounted] = useState(false);
  const [loadedItems, setLoadedItems] = useState(new Set());
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashReadyToReveal, setIsSplashReadyToReveal] = useState(false);
  const [hasSplashMinimumElapsed, setHasSplashMinimumElapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [photosData] = useState(initialPhotosData);
  const [loading] = useState(false);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [viewTransition, setViewTransition] = useState(null);
  const [isInitialListEntryPending, setIsInitialListEntryPending] = useState(
    urlViewMode === "list",
  );
  const [hoveredListPhoto, setHoveredListPhoto] = useState(null);
  const [listHoverDimensions, setListHoverDimensions] = useState({
    width: 290,
    height: 218,
  });
  const videoRefs = useRef({});
  const observerRef = useRef(null);
  const listHoverPreviewRef = useRef(null);
  const listHoverTargetPosRef = useRef({ x: 0, y: 0 });
  const listHoverCurrentPosRef = useRef({ x: 0, y: 0 });
  const listHoverRafRef = useRef(null);
  const preloadedPreviewSrcsRef = useRef(new Set());
  const viewTransitionResetTimerRef = useRef(null);
  const handledUrlViewModeRef = useRef(null);

  useEffect(() => {
    if (urlViewMode !== "list" && urlViewMode !== "grid") return;
    const NAVBAR_ENTER_DELAY_MS = 220;
    const NAVBAR_ENTER_DURATION_MS = 450;
    const LIST_STAGGER_START_DELAY_MS =
      NAVBAR_ENTER_DELAY_MS + NAVBAR_ENTER_DURATION_MS;
    let listStaggerDelayTimeoutId = null;
    let transitionIdleHandler = null;
    const cleanup = () => {
      if (listStaggerDelayTimeoutId) {
        window.clearTimeout(listStaggerDelayTimeoutId);
        listStaggerDelayTimeoutId = null;
      }
      if (transitionIdleHandler) {
        window.removeEventListener(
          "page-transition-idle",
          transitionIdleHandler,
        );
        transitionIdleHandler = null;
      }
    };

    const triggerViewTransition = (nextTransition) => {
      setViewTransition(nextTransition);

      if (viewTransitionResetTimerRef.current) {
        clearTimeout(viewTransitionResetTimerRef.current);
      }

      viewTransitionResetTimerRef.current = setTimeout(() => {
        setViewTransition(null);
        viewTransitionResetTimerRef.current = null;
      }, 1400);
    };

    const runAfterRouteReveal = (callback) => {
      if (document.documentElement.dataset.pageTransition === "active") {
        transitionIdleHandler = () => {
          callback();
        };

        window.addEventListener("page-transition-idle", transitionIdleHandler, {
          once: true,
        });
        return;
      }

      callback();
    };

    if (handledUrlViewModeRef.current === null && urlViewMode === "list") {
      setIsInitialListEntryPending(true);
      runAfterRouteReveal(() => {
        listStaggerDelayTimeoutId = window.setTimeout(() => {
          if (handledUrlViewModeRef.current === "list") return;
          setIsInitialListEntryPending(false);
          handledUrlViewModeRef.current = "list";
          triggerViewTransition("toList");
          listStaggerDelayTimeoutId = null;
        }, LIST_STAGGER_START_DELAY_MS);
      });
      return cleanup;
    }

    if (handledUrlViewModeRef.current === null) {
      handledUrlViewModeRef.current = urlViewMode;
      setIsInitialListEntryPending(false);
      return cleanup;
    }

    if (handledUrlViewModeRef.current === urlViewMode) return cleanup;

    const applyViewModeFromUrl = () => {
      handledUrlViewModeRef.current = urlViewMode;
      setIsInitialListEntryPending(false);
      const nextTransition = urlViewMode === "list" ? "toList" : "toGrid";
      triggerViewTransition(nextTransition);

      setViewMode((currentViewMode) => {
        if (currentViewMode === urlViewMode) return currentViewMode;
        return urlViewMode;
      });
    };

    runAfterRouteReveal(() => {
      applyViewModeFromUrl();
    });

    return cleanup;
  }, [urlViewMode, viewMode]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    setMounted(true);

    if (sessionStorage.getItem("splashSeen")) {
      setIsSplashVisible(false);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

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

            if (video.preload === "metadata") {
              video.preload = "auto";
            }

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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        Object.values(videoRefs.current).forEach((video) => {
          if (video && !video.paused) {
            video.pause();
          }
        });
        return;
      }

      Object.values(videoRefs.current).forEach((video) => {
        if (!video) return;

        const rect = video.getBoundingClientRect();
        const isInViewport =
          rect.bottom > 0 &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth;

        if (!isInViewport) return;

        if (video.readyState >= 2) {
          video.play().catch((error) => {
            console.warn("Failed to resume video after tab focus:", error);
          });
        }
      });
    };

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

  const handleLoad = useCallback((id) => {
    setLoadedItems((prev) => {
      if (prev.has(id)) return prev;
      return new Set([...prev, id]);
    });
  }, []);

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

  const getListPreviewImageSrc = useCallback((src) => {
    if (typeof src !== "string" || src.length === 0) return "";
    if (!src.includes("cdn.sanity.io/images/")) return src;
    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}w=480&fit=max&auto=format&q=60`;
  }, []);

  const handleSplashRevealComplete = useCallback(() => {
    sessionStorage.setItem("splashSeen", "1");
    setIsSplashVisible(false);
  }, []);

  const applyListHoverPreviewPosition = useCallback((x, y) => {
    if (!listHoverPreviewRef.current) return;
    listHoverPreviewRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  const animateListHoverPreview = useCallback(() => {
    const smoothing = 0.2;
    const target = listHoverTargetPosRef.current;
    const current = listHoverCurrentPosRef.current;

    current.x += (target.x - current.x) * smoothing;
    current.y += (target.y - current.y) * smoothing;

    applyListHoverPreviewPosition(current.x, current.y);

    const dx = Math.abs(target.x - current.x);
    const dy = Math.abs(target.y - current.y);

    if (dx < 0.2 && dy < 0.2) {
      listHoverRafRef.current = null;
      return;
    }

    listHoverRafRef.current = requestAnimationFrame(animateListHoverPreview);
  }, [applyListHoverPreviewPosition]);

  const updateListHoverPosition = useCallback(
    (event) => {
      listHoverTargetPosRef.current = {
        x: event.clientX + 24,
        y: event.clientY + 24,
      };

      if (!listHoverRafRef.current) {
        listHoverRafRef.current = requestAnimationFrame(
          animateListHoverPreview,
        );
      }
    },
    [animateListHoverPreview],
  );

  const getPreviewDimensionsForPhoto = useCallback((photo) => {
    const parsedWidth = Number(photo?.width);
    const parsedHeight = Number(photo?.height);
    const hasValidDimensions =
      Number.isFinite(parsedWidth) &&
      parsedWidth > 0 &&
      Number.isFinite(parsedHeight) &&
      parsedHeight > 0;
    const aspectRatio = hasValidDimensions ? parsedWidth / parsedHeight : 4 / 3;

    const widthCap = Math.max(
      200,
      Math.min(360, Math.round(window.innerWidth * 0.28)),
    );
    const heightCap = Math.max(
      180,
      Math.min(460, Math.round(window.innerHeight * 0.66)),
    );

    let nextWidth = widthCap;
    let nextHeight = nextWidth / aspectRatio;

    if (nextHeight > heightCap) {
      nextHeight = heightCap;
      nextWidth = nextHeight * aspectRatio;
    }

    return {
      width: nextWidth,
      height: nextHeight,
    };
  }, []);

  const handleListItemMouseEnter = useCallback(
    (photo, event) => {
      setHoveredListPhoto(photo);
      setListHoverDimensions(getPreviewDimensionsForPhoto(photo));
      const nextPosition = {
        x: event.clientX + 24,
        y: event.clientY + 24,
      };
      listHoverTargetPosRef.current = nextPosition;
      listHoverCurrentPosRef.current = nextPosition;
      applyListHoverPreviewPosition(nextPosition.x, nextPosition.y);
      updateListHoverPosition(event);
    },
    [
      applyListHoverPreviewPosition,
      getPreviewDimensionsForPhoto,
      updateListHoverPosition,
    ],
  );

  const handleListItemMouseMove = useCallback(
    (event) => {
      if (!hoveredListPhoto) return;
      updateListHoverPosition(event);
    },
    [hoveredListPhoto, updateListHoverPosition],
  );

  const handleListItemMouseLeave = useCallback(() => {
    setHoveredListPhoto(null);
    if (listHoverRafRef.current) {
      cancelAnimationFrame(listHoverRafRef.current);
      listHoverRafRef.current = null;
    }
  }, []);

  const handleViewModeChange = useCallback((nextViewMode) => {
    setViewMode((currentViewMode) => {
      if (currentViewMode === nextViewMode) return currentViewMode;

      const nextTransition = nextViewMode === "list" ? "toList" : "toGrid";
      setViewTransition(nextTransition);

      if (viewTransitionResetTimerRef.current) {
        clearTimeout(viewTransitionResetTimerRef.current);
      }

      viewTransitionResetTimerRef.current = setTimeout(() => {
        setViewTransition(null);
        viewTransitionResetTimerRef.current = null;
      }, 1400);

      return nextViewMode;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (viewTransitionResetTimerRef.current) {
        clearTimeout(viewTransitionResetTimerRef.current);
      }
      if (listHoverRafRef.current) {
        cancelAnimationFrame(listHoverRafRef.current);
      }
    };
  }, []);

  const renderMedia = useCallback(
    (photo, index, shouldPrioritizeForSplash) => {
      if (!photo?.src) return null;
      const projectTypes = Array.isArray(photo.projectTypes)
        ? photo.projectTypes.map(normalizeProjectType).filter(Boolean)
        : [];
      const displayName = photo.displayName || photo.name;
      const mediaSrc = photo.tileSrc || photo.src;
      const videoType =
        photo.type === "video" ? getVideoMimeType(mediaSrc) : undefined;

      return (
        <Link
          href={`/project/${encodeURIComponent(photo.name)}`}
          key={photo.id}
          className={styles.gridLink}
        >
          <div
            className={`${styles.gridItem} ${
              photo.invertColor ? styles.gridItemInverted : ""
            } ${viewTransition === "toGrid" ? styles.gridItemStaggerIn : ""}`}
            style={{
              "--stagger-index": index,
            }}
            data-photo-id={photo.id}
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
                  preload="metadata"
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
                  <source src={mediaSrc} type={videoType} />
                  Your browser does not support the video tag.
                </video>
                <span className={styles.mediaViewBadge} aria-hidden="true">
                  view
                </span>
              </div>
            ) : (
              <div className={styles.mediaWrapper}>
                <Image
                  src={mediaSrc}
                  alt={photo.alt || "Image"}
                  width={photo.width}
                  height={photo.height}
                  onLoad={() => {
                    handleLoad(photo.id);
                  }}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    filter: photo.invertColor ? "invert(1)" : "none",
                  }}
                  loading={shouldPrioritizeForSplash ? "eager" : "lazy"}
                  quality={isMobile ? 50 : 75}
                  priority={shouldPrioritizeForSplash}
                  sizes={
                    isMobile
                      ? "(max-width: 350px) 100vw, (max-width: 600px) 100vw"
                      : "(max-width: 350px) 100vw, (max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  }
                />
                <span className={styles.mediaViewBadge} aria-hidden="true">
                  view
                </span>
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
    },
    [handleLoad, isMobile, observeVideo, playVideo, viewTransition],
  );

  const applyLoadedStateToGridItems = useCallback(() => {
    if (viewMode !== "grid") return;

    loadedItems.forEach((id) => {
      const el = document.querySelector(`[data-photo-id="${id}"]`);
      if (el) el.dataset.loaded = "true";
    });
  }, [loadedItems, viewMode]);

  useEffect(() => {
    applyLoadedStateToGridItems();
  }, [applyLoadedStateToGridItems, photosData.length]);

  useEffect(() => {
    if (viewMode !== "grid") return;

    let frame1 = null;
    let frame2 = null;

    const reapplyAfterLayout = () => {
      if (frame1) cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);

      frame1 = requestAnimationFrame(() => {
        applyLoadedStateToGridItems();
        frame2 = requestAnimationFrame(() => {
          applyLoadedStateToGridItems();
        });
      });
    };

    window.addEventListener("resize", reapplyAfterLayout, { passive: true });

    return () => {
      window.removeEventListener("resize", reapplyAfterLayout);
      if (frame1) cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, [applyLoadedStateToGridItems, viewMode]);

  const renderListItem = (photo, index) => {
    if (!photo?.src) return null;
    const projectTypes = Array.isArray(photo.projectTypes)
      ? photo.projectTypes.map(normalizeProjectType).filter(Boolean)
      : [];
    const displayName = photo.displayName || photo.name;

    return (
      <li key={photo.id} className={styles.listItem}>
        <Link
          href={`/project/${encodeURIComponent(photo.name)}`}
          className={`${styles.listLink} ${
            viewTransition === "toList" ? styles.listLinkStaggerIn : ""
          } ${isInitialListEntryPending ? styles.listLinkInitialHidden : ""}`}
          onMouseEnter={(event) => handleListItemMouseEnter(photo, event)}
          onMouseMove={handleListItemMouseMove}
          onMouseLeave={handleListItemMouseLeave}
          style={{
            "--stagger-index": index,
          }}
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
  const sortedPhotos = useMemo(
    () =>
      [...photosData]
        .filter((photo) => photo?.src)
        .sort((a, b) => {
          const orderA = a.orderRank || a.id || "a0";
          const orderB = b.orderRank || b.id || "a0";
          return orderA.localeCompare(orderB);
        }),
    [photosData],
  );

  useEffect(() => {
    if (!mounted || isMobile || sortedPhotos.length === 0) return;
    const warmupCandidates = sortedPhotos.slice(0, 4);

    warmupCandidates.forEach((photo) => {
      const previewSrc = photo.tileSrc || photo.src;
      if (!previewSrc) return;
      if (preloadedPreviewSrcsRef.current.has(previewSrc)) return;
      preloadedPreviewSrcsRef.current.add(previewSrc);

      if (photo.type === "image") {
        const image = new window.Image();
        image.decoding = "async";
        image.src = getListPreviewImageSrc(previewSrc);
      }
    });
  }, [getListPreviewImageSrc, isMobile, mounted, sortedPhotos]);

  const splashBatchSize = isMobile ? 6 : 10;
  const splashTargetCount = loading
    ? 0
    : Math.min(splashBatchSize, sortedPhotos.length);

  const masonryItems = useMemo(
    () =>
      sortedPhotos.map((photo, index) =>
        renderMedia(photo, index, index < splashTargetCount),
      ),
    [renderMedia, sortedPhotos, splashTargetCount],
  );

  const splashTargetIds = sortedPhotos
    .slice(0, splashTargetCount)
    .map((photo) => photo.id);
  const loadedSplashTargetCount = splashTargetIds.reduce(
    (count, id) => count + (loadedItems.has(id) ? 1 : 0),
    0,
  );
  const hasLoadedSplashTarget =
    splashTargetCount === 0 || loadedSplashTargetCount >= splashTargetCount;

  useEffect(() => {
    const minimumSplashTimer = setTimeout(() => {
      setHasSplashMinimumElapsed(true);
    }, 700);

    return () => {
      clearTimeout(minimumSplashTimer);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !hasSplashMinimumElapsed || loading || !isSplashVisible) {
      return;
    }

    if (hasLoadedSplashTarget) {
      setIsSplashReadyToReveal(true);
      return;
    }

    const fallbackTimer = setTimeout(() => {
      setIsSplashReadyToReveal(true);
    }, 6000);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [
    hasLoadedSplashTarget,
    hasSplashMinimumElapsed,
    isSplashVisible,
    loading,
    mounted,
  ]);

  if (!mounted) {
    return <Splash isVisible isReadyToReveal={false} />;
  }

  return (
    <NavMenu
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      hideFooter={loading}
    >
      <main className={styles.main}>
        <div
          className={styles.mobileViewToggle}
          role="group"
          aria-label="View mode"
        >
          <button
            type="button"
            className={`${styles.mobileViewButton} ${styles.mobileGridButton} ${
              viewMode === "grid" ? styles.mobileViewButtonActive : ""
            }`}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
            onClick={() => handleViewModeChange("grid")}
          />
          <button
            type="button"
            className={`${styles.mobileViewButton} ${styles.mobileListButton} ${
              viewMode === "list" ? styles.mobileViewButtonActive : ""
            }`}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
            onClick={() => handleViewModeChange("list")}
          />
        </div>
        {viewMode === "grid" ? (
          <div className={styles.gridCursorArea}>
            <ResponsiveMasonry
              columnsCountBreakPoints={{
                0: 2,
                600: 2,
                900: 3,
                1200: 4,
              }}
            >
              <Masonry gutter="12px" sequential>
                {masonryItems}
              </Masonry>
            </ResponsiveMasonry>
          </div>
        ) : (
          <div className={styles.listContainer}>
            <ul className={styles.listView}>
              {sortedPhotos.map((photo, index) => renderListItem(photo, index))}
            </ul>
            <div
              ref={listHoverPreviewRef}
              className={`${styles.listHoverPreview} ${
                hoveredListPhoto ? styles.listHoverPreviewVisible : ""
              }`}
              style={{
                width: `${listHoverDimensions.width}px`,
                height: `${listHoverDimensions.height}px`,
              }}
              aria-hidden="true"
            >
              {hoveredListPhoto?.type === "video" ? (
                <video
                  key={hoveredListPhoto.id}
                  src={hoveredListPhoto.tileSrc || hoveredListPhoto.src}
                  className={styles.listHoverPreviewMedia}
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="none"
                />
              ) : hoveredListPhoto?.src ? (
                <img
                  src={getListPreviewImageSrc(
                    hoveredListPhoto.tileSrc || hoveredListPhoto.src,
                  )}
                  alt={hoveredListPhoto.alt || hoveredListPhoto.name || ""}
                  className={styles.listHoverPreviewMedia}
                  loading="eager"
                  decoding="async"
                />
              ) : null}
            </div>
          </div>
        )}
      </main>
      <Splash
        isVisible={isSplashVisible}
        isReadyToReveal={isSplashReadyToReveal}
        onRevealComplete={handleSplashRevealComplete}
      />
    </NavMenu>
  );
}
