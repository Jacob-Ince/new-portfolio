"use client";

import styles from "./page.module.css";
import Image from "next/image";
import NavMenu from "../components/NavMenu";
import PageTransition from "../components/PageTransition";

export default function AboutPage() {
  return (
    <NavMenu>
      <PageTransition>
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
                {/* <div className={styles.textContent}>
                    <h1 className={styles.aboutTitle}>Brands:</h1>
                    <ul>
                    <li>Levi's</li>
                    <li>CNN</li>
                    <li>Boots</li>
                    <li>UAL: Central Saint Martins</li>
                    <li>Adobe Premiere Pro</li>
                    <li>Adobe After Effects</li>
                    <li>Adobe Lightroom</li>
                    <li>Adobe XD</li>
                    </ul>
                </div> */}
                <div className={styles.textContent}>
                  <h1 className={styles.aboutTitle}>Worked With</h1>
                  <ul>
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
                    <li>Levi's</li>
                    <li>CNN</li>
                    <li>Boots</li>
                    <li>Peter &amp; Paul</li>
                    <li>SharpEnd</li>
                    <li>IO.TT</li>
                    <li>Vector Digital</li>
                    <li>Platform 13</li>
                    <li>UAL: Central Saint Martins</li>
                  </ul>
                </div>
                {/* <div className={styles.textContent}>
                  <h1 className={styles.aboutTitle}>Tools</h1>
                  <ul>
                    <li>Next.js</li>
                    <li>React</li>
                    <li>Three.js</li>
                    <li>P5.js</li>
                    <li>GSAP</li>
                    <li>Motion</li>
                    <li>Spline</li>
                    <li>Figma</li>
                  </ul>
                </div> */}
              </div>
              <div className={styles.imageWrapper}>
                <Image
                  src="/images/portrait-layers-v2.png"
                  alt="Jacob Ince"
                  width={400}
                  height={600}
                  className={styles.aboutImage}
                />
              </div>
            </div>
          </div>
        </main>
      </PageTransition>
    </NavMenu>
  );
}
