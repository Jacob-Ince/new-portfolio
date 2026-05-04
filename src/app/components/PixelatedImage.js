"use client";

import { useEffect, useRef } from "react";

const PIXEL_STEPS = [64, 32, 16, 8, 4, 2, 1];
const STEP_DURATION = 120; // ms per step

export default function PixelatedImage({ src, alt, className }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    function drawAtPixelSize(pixelSize) {
      const w = canvas.width;
      const h = canvas.height;

      if (pixelSize <= 1) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, w, h);
        return;
      }

      const cols = Math.max(1, Math.ceil(w / pixelSize));
      const rows = Math.max(1, Math.ceil(h / pixelSize));

      const offscreen = document.createElement("canvas");
      offscreen.width = cols;
      offscreen.height = rows;
      const offCtx = offscreen.getContext("2d");
      offCtx.drawImage(img, 0, 0, cols, rows);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0, w, h);
    }

    function startAnimation() {
      let stepIndex = 0;

      function nextStep() {
        drawAtPixelSize(PIXEL_STEPS[stepIndex]);
        stepIndex++;
        if (stepIndex < PIXEL_STEPS.length) {
          animRef.current = setTimeout(nextStep, STEP_DURATION);
        }
      }

      nextStep();
    }

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      animRef.current = setTimeout(startAnimation, 500);
    };

    img.src = src;

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [src]);

  return <canvas ref={canvasRef} className={className} aria-label={alt} />;
}
