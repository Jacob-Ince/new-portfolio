"use client";

import styles from "./page.module.css";
import NavMenu from "../components/NavMenu";
import PixelatedImage from "../components/PixelatedImage";
import { useLayoutEffect, useRef, useState } from "react";

const BIO_TEXT =
  "A front-end developer working at the intersection of design and creative technology. I build interactive, visually engaging experiences with a focus on detail, performance and storytelling through code, blending smooth interfaces with expressive visuals.";

const clients = [
  { name: "Midnight Studio", url: "https://midnight.agency/" },
  { name: "Justified Studio", url: "https://justified.studio/" },
  { name: "Further", url: "https://www.further.group/" },
  { name: "OMSE", url: "https://www.omse.co/" },
  { name: "Levi's", url: "https://www.levi.com/" },
  { name: "Office of Overview", url: "https://officeofoverview.com/" },
  { name: "Balmain", url: "https://gb.balmain.com/" },
  { name: "Puma", url: "https://uk.puma.com/" },
  { name: "CNN", url: "https://edition.cnn.com/" },
  { name: "Boots", url: "https://www.boots.com/" },
  { name: "Peter & Paul", url: "https://www.peterandpaul.co.uk/" },
  { name: "Zandland", url: "https://www.zand.land/" },
  { name: "SharpEnd", url: "https://sharpend.com/" },
  { name: "io.tt", url: "https://io.tt/" },
  { name: "Middle Name", url: "https://middlename.co.uk/" },
  { name: "Platform 13", url: "https://www.platform13.net/" },
  { name: "UAL", url: "https://www.arts.ac.uk/" },
  { name: "Madrí", url: "https://www.madriexcepcional.com/" },
  { name: "Jameson", url: "https://www.jamesonwhiskey.com/" },
  { name: "Glen Grant", url: "https://www.theglengrant.com/" },
  { name: "Aperol", url: "https://www.aperol.com/" },
  { name: "Clinique", url: "https://www.clinique.co.uk/" },
];

const connects = [
  { name: "Are.na", url: "https://www.are.na/jacob-ince/channels" },
  { name: "Linkedin", url: "https://linkedin.com/in/jacobince" },
  { name: "Instagram", url: "https://www.instagram.com/aka_goblin/" },
];

const ABOUT_TITLE_DELAY = 40;
const BIO_LINE_BASE = 120;
const BIO_LINE_STAGGER = 70;
const BIO_LINE_DURATION = 500;
const WW_LI_STAGGER = 15;
const CONNECT_LI_STAGGER = 40;

export default function AboutPage() {
  const bioRef = useRef(null);
  const [bioLines, setBioLines] = useState([]);
  const [showBioOverlay, setShowBioOverlay] = useState(true);
  const [sectionDelays, setSectionDelays] = useState({
    workedWithTitle: 440,
    workedWithBase: 520,
    connectTitle: 960,
    connectBase: 1040,
  });

  const bioWords = BIO_TEXT.split(/\s+/).filter(Boolean);

  useLayoutEffect(() => {
    const container = bioRef.current;
    if (!container) return;

    const wordNodes = Array.from(container.querySelectorAll("[data-word]"));
    if (wordNodes.length === 0) return;

    const lines = [];
    let currentLineWords = [];
    let currentTop = wordNodes[0].offsetTop;

    wordNodes.forEach((node) => {
      const word = node.getAttribute("data-word");
      if (!word) return;
      if (node.offsetTop !== currentTop) {
        if (currentLineWords.length > 0) lines.push(currentLineWords.join(" "));
        currentLineWords = [word];
        currentTop = node.offsetTop;
      } else {
        currentLineWords.push(word);
      }
    });
    if (currentLineWords.length > 0) lines.push(currentLineWords.join(" "));

    if (lines.length > 0) {
      setBioLines(lines);

      const numLines = lines.length;
      const bioDone =
        BIO_LINE_BASE + (numLines - 1) * BIO_LINE_STAGGER + BIO_LINE_DURATION;
      const workedWithTitle = bioDone + 40;
      const workedWithBase = workedWithTitle + 80;
      const workedWithDone =
        workedWithBase + (clients.length - 1) * WW_LI_STAGGER + 80;
      const connectTitle = workedWithDone + 40;
      const connectBase = connectTitle + 80;

      setSectionDelays({
        workedWithTitle,
        workedWithBase,
        connectTitle,
        connectBase,
      });

      const t = setTimeout(() => setShowBioOverlay(false), bioDone + 40);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <NavMenu>
      <main className={styles.aboutMain}>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutContent}>
            <div className={styles.textContainer}>
              {/* About */}
              <div className={styles.textContent}>
                <div
                  className={styles.titleMask}
                  style={{ "--item-delay": `${ABOUT_TITLE_DELAY}ms` }}
                >
                  <h1 className={styles.aboutTitle}>About</h1>
                </div>
                <p
                  ref={bioRef}
                  className={`${styles.bioParagraph} ${showBioOverlay ? styles.bioHasOverlay : ""}`}
                >
                  {BIO_TEXT}
                  {showBioOverlay && (
                    <span className={styles.bioOverlay} aria-hidden="true">
                      <span className={styles.bioMeasure}>
                        {bioWords.map((word, i) => (
                          <span
                            key={i}
                            data-word={word}
                            className={styles.bioMeasureWord}
                          >
                            {word}{" "}
                          </span>
                        ))}
                      </span>
                      {bioLines.map((line, i) => (
                        <span key={i} className={styles.bioLineMask}>
                          <span
                            className={styles.bioLine}
                            style={{
                              "--line-delay": `${BIO_LINE_BASE + i * BIO_LINE_STAGGER}ms`,
                            }}
                          >
                            {line}
                          </span>
                        </span>
                      ))}
                    </span>
                  )}
                </p>
              </div>

              {/* Worked With */}
              <div className={styles.textContent}>
                <div
                  className={styles.titleMask}
                  style={{
                    "--item-delay": `${sectionDelays.workedWithTitle}ms`,
                  }}
                >
                  <h1 className={styles.aboutTitle}>Worked With</h1>
                </div>
                <ul className={styles.workedWithList}>
                  {clients.map((client, i) => (
                    <li
                      key={client.name}
                      className={styles.animatedLi}
                      style={{
                        "--li-delay": `${sectionDelays.workedWithBase + i * WW_LI_STAGGER}ms`,
                      }}
                    >
                      <a
                        href={client.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {client.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connect */}
              <div className={styles.textContent}>
                <div
                  className={styles.titleMask}
                  style={{ "--item-delay": `${sectionDelays.connectTitle}ms` }}
                >
                  <h1 className={styles.aboutTitle}>Connect</h1>
                </div>
                <ul
                  className={`${styles.workedWithList} ${styles.connectList}`}
                >
                  {connects.map((connect, i) => (
                    <li
                      key={connect.name}
                      className={styles.animatedLi}
                      style={{
                        "--li-delay": `${sectionDelays.connectBase + i * CONNECT_LI_STAGGER}ms`,
                      }}
                    >
                      <a
                        href={connect.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {connect.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.imageWrapper}>
              <PixelatedImage
                src="/images/profile-zoomed.png"
                alt="Jacob Ince"
                className={styles.pixelCanvas}
              />
            </div>
          </div>
        </div>
      </main>
    </NavMenu>
  );
}
