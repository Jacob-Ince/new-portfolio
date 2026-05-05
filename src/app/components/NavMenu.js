"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./NavMenu.module.css";
import { createLogoGlitch, createHoverScramble } from "./animations";

const MOBILE_MENU_WORDMARK = "jac.ob";
const MOBILE_MENU_SCATTER_POINTS = [
  { left: "14%", top: "24%" },
  { left: "83%", top: "20%" },
  { left: "20%", top: "76%" },
  { left: "79%", top: "74%" },
  { left: "34%", top: "16%" },
  { left: "63%", top: "82%" },
];

export default function NavMenu({
  children,
  viewMode = "grid",
  onViewModeChange,
  footerClassName = "",
  footerStyle,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [shouldAnimateNavbar, setShouldAnimateNavbar] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const isGridViewActive = isHomePage && viewMode === "grid";
  const isListViewActive = isHomePage && viewMode === "list";
  const closeTimeoutRef = useRef(null);
  const navAnimationTimeoutRef = useRef(null);
  const logoRef = useRef(null);
  const navLinkRefs = useRef([]);

  useEffect(() => {
    const NAVBAR_ANIMATION_DELAY_MS = 220;

    const startNavbarAnimation = () => {
      setShouldAnimateNavbar(false);
      if (navAnimationTimeoutRef.current) {
        window.clearTimeout(navAnimationTimeoutRef.current);
        navAnimationTimeoutRef.current = null;
      }

      navAnimationTimeoutRef.current = window.setTimeout(() => {
        setShouldAnimateNavbar(true);
        navAnimationTimeoutRef.current = null;
      }, NAVBAR_ANIMATION_DELAY_MS);
    };

    if (document.documentElement.dataset.pageTransition === "active") {
      const handleTransitionIdle = () => {
        startNavbarAnimation();
      };

      window.addEventListener("page-transition-idle", handleTransitionIdle, {
        once: true,
      });

      return () => {
        window.removeEventListener(
          "page-transition-idle",
          handleTransitionIdle,
        );
        if (navAnimationTimeoutRef.current) {
          window.clearTimeout(navAnimationTimeoutRef.current);
          navAnimationTimeoutRef.current = null;
        }
      };
    }

    startNavbarAnimation();

    return () => {
      if (navAnimationTimeoutRef.current) {
        window.clearTimeout(navAnimationTimeoutRef.current);
        navAnimationTimeoutRef.current = null;
      }
    };
  }, [pathname]);

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
      if (navAnimationTimeoutRef.current) {
        clearTimeout(navAnimationTimeoutRef.current);
        navAnimationTimeoutRef.current = null;
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

  const handleViewModeButtonClick = (nextViewMode) => {
    if (isHomePage) {
      onViewModeChange?.(nextViewMode);
      return;
    }

    router.push("/");
  };

  const handleDesktopLabClick = (event) => {
    setIsMenuOpen(false);

    if (!isHomePage) return;

    event.preventDefault();
    onViewModeChange?.("grid");
  };

  const handleMobileLabClick = (event) => {
    if (isHomePage) {
      event.preventDefault();
      onViewModeChange?.("grid");
    }
    toggleMenu();
  };

  return (
    <div className={styles.page}>
      <nav
        className={`${styles.navbar} ${
          shouldAnimateNavbar ? styles.navbarAnimateIn : ""
        }`}
      >
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
            data-no-transition={isHomePage ? "true" : undefined}
            className={`${styles.navbarLink} ${styles.linkLab} ${
              pathname === "/" ? styles.active : ""
            }`}
            ref={(element) => {
              navLinkRefs.current[0] = element;
            }}
            onClick={handleDesktopLabClick}
          >
            <span className={styles.originalText}>lab</span>
          </Link>
          <Link
            href="/work"
            className={`${styles.navbarLink} ${styles.linkWork} ${
              pathname === "/work" ? styles.active : ""
            }`}
            ref={(element) => {
              navLinkRefs.current[1] = element;
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.originalText}>work</span>
          </Link>
          <Link
            href="/about"
            className={`${styles.navbarLink} ${styles.linkInfo} ${
              pathname === "/about" ? styles.active : ""
            }`}
            ref={(element) => {
              navLinkRefs.current[2] = element;
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.originalText}>about</span>
          </Link>
        </div>
        <div className={styles.navbarControls}>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.squareButton} ${
              isGridViewActive ? styles.iconButtonActive : ""
            }`}
            aria-label="Square icon"
            aria-pressed={isGridViewActive}
            onClick={() => handleViewModeButtonClick("grid")}
          />
          <button
            type="button"
            className={`${styles.iconButton} ${styles.listButton} ${
              isListViewActive ? styles.iconButtonActive : ""
            }`}
            aria-label="List view"
            aria-pressed={isListViewActive}
            onClick={() => handleViewModeButtonClick("list")}
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
          data-no-transition={isHomePage ? "true" : undefined}
          className={`${styles.navbarLink} ${styles.linkLab} ${
            pathname === "/" ? styles.active : ""
          }`}
          ref={(element) => {
            navLinkRefs.current[3] = element;
          }}
          onClick={handleMobileLabClick}
        >
          <span className={styles.originalText}>lab</span>
          <span className={styles.mobileMenuNumber}>// 1</span>
        </Link>
        <Link
          href="/work"
          className={`${styles.navbarLink} ${styles.linkWork} ${
            pathname === "/work" ? styles.active : ""
          }`}
          ref={(element) => {
            navLinkRefs.current[4] = element;
          }}
          onClick={toggleMenu}
        >
          <span className={styles.originalText}>work</span>
          <span className={styles.mobileMenuNumber}>// 2</span>
        </Link>
        <Link
          href="/about"
          className={`${styles.navbarLink} ${styles.linkInfo} ${
            pathname === "/about" ? styles.active : ""
          }`}
          ref={(element) => {
            navLinkRefs.current[5] = element;
          }}
          onClick={toggleMenu}
        >
          <span className={styles.originalText}>about</span>
          <span className={styles.mobileMenuNumber}>// 3</span>
        </Link>
        <div className={styles.mobileMenuSplash} aria-hidden="true">
          {MOBILE_MENU_WORDMARK.split("").map((char, index) => {
            const scatterPoint =
              MOBILE_MENU_SCATTER_POINTS[index] ??
              MOBILE_MENU_SCATTER_POINTS[0];

            return (
              <span
                key={`mobile-splash-char-${index}`}
                className={styles.mobileMenuSplashChar}
                style={{
                  "--char-index": index,
                  "--scatter-left": scatterPoint.left,
                  "--scatter-top": scatterPoint.top,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
        <div className={styles.mobileMenuFooter}>
          <div className={styles.mobileMenuFooterLeft}>
            <p className={styles.footerTitle}>
              <b> Get in Touch</b>
            </p>
            <a
              href="mailto:hello@jacobince.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerTitle}
            >
              hello@jacobince.com
            </a>
            <p className={styles.footerTitle}>London, UK</p>
          </div>
          <ul className={styles.mobileMenuFooterLinks}>
            <li>
              <a
                href="https://www.are.na/jacob-ince/channels"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Are.na
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/in/jacobince"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/aka_goblin/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      {children}
      <footer
        className={`${styles.footer} ${footerClassName}`.trim()}
        style={footerStyle}
      >
        <div className={styles.footerLeft}>
          <p className={styles.footerTitle}>
            {" "}
            <b> Get in Touch</b>
          </p>
          <a
            href="mailto:hello@jacobince.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.footerTitle} ${styles.footerEmail}`}
          >
            hello@jacobince.com
          </a>
          <p className={styles.footerTitle}>London, UK</p>
        </div>
        <ul className={styles.footerLinks}>
          <li>
            <a
              href="https://www.are.na/jacob-ince/channels"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              Are.na
            </a>
          </li>
          <li>
            <a
              href="https://linkedin.com/in/jacobince"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/aka_goblin/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              Instagram
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}
