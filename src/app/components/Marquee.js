"use client";

import styles from "./Marquee.module.css";

const Marquee = ({ children, speed = 20, direction = "left" }) => {
  return (
    <div className={styles.marqueeContainer}>
      <div
        className={styles.marqueeContent}
        style={{
          "--marquee-speed": `${speed}s`,
        }}
      >
        <div className={styles.marqueeGroup}>{children}</div>
        <div className={styles.marqueeGroup}>{children}</div>
        <div className={styles.marqueeGroup}>{children}</div>
      </div>
    </div>
  );
};

export default Marquee;
