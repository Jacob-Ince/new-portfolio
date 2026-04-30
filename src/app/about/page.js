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
                  <li>Design Studio</li>
                  <li>OMSE</li>
                  <li>Levi&apos;s</li>
                  <li>Office of Overview</li>
                  <li>Balmain</li>
                  <li>Puma</li>
                  <li>CNN</li>
                  <li>Boots</li>
                  <li>Peter &amp; Paul</li>
                  <li>Zandland</li>
                  <li>SharpEnd</li>
                  <li>io.tt</li>
                  <li>Middle Name</li>
                  <li>Platform 13</li>
                  <li>UAL: Central Saint Martins</li>
                  <li>Madri</li>
                  <li>Jameson</li>
                  <li>Glen Grant</li>
                  <li>Aperol</li>
                  <li>Clinique</li>
                </ul>
              </div>
              <div className={styles.textContent}>
                <h1 className={styles.aboutTitle}>Connect</h1>
                <ul
                  className={`${styles.workedWithList} ${styles.connectList}`}
                >
                  <li>Are.na</li>
                  <li>LinkedIn</li>
                  <li>Instagram</li>
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
