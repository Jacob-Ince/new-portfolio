"use client";

import Image from "next/image";
import styles from "./page.module.css";
import photosData from "./media-list.json";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useEffect, useState, useRef } from "react";
import NavMenu from "./components/NavMenu";
import PageTransition from "./components/PageTransition";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loadedItems, setLoadedItems] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const videoRefs = useRef({});

  // Initial setup effect
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    setMounted(true);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Setup intersection observer for videos
  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.dataset.videoId;
          const video = videoRefs.current[videoId];

          if (video) {
            if (entry.isIntersecting) {
              video.play().catch(() => {
                // Handle autoplay failure silently
              });
            } else {
              video.pause();
            }
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.1,
      }
    );

    // Observe all video elements
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        observer.observe(video);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [mounted]);

  // Don't render anything until after hydration
  if (!mounted) {
    return null;
  }

  const handleLoad = (id) => {
    setLoadedItems((prev) => new Set([...prev, id]));
  };

  const renderMedia = (photo) => {
    const isLoaded = loadedItems.has(photo.id);

    if (photo.type === "video") {
      return (
        <div
          className={styles.gridItem}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <div className={styles.mediaWrapper}>
            <video
              ref={(el) => {
                if (el) {
                  videoRefs.current[photo.id] = el;
                }
              }}
              data-video-id={photo.id}
              muted
              playsInline
              loop
              preload="none"
              onLoadedData={() => handleLoad(photo.id)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: isLoaded ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
              }}
            >
              <source src={photo.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {!isLoaded && (
              <div className={styles.loadingPlaceholder}>
                <div className={styles.loadingSpinner} />
              </div>
            )}
          </div>
          <p className={styles.mediaText}>{photo.title}</p>
        </div>
      );
    }

    return (
      <div
        className={styles.gridItem}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <div className={styles.mediaWrapper}>
          <Image
            src={photo.src}
            alt={photo.alt || "Image"}
            width={photo.width}
            height={photo.height}
            onLoad={() => handleLoad(photo.id)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
            loading={photo.id <= 4 ? undefined : "lazy"}
            quality={isMobile ? 50 : 75}
            priority={photo.id <= 4} // Prioritize loading first 4 items
            sizes={
              isMobile
                ? "(max-width: 350px) 100vw, (max-width: 600px) 100vw"
                : "(max-width: 350px) 100vw, (max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
            }
          />
          {!isLoaded && (
            <div className={styles.loadingPlaceholder}>
              <div className={styles.loadingSpinner} />
            </div>
          )}
        </div>
        <p className={styles.mediaText}>{photo.title}</p>
      </div>
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

  // Sort photos by id
  const sortedPhotos = [...photosData]
    .filter((photo) => !photo.src.includes("portrait-layers"))
    .sort((a, b) => a.id - b.id);

  return (
    <NavMenu>
      <PageTransition>
        <main className={styles.main}>
          <ResponsiveMasonry
            columnsCountBreakPoints={{
              350: 1,
              600: 2,
              900: 3,
              1200: 4,
            }}
          >
            <Masonry gutter="12px">
              {sortedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`${styles.gridItemWrapper} ${getSizeClass(photo)}`}
                >
                  {renderMedia(photo)}
                </div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
        </main>

        <footer className={styles.footer}></footer>
      </PageTransition>
    </NavMenu>
  );
}
