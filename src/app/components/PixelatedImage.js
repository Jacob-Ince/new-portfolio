"use client";

import { useEffect, useRef } from "react";

const MAX_CANVAS_SIDE = 2000;
const DEFAULT_BOX_SIZE = 100;

function clamp(min, value, max) {
  return Math.max(min, Math.min(value, max));
}

export default function PixelatedImage({ src, alt, className }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const boxesRef = useRef([]);
  const pointerRef = useRef({
    x: MAX_CANVAS_SIDE / 2,
    y: MAX_CANVAS_SIDE / 2,
    x2: MAX_CANVAS_SIDE / 2,
    y2: MAX_CANVAS_SIDE / 2,
    s: 1.5,
  });
  const scaleRef = useRef({ x: 1, y: 1 });
  const rectRef = useRef(null);
  const sizeRef = useRef({
    width: MAX_CANVAS_SIDE,
    height: MAX_CANVAS_SIDE,
    maxDim: MAX_CANVAS_SIDE,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isDisposed = false;
    const image = new window.Image();
    const sourceCanvas = document.createElement("canvas");
    const sourceCtx = sourceCanvas.getContext("2d");

    function rebuildGrid() {
      const boxes = [];
      const { width, height } = sizeRef.current;
      for (let x = 0; x < width; x += DEFAULT_BOX_SIZE) {
        for (let y = 0; y < height; y += DEFAULT_BOX_SIZE) {
          boxes.push({ x, y, d: 0, s: 0 });
        }
      }
      boxesRef.current = boxes;
    }

    function updateCanvasMetrics() {
      const nextRect = canvas.getBoundingClientRect();
      rectRef.current = nextRect;
      const { width, height } = sizeRef.current;
      scaleRef.current = {
        x: width / Math.max(nextRect.width, 1),
        y: height / Math.max(nextRect.height, 1),
      };
    }

    function draw() {
      if (isDisposed) return;
      const { width, height, maxDim } = sizeRef.current;

      const pointer = pointerRef.current;
      pointer.x += (pointer.x2 - pointer.x) * 0.08;
      pointer.y += (pointer.y2 - pointer.y) * 0.08;

      const delta = Math.hypot(pointer.x - pointer.x2, pointer.y - pointer.y2);
      const targetS = (delta / maxDim) * 2;
      pointer.s += (targetS - pointer.s) * 0.05;

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.drawImage(sourceCanvas, 0, 0, width, height);

      for (const box of boxesRef.current) {
        box.d = Math.hypot(box.x - pointer.x, box.y - pointer.y);
        box.s = 1 - clamp(0, box.d / maxDim / Math.max(pointer.s, 0.001), 1);

        if (box.s < 0.001) continue;

        const boxScaled = DEFAULT_BOX_SIZE * box.s;
        const sourceX = box.x + boxScaled / 2;
        const sourceY = box.y + boxScaled / 2;
        const sourceSize = DEFAULT_BOX_SIZE - boxScaled;

        ctx.drawImage(
          sourceCanvas,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          box.x,
          box.y,
          DEFAULT_BOX_SIZE,
          DEFAULT_BOX_SIZE,
        );
      }

      frameRef.current = window.requestAnimationFrame(draw);
    }

    image.onload = () => {
      if (isDisposed) return;
      if (!sourceCtx) return;
      const naturalWidth = image.naturalWidth || MAX_CANVAS_SIDE;
      const naturalHeight = image.naturalHeight || MAX_CANVAS_SIDE;
      const longest = Math.max(naturalWidth, naturalHeight, 1);
      const scale = MAX_CANVAS_SIDE / longest;
      const width = Math.round(naturalWidth * scale);
      const height = Math.round(naturalHeight * scale);

      canvas.width = width;
      canvas.height = height;
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      sourceCtx.clearRect(0, 0, width, height);
      sourceCtx.drawImage(image, 0, 0, width, height);
      sizeRef.current = {
        width,
        height,
        maxDim: Math.max(width, height),
      };
      pointerRef.current.x = width / 2;
      pointerRef.current.y = height / 2;
      pointerRef.current.x2 = width / 2;
      pointerRef.current.y2 = height / 2;
      pointerRef.current.s = 1.5;

      rebuildGrid();
      updateCanvasMetrics();
      frameRef.current = window.requestAnimationFrame(draw);
    };
    image.src = src;

    const handleResize = () => {
      updateCanvasMetrics();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [src]);

  const handlePointerMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rectRef.current) {
      rectRef.current = canvas.getBoundingClientRect();
    }

    const rect = rectRef.current;
    const scale = scaleRef.current;
    pointerRef.current.x2 = (event.clientX - rect.left) * scale.x;
    pointerRef.current.y2 = (event.clientY - rect.top) * scale.y;
  };

  const handlePointerLeave = () => {
    const { width, height } = sizeRef.current;
    pointerRef.current.x2 = width / 2;
    pointerRef.current.y2 = height / 2;
  };

  const handlePointerEnter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    rectRef.current = rect;
    const { width, height } = sizeRef.current;
    scaleRef.current = {
      x: width / Math.max(rect.width, 1),
      y: height / Math.max(rect.height, 1),
    };
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={alt}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
    />
  );
}
