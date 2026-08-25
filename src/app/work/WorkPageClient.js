"use client";

import { useEffect, useState } from "react";
import NavMenu from "../components/NavMenu";
import styles from "./page.module.css";

function getVideoMimeType(src) {
  if (!src) return undefined;
  const ext = src.split(".").pop()?.toLowerCase();
  if (!ext) return undefined;
  if (ext === "mp4") return "video/mp4";
  if (ext === "m4v") return "video/x-m4v";
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return undefined;
}

function DeferredAutoplayVideo({ id, src, className }) {
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const container = document.querySelector(`[data-work-video-id="${id}"]`);
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = Boolean(entry?.isIntersecting);
        if (isIntersecting) setIsNearViewport(true);
        setIsInViewport(isIntersecting);
      },
      {
        rootMargin: "320px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [id]);

  useEffect(() => {
    const video = document.querySelector(
      `[data-work-video-el="${id}"]`,
    );
    if (!video) return;

    if (!isInViewport) {
      video.pause();
      return;
    }

    if (!isNearViewport) return;

    if (video.readyState >= 2) {
      video.play().catch(() => {});
    }
  }, [id, isInViewport, isNearViewport]);

  const mimeType = getVideoMimeType(src);

  return (
    <div data-work-video-id={id} className={className}>
      <video
        data-work-video-el={id}
        className={className}
        muted
        playsInline
        autoPlay
        loop
        preload={isNearViewport ? "metadata" : "none"}
        onCanPlay={(event) => {
          if (isInViewport) {
            event.currentTarget.play().catch(() => {});
          }
        }}
        src={isNearViewport ? src : undefined}
      >
        {isNearViewport ? <source src={src} type={mimeType} /> : null}
      </video>
    </div>
  );
}

export default function WorkPageClient({ initialCards = [] }) {
  const [cards] = useState(Array.isArray(initialCards) ? initialCards : []);
  const [hasEntered, setHasEntered] = useState(false);
  const workTitleWords = ["Selected", "Work"];

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setHasEntered(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const cardsToRender = cards;
  const footerAnimationDelayMs =
    950 + Math.max(cardsToRender.length - 1, 0) * 120 + 550 + 140;
  const isVideoMimeType = (mimeType) =>
    typeof mimeType === "string" && mimeType.toLowerCase().startsWith("video/");
  const hasExternalUrl = (url) =>
    typeof url === "string" && /^https?:\/\//i.test(url.trim());
  const getCreditValue = (value) =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

  return (
    <NavMenu
      footerClassName={hasEntered ? styles.footerEnter : ""}
      footerStyle={
        hasEntered
          ? { "--work-footer-delay": `${footerAnimationDelayMs}ms` }
          : undefined
      }
    >
      <main className={styles.workMain}>
        <div className={styles.workContainer}>
          <h1
            className={`${styles.workTitle} ${hasEntered ? styles.workTitleEnter : ""}`}
          >
            {workTitleWords.map((word, index) => (
              <span
                key={word}
                className={styles.workTitleWord}
                style={{ "--word-index": index }}
              >
                {word}
              </span>
            ))}
          </h1>
          {/* <p className={styles.workCopy}>
            Selected projects and the stories behind them.
          </p> */}
          <section className={styles.cardsGrid} aria-label="Work cards">
            {cardsToRender.map((card, index) => {
              const designStudio = getCreditValue(card.designStudio);
              const builtAtStudio = getCreditValue(card.builtAtStudio);
              const designStudioUrl = hasExternalUrl(card.designStudioUrl)
                ? card.designStudioUrl.trim()
                : null;
              const builtAtStudioUrl = hasExternalUrl(card.builtAtStudioUrl)
                ? card.builtAtStudioUrl.trim()
                : null;
              const cardMediaUrl = card.tileMediaUrl || card.mediaUrl;
              const mediaContent = (
                <div className={styles.cardMedia}>
                  {cardMediaUrl ? (
                    isVideoMimeType(card.mediaMimeType) ? (
                      <DeferredAutoplayVideo
                        id={card._id}
                        src={cardMediaUrl}
                        className={styles.cardMediaAsset}
                      />
                    ) : (
                      <img
                        src={cardMediaUrl}
                        alt={card.mediaAlt || card.title || "Work card media"}
                        className={styles.cardMediaAsset}
                        loading="lazy"
                      />
                    )
                  ) : null}
                  <span className={styles.cardViewBadge} aria-hidden="true">
                    view
                  </span>
                </div>
              );

              return (
                <article
                  key={card._id}
                  className={`${styles.card} ${hasEntered ? styles.cardEnter : ""}`}
                  style={{ "--card-index": index }}
                >
                  {hasExternalUrl(card.url) ? (
                    <a
                      href={card.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.cardMediaLink}
                      aria-label={`Open ${card.title || "project"}`}
                    >
                      {mediaContent}
                    </a>
                  ) : (
                    mediaContent
                  )}
                  <div className={styles.cardContent}>
                    <div className={styles.cardCategoryList}>
                      {(Array.isArray(card.categories) ? card.categories : [])
                        .filter(Boolean)
                        .map((category) => (
                          <span
                            key={`${card._id}-${category}`}
                            className={styles.cardCategory}
                          >
                            {category}
                          </span>
                        ))}
                    </div>
                    <h2 className={styles.cardTitle}>{card.title}</h2>
                    {designStudio || builtAtStudio ? (
                      <p className={styles.cardCredit}>
                        {designStudio ? (
                          <span className={styles.cardCreditStudio}>
                            Design by{" "}
                            {designStudioUrl ? (
                              <a
                                href={designStudioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.cardCreditLink}
                              >
                                {designStudio}
                              </a>
                            ) : (
                              designStudio
                            )}
                          </span>
                        ) : null}
                        {builtAtStudio ? (
                          <span className={styles.cardCreditBuiltAt}>
                            Built at{" "}
                            {builtAtStudioUrl ? (
                              <a
                                href={builtAtStudioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.cardCreditLink}
                              >
                                {builtAtStudio}
                              </a>
                            ) : (
                              builtAtStudio
                            )}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </main>
    </NavMenu>
  );
}
