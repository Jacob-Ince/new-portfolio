"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const overlayRef = useRef(null);
  const currentRouteKey = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const previousRouteKeyRef = useRef(currentRouteKey);
  const isTransitioningRef = useRef(false);
  const isAwaitingNavigationRef = useRef(false);

  const setTransitionState = (state) => {
    document.documentElement.dataset.pageTransition = state;
    window.dispatchEvent(new CustomEvent(`page-transition-${state}`));
  };

  const animateOverlay = (fromY, toY) => {
    const overlay = overlayRef.current;
    if (!overlay) return Promise.resolve();

    const animation = overlay.animate(
      [
        { transform: `translateY(${fromY})` },
        { transform: `translateY(${toY})` },
      ],
      {
        duration: 450,
        easing: "cubic-bezier(0.7, 0, 0.3, 1)",
        fill: "forwards",
      },
    );

    return animation.finished.catch(() => undefined);
  };

  useEffect(() => {
    setTransitionState("idle");

    const handleDocumentClick = async (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition === "true") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) return;

      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
      const nextRouteKey = `${nextUrl.pathname}${nextUrl.search}`;
      const currentRouteKey = `${currentUrl.pathname}${currentUrl.search}`;

      if (
        nextPath === currentPath ||
        nextRouteKey === currentRouteKey ||
        isTransitioningRef.current
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      isTransitioningRef.current = true;
      setTransitionState("active");

      await animateOverlay("100%", "0%");
      isAwaitingNavigationRef.current = true;
      router.push(nextPath);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      setTransitionState("idle");
    };
  }, [router]);

  useEffect(() => {
    const runReveal = async () => {
      await animateOverlay("0%", "-100%");
      const overlay = overlayRef.current;
      if (overlay) {
        overlay.style.transform = "translateY(100%)";
      }
      isTransitioningRef.current = false;
      isAwaitingNavigationRef.current = false;
      setTransitionState("idle");
    };

    if (currentRouteKey !== previousRouteKeyRef.current) {
      previousRouteKeyRef.current = currentRouteKey;
      if (isAwaitingNavigationRef.current) {
        runReveal();
      }
    }
  }, [currentRouteKey]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {children}

      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          inset: 0,
          transform: "translateY(100%)",
          backgroundColor: "#fff",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
