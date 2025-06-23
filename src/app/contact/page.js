"use client";

import { useState } from "react";
import styles from "./page.module.css";
import NavMenu from "../components/NavMenu";
import PageTransition from "../components/PageTransition";
import Marquee from "../components/Marquee";
import emailjs from "@emailjs/browser";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, submitted: false, error: null });

    try {
      await emailjs.send(
        "YOUR_SERVICE_ID", // Replace with your EmailJS service ID
        "YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_name: "Jacob Ince",
        },
        "YOUR_PUBLIC_KEY" // Replace with your EmailJS public key
      );

      setStatus({ submitting: false, submitted: true, error: null });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus({
        submitting: false,
        submitted: false,
        error: "Failed to send message. Please try again.",
      });
    }
  };

  return (
    <NavMenu>
      <PageTransition>
        <main className={styles.contactMain}>
          <div className={styles.contactContainer}>
            <div className={styles.contactContent}>
              <div className={styles.textContainer}>
                <div className={styles.textContent}>
                  <h1 className={styles.contactTitle}>Contact</h1>
                  <p>
                    I&apos;m always open to discussing new projects, creative
                    ideas or opportunities to be part of your visions.
                  </p>
                </div>
                {/* <div className={styles.textContent}>
                  <h1 className={styles.contactTitle}>Email</h1>
                  <a
                    href="mailto:hello@jacobince.com"
                    className={styles.contactLink}
                  >
                    hello@jacobince.com
                  </a>
                </div> */}
                <div className={styles.textContent}>
                  <h1 className={styles.contactTitle}>Social</h1>
                  <ul>
                    <li>
                      <a
                        href="https://github.com/jacobince"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://linkedin.com/in/jacobince"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://twitter.com/jacobince"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Twitter
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={styles.formContainer}>
                <h1 className={styles.contactTitle}>Get in Touch</h1>
                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Message"
                      required
                      className={styles.formTextarea}
                      rows="6"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status.submitting}
                    className={styles.submitButton}
                  >
                    {status.submitting ? "Sending..." : "Send Message"}
                  </button>
                  {status.submitted && (
                    <p className={styles.successMessage}>
                      Thank you for your message! I&apos;ll get back to you
                      soon.
                    </p>
                  )}
                  {status.error && (
                    <p className={styles.errorMessage}>{status.error}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
          <div className={styles.marqueeWrapper}>
            <Marquee speed={30}>
              <div className={styles.marqueeItem}>Get in Touch</div>
              <div className={styles.marqueeItem}>•</div>
              <div className={styles.marqueeItem}>Let&apos;s Connect</div>
              <div className={styles.marqueeItem}>•</div>
              <div className={styles.marqueeItem}>Start a Conversation</div>
              <div className={styles.marqueeItem}>•</div>
              <div className={styles.marqueeItem}>Work Together</div>
              <div className={styles.marqueeItem}>•</div>
            </Marquee>
          </div>
        </main>
      </PageTransition>
    </NavMenu>
  );
}
