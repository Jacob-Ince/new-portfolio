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
                  <li>office of overview</li>
                  <li>balmain</li>
                  <li>puma</li>
                  <li>CNN</li>
                  <li>Boots</li>
                  <li>Peter &amp; Paul</li>
                  <li>Zandland</li>
                  <li>SharpEnd</li>
                  <li>IO.TT</li>
                  <li>Vector Digital</li>
                  <li>Middle name</li>
                  <li>Platform 13</li>
                  <li>UAL: Central Saint Martins</li>
                  <li>Madri</li>
                  <li>Jameson</li>
                  <li>Clinique</li>
                  <li>Aperol</li>
                  <li>Glen Grant</li>
                </ul>
              </div>
            </div>
            <div className={styles.imageWrapper}>
              <Image
                src="/images/me.jpg"
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
