"use client";

import styles from "./page.module.css";
import Image from "next/image";
import NavMenu from "../components/NavMenu";

export default function AboutPage() {
  return (
    <NavMenu>
      <main className={styles.aboutMain}>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutContent}>
            <div className={styles.textContainer}>
              <div className={styles.textContent}>
                <h1 className={styles.aboutTitle}>About</h1>
                <p>
                  A front-end developer working at the intersection of design
                  and creative technology. I build interactive, visually
                  engaging experiences with a focus on detail, performance and
                  storytelling through code, blending smooth interfaces with
                  expressive visuals.
                </p>
              </div>
              <div className={styles.textContent}>
                <h1 className={styles.aboutTitle}>Worked With</h1>
                <ul className={styles.workedWithList}>
                  <li>
                    <a href="https://midnight.agency/" target="_blank">
                      Midnight Studio
                    </a>
                  </li>
                  <li>
                    <a href="https://justified.studio/" target="_blank">
                      Justified Studio
                    </a>
                  </li>
                  <li>
                    <a href="https://www.further.group/" target="_blank">
                      Further
                    </a>
                  </li>
                  <li>
                    <a href="https://www.omse.co/" target="_blank">
                      OMSE
                    </a>
                  </li>
                  <li>
                    <a href="https://www.levi.com/" target="_blank">
                      Levi&apos;s
                    </a>
                  </li>
                  <li>
                    <a href="https://officeofoverview.com/" target="_blank">
                      Office of Overview
                    </a>
                  </li>
                  <li>
                    <a href="https://gb.balmain.com/" target="_blank">
                      Balmain
                    </a>
                  </li>
                  <li>
                    <a href="https://uk.puma.com/" target="_blank">
                      Puma
                    </a>
                  </li>
                  <li>
                    <a href="https://edition.cnn.com/" target="_blank">
                      CNN
                    </a>
                  </li>
                  <li>
                    <a href="https://www.boots.com/" target="_blank">
                      Boots
                    </a>
                  </li>
                  <li>
                    <a href="https://www.peterandpaul.co.uk/" target="_blank">
                      Peter &amp; Paul
                    </a>
                  </li>
                  <li>
                    <a href="https://www.zand.land/" target="_blank">
                      Zandland
                    </a>
                  </li>
                  <li>
                    <a href="https://sharpend.com/" target="_blank">
                      SharpEnd
                    </a>
                  </li>
                  <li>
                    <a href="https://io.tt/" target="_blank">
                      io.tt
                    </a>
                  </li>
                  <li>
                    <a href="https://middlename.co.uk/" target="_blank">
                      Middle Name
                    </a>
                  </li>
                  <li>
                    <a href="https://www.platform13.net/" target="_blank">
                      Platform 13
                    </a>
                  </li>
                  <li>
                    <a href="https://www.arts.ac.uk/" target="_blank">
                      UAL
                    </a>
                  </li>
                  <li>
                    <a href="https://www.madriexcepcional.com/" target="_blank">
                      Madrí
                    </a>
                  </li>
                  <li>
                    <a href="https://www.jamesonwhiskey.com/" target="_blank">
                      Jameson
                    </a>
                  </li>
                  <li>
                    <a href="https://www.theglengrant.com/" target="_blank">
                      Glen Grant
                    </a>
                  </li>
                  <li>
                    <a href="https://www.aperol.com/" target="_blank">
                      Aperol
                    </a>
                  </li>
                  <li>
                    <a href="https://www.clinique.co.uk/" target="_blank">
                      Clinique
                    </a>
                  </li>
                </ul>
              </div>
              <div className={styles.textContent}>
                <h1 className={styles.aboutTitle}>Connect</h1>
                <ul
                  className={`${styles.workedWithList} ${styles.connectList}`}
                >
                  <li>
                    {" "}
                    <a
                      href="https://www.are.na/jacob-ince/channels"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Are.na
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://linkedin.com/in/jacobince"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Linkedin
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/aka_goblin/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className={styles.imageWrapper}>
              <Image
                src="/images/profile-zoomed.png"
                alt="Jacob Ince"
                width={400}
                height={600}
                className={styles.aboutImage}
              />
            </div>
          </div>
        </div>
      </main>
    </NavMenu>
  );
}
