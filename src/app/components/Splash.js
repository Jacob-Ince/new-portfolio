"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Splash.module.css";

const WORDMARK = "jac.ob";
const WORDMARK_CHARS = WORDMARK.split("");
const FADE_STEP_DURATION = 170;
const CONVERGE_DELAY = 260;
const CONVERGE_DURATION = 700;
const FINAL_HOLD_DURATION = 280;
const EXIT_DURATION = 450;
const EDGE_PADDING = 48;

export default function Splash({
  isVisible,
  isReadyToReveal = false,
  onRevealComplete,
}) {
  const [characterPoints, setCharacterPoints] = useState([]);
  const [targetPoints, setTargetPoints] = useState([]);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isConverging, setIsConverging] = useState(false);
  const [hasConverged, setHasConverged] = useState(false);
  const overlayRef = useRef(null);
  const targetCharRefs = useRef([]);
  const animationTimersRef = useRef([]);

  useEffect(() => {
    if (!isVisible) return undefined;

    const clearAnimationTimers = () => {
      animationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      animationTimersRef.current = [];
    };

    clearAnimationTimers();
    setIsAnimatingIn(false);
    setIsConverging(false);
    setHasConverged(false);

    const randomPoints = WORDMARK_CHARS.map(() => ({
      x:
        EDGE_PADDING +
        Math.random() * Math.max(1, window.innerWidth - EDGE_PADDING * 2),
      y:
        EDGE_PADDING +
        Math.random() * Math.max(1, window.innerHeight - EDGE_PADDING * 2),
    }));
    setCharacterPoints(randomPoints);

    const startFadeInTimer = setTimeout(() => {
      setIsAnimatingIn(true);
    }, 20);
    animationTimersRef.current.push(startFadeInTimer);

    const measureTargetPoints = () => {
      const nextTargets = targetCharRefs.current.map((node) => {
        if (!node) return null;
        const rect = node.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });
      if (nextTargets.every(Boolean)) {
        setTargetPoints(nextTargets);
      }
    };

    const rafId = window.requestAnimationFrame(measureTargetPoints);

    const convergeTimer = setTimeout(
      () => {
        setIsConverging(true);
        const completeTimer = setTimeout(() => {
          setHasConverged(true);
        }, CONVERGE_DURATION);
        animationTimersRef.current.push(completeTimer);
      },
      WORDMARK_CHARS.length * FADE_STEP_DURATION + CONVERGE_DELAY,
    );
    animationTimersRef.current.push(convergeTimer);

    return () => {
      window.cancelAnimationFrame(rafId);
      clearAnimationTimers();
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !isReadyToReveal || !hasConverged) return undefined;
    let isCancelled = false;
    let exitAnimation = null;
    const holdTimer = setTimeout(async () => {
      const overlay = overlayRef.current;
      if (!overlay) {
        onRevealComplete?.();
        return;
      }

      exitAnimation = overlay.animate(
        [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
        {
          duration: EXIT_DURATION,
          easing: "cubic-bezier(0.7, 0, 0.3, 1)",
          fill: "forwards",
        },
      );

      await exitAnimation.finished.catch(() => undefined);
      if (!isCancelled) {
        onRevealComplete?.();
      }
    }, FINAL_HOLD_DURATION);

    return () => {
      isCancelled = true;
      clearTimeout(holdTimer);
      if (exitAnimation) {
        exitAnimation.cancel();
      }
    };
  }, [hasConverged, isReadyToReveal, isVisible, onRevealComplete]);

  if (!isVisible) return null;

  return (
    <div ref={overlayRef} className={styles.overlay} translate="no">
      <p className={styles.targetWord} aria-hidden="true">
        {WORDMARK_CHARS.map((char, index) => (
          <span
            key={`target-${index}`}
            ref={(node) => {
              targetCharRefs.current[index] = node;
            }}
            className={styles.targetChar}
          >
            {char}
          </span>
        ))}
      </p>

      <div className={styles.charLayer} lang="en" translate="no">
        {WORDMARK_CHARS.map((char, index) => {
          const fromPoint = characterPoints[index] ?? targetPoints[index];
          const toPoint = targetPoints[index] ?? fromPoint;
          if (!fromPoint || !toPoint) return null;

          return (
            <span
              key={`char-${index}`}
              className={`${styles.char} ${
                isAnimatingIn ? styles.charVisible : ""
              } ${isConverging ? styles.charConverging : ""}`}
              style={{
                "--from-x": `${fromPoint.x}px`,
                "--from-y": `${fromPoint.y}px`,
                "--to-x": `${toPoint.x}px`,
                "--to-y": `${toPoint.y}px`,
                "--fade-delay": `${index * FADE_STEP_DURATION}ms`,
                transitionDuration: `${CONVERGE_DURATION}ms, 220ms`,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
}
