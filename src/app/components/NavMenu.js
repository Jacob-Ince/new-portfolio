"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavMenu.module.css";
import { createLogoGlitch, createHoverScramble } from "./animations";

export default function NavMenu({
  children,
  viewMode = "grid",
  onViewModeChange,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const pathname = usePathname();
  const closeTimeoutRef = useRef(null);
  const logoRef = useRef(null);
  const navLinkRefs = useRef([]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const logoElement = logoRef.current;
    if (!logoElement) return undefined;

    const originalTextClass = styles.originalText || "originalText";
    const originalTextElement =
      logoElement.querySelector(`.${originalTextClass}`) ||
      logoElement.querySelector('[class*="originalText"]') ||
      logoElement.querySelector("span");
    const originalText = originalTextElement?.textContent || "jac.ob";

    const stopGlitch = createLogoGlitch(logoElement, originalText, styles, {
      minInterval: 1200,
      maxInterval: 2600,
      glitchDuration: 450,
      glitchCycles: 4,
      intensity: 0.4,
    });

    return () => {
      stopGlitch?.();
    };
  }, []);

  useEffect(() => {
    const cleanupFns = navLinkRefs.current
      .filter(Boolean)
      .map((linkElement) => {
        const originalTextElement =
          linkElement.querySelector(`.${styles.originalText}`) ||
          linkElement.querySelector('[class*="originalText"]') ||
          linkElement.querySelector("span");
        const originalText = originalTextElement?.textContent?.trim() || "";

        return createHoverScramble(linkElement, originalText, {
          duration: 420,
          frameDelay: 28,
          intensity: 0.95,
          lockWidth: true,
        });
      });

    return () => {
      cleanupFns.forEach((cleanup) => cleanup?.());
    };
  }, []);

  // Track scroll percentage
  useEffect(() => {
    const calculateScrollPercentage = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollableHeight = documentHeight - windowHeight;
      const percentage =
        scrollableHeight > 0
          ? Math.round((scrollTop / scrollableHeight) * 100)
          : 0;
      setScrollPercentage(percentage);
    };

    // Calculate on mount
    calculateScrollPercentage();

    // Listen to scroll events
    window.addEventListener("scroll", calculateScrollPercentage, {
      passive: true,
    });
    window.addEventListener("resize", calculateScrollPercentage, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", calculateScrollPercentage);
      window.removeEventListener("resize", calculateScrollPercentage);
    };
  }, []);

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuClosing(true);
      closeTimeoutRef.current = setTimeout(() => {
        setIsMenuOpen(false);
        setIsMenuClosing(false);
        closeTimeoutRef.current = null;
      }, 350);
    } else {
      setIsMenuOpen(true);
      setIsMenuClosing(false);
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.active : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.menuButtonSquare} aria-hidden="true" />
        </button>
        <div className={styles.navbarLinks}>
          <Link
            href="/"
            ref={logoRef}
            className={`${styles.navbarLogo} ${styles.linkLogo}`}
          >
            <span className={styles.originalText}>jac.ob</span>
          </Link>
          <Link
            href="/"
            className={`${styles.navbarLink} ${styles.linkWork} ${
              pathname === "/" ? styles.active : ""
            }`}
            ref={(element) => {
              navLinkRefs.current[0] = element;
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.originalText}>lab</span>
          </Link>
          <Link
            href="/about"
            className={`${styles.navbarLink} ${styles.linkInfo} ${
              pathname === "/about" ? styles.active : ""
            }`}
            ref={(element) => {
              navLinkRefs.current[1] = element;
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.originalText}>information</span>
          </Link>
          <Link
            href="/contact"
            className={`${styles.navbarLink} ${styles.linkContact} ${
              pathname === "/contact" ? styles.active : ""
            }`}
            ref={(element) => {
              navLinkRefs.current[2] = element;
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.originalText}>contact</span>
          </Link>
        </div>
        <div className={styles.navbarControls}>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.squareButton} ${
              viewMode === "grid" ? styles.iconButtonActive : ""
            }`}
            aria-label="Square icon"
            aria-pressed={viewMode === "grid"}
            onClick={() => onViewModeChange?.("grid")}
          />
          <button
            type="button"
            className={`${styles.iconButton} ${styles.listButton} ${
              viewMode === "list" ? styles.iconButtonActive : ""
            }`}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
            onClick={() => onViewModeChange?.("list")}
          />
          <div className={styles.scrollPercentage}>
            <span className={styles.originalText}>{scrollPercentage}%</span>
          </div>
        </div>
      </nav>
      <div
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        } ${isMenuClosing ? styles.mobileMenuClosing : ""}`}
      >
        <Link
          href="/"
          className={`${styles.navbarLink} ${styles.linkWork} ${
            pathname === "/" ? styles.active : ""
          }`}
          ref={(element) => {
            navLinkRefs.current[3] = element;
          }}
          onClick={toggleMenu}
        >
          <span className={styles.originalText}>lab</span>
          <span className={styles.mobileMenuNumber}>// 1</span>
        </Link>
        <Link
          href="/about"
          className={`${styles.navbarLink} ${styles.linkInfo} ${
            pathname === "/about" ? styles.active : ""
          }`}
          ref={(element) => {
            navLinkRefs.current[4] = element;
          }}
          onClick={toggleMenu}
        >
          <span className={styles.originalText}>information</span>
          <span className={styles.mobileMenuNumber}>// 2</span>
        </Link>
        <Link
          href="/contact"
          className={`${styles.navbarLink} ${styles.linkContact} ${
            pathname === "/contact" ? styles.active : ""
          }`}
          ref={(element) => {
            navLinkRefs.current[5] = element;
          }}
          onClick={toggleMenu}
        >
          <span className={styles.originalText}>contact</span>
          <span className={styles.mobileMenuNumber}>// 3</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
