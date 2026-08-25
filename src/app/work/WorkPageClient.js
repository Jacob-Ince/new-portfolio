"use client";

import { useEffect, useState } from "react";
import NavMenu from "../components/NavMenu";
import styles from "./page.module.css";

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
                      <video
                        src={cardMediaUrl}
                        className={styles.cardMediaAsset}
                        muted
                        playsInline
                        autoPlay
                        loop
                        preload="metadata"
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
