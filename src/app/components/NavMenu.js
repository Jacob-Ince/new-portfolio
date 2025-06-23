"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavMenu.module.css";

export default function NavMenu({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

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
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  };

  const handleLinkHover = (e) => {
    const link = e.currentTarget;
    const originalText = link.querySelector(
      `.${styles.originalText}`
    ).textContent;

    // Remove any existing Chomsky text first
    const existingChomsky = link.querySelector(`.${styles.chomskyText}`);
    if (existingChomsky) {
      existingChomsky.remove();
    }

    const chomskyText = document.createElement("span");
    chomskyText.className = styles.chomskyText;
    chomskyText.textContent = originalText;
    link.appendChild(chomskyText);

    // Force a reflow to ensure the animation starts
    void chomskyText.offsetWidth;

    link.classList.add(styles.hovering);
  };

  const handleLinkLeave = (e) => {
    const link = e.currentTarget;
    const chomskyText = link.querySelector(`.${styles.chomskyText}`);
    if (chomskyText) {
      chomskyText.remove();
    }
    link.classList.remove(styles.hovering);
  };

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <Link
          href="/"
          className={styles.navbarLogo}
          onMouseEnter={handleLinkHover}
          onMouseLeave={handleLinkLeave}
        >
          <span className={styles.originalText}>jac.ob</span>
        </Link>
        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.active : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "x" : "M"}
        </button>
        <div
          className={`${styles.navbarLinks} ${isMenuOpen ? styles.active : ""}`}
        >
          <Link
            href="/"
            className={`${styles.navbarLink} ${
              pathname === "/" ? styles.active : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
          >
            <span className={styles.originalText}>Work</span>
          </Link>
          <Link
            href="/about"
            className={`${styles.navbarLink} ${
              pathname === "/about" ? styles.active : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
          >
            <span className={styles.originalText}>About</span>
          </Link>
          <Link
            href="/contact"
            className={`${styles.navbarLink} ${
              pathname === "/contact" ? styles.active : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
          >
            <span className={styles.originalText}>Contact</span>
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
