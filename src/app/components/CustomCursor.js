"use client";

import { useEffect, useState } from "react";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateCursorState = (e) => {
      const target = e.target;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
          target.tagName === "A" ||
          target.tagName === "BUTTON"
      );
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", updateCursorState);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", updateCursorState);
    };
  }, []);

  return (
    <>
      <div
        className={`${styles.cursor} ${isPointer ? styles.pointer : ""}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <div
        className={`${styles.cursorFollower} ${
          isPointer ? styles.pointer : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
}
