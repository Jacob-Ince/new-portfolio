"use client";

import { useEffect, useState } from "react";
import NavMenu from "../components/NavMenu";
import styles from "./page.module.css";
import { getAllWorkCards } from "../../lib/sanity";

const fallbackCards = [
  {
    _id: "fallback-01",
    title: "placeholder project one",
    categories: ["brand", "digital"],
  },
  {
    _id: "fallback-02",
    title: "placeholder project two",
    categories: ["campaign", "strategy"],
  },
  {
    _id: "fallback-03",
    title: "placeholder project three",
    categories: ["web", "experience"],
  },
  {
    _id: "fallback-04",
    title: "placeholder project four",
    categories: ["content", "motion"],
  },
];

export default function WorkPage() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    async function fetchCards() {
      const data = await getAllWorkCards();
      setCards(Array.isArray(data) ? data : []);
    }

    fetchCards();
  }, []);

  const cardsToRender = cards.length > 0 ? cards : fallbackCards;
  const isVideoMimeType = (mimeType) =>
    typeof mimeType === "string" && mimeType.toLowerCase().startsWith("video/");

  return (
    <NavMenu>
      <main className={styles.workMain}>
        <div className={styles.workContainer}>
          <h1 className={styles.workTitle}>Work</h1>
          <p className={styles.workCopy}>
            Selected projects and the stories behind them.
          </p>
          <section className={styles.cardsGrid} aria-label="Work cards">
            {cardsToRender.map((card) => (
              <article key={card._id} className={styles.card}>
                <div className={styles.cardMedia}>
                  {card.mediaUrl ? (
                    isVideoMimeType(card.mediaMimeType) ? (
                      <video
                        src={card.mediaUrl}
                        className={styles.cardMediaAsset}
                        muted
                        playsInline
                        autoPlay
                        loop
                      />
                    ) : (
                      <img
                        src={card.mediaUrl}
                        alt={card.mediaAlt || card.title || "Work card media"}
                        className={styles.cardMediaAsset}
                        loading="lazy"
                      />
                    )
                  ) : null}
                </div>
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
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </NavMenu>
  );
}
