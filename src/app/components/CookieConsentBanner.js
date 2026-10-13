"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import GoogleAnalyticsPageView from "./GoogleAnalyticsPageView";
import styles from "./CookieConsentBanner.module.css";

const COOKIE_CONSENT_KEY = "cookie-consent-v1";
const CONSENT_ACCEPTED = "accepted";
const CONSENT_REJECTED = "rejected";
const BANNER_EXIT_DURATION_MS = 220;

function readStoredConsent() {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (value === CONSENT_ACCEPTED) return true;
  if (value === CONSENT_REJECTED) return false;
  return null;
}

export default function CookieConsentBanner({ gaId }) {
  const pathname = usePathname();
  const [isClientReady, setIsClientReady] = useState(false);
  const [canShowBanner, setCanShowBanner] = useState(false);
  const [hasConsentChoice, setHasConsentChoice] = useState(false);
  const [isAnalyticsAllowed, setIsAnalyticsAllowed] = useState(false);
  const [isBannerExiting, setIsBannerExiting] = useState(false);

  useEffect(() => {
    setIsClientReady(true);

    const storedConsent = readStoredConsent();
    if (storedConsent === true) {
      setHasConsentChoice(true);
      setIsAnalyticsAllowed(true);
    } else if (storedConsent === false) {
      // Keep "decline" non-permanent so users can see the banner again.
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    }

    const splashAlreadySeen =
      window.sessionStorage.getItem("splashSeen") === "1";

    if (pathname !== "/" || splashAlreadySeen) {
      setCanShowBanner(true);
      return undefined;
    }

    const handleSplashComplete = () => {
      setCanShowBanner(true);
    };

    window.addEventListener("splash:complete", handleSplashComplete, {
      once: true,
    });

    // Fallback in case splash event is missed.
    const fallbackTimer = window.setTimeout(() => {
      setCanShowBanner(true);
    }, 7000);

    return () => {
      window.removeEventListener("splash:complete", handleSplashComplete);
      window.clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  const setConsent = useCallback((allowed) => {
    setIsBannerExiting(true);

    window.setTimeout(() => {
      if (allowed) {
        window.localStorage.setItem(COOKIE_CONSENT_KEY, CONSENT_ACCEPTED);
      } else {
        window.localStorage.removeItem(COOKIE_CONSENT_KEY);
      }

      setHasConsentChoice(true);
      setIsAnalyticsAllowed(allowed);
      setIsBannerExiting(false);
    }, BANNER_EXIT_DURATION_MS);
  }, []);

  const shouldShowBanner =
    isClientReady && Boolean(gaId) && canShowBanner && !hasConsentChoice;
  const shouldLoadAnalytics = Boolean(gaId) && isAnalyticsAllowed;

  return (
    <>
      {shouldLoadAnalytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', { send_page_view: false });
            `}
          </Script>
          <GoogleAnalyticsPageView gaId={gaId} />
        </>
      )}

      {shouldShowBanner && (
        <aside
          className={`${styles.banner} ${isBannerExiting ? styles.bannerExiting : ""}`}
          role="dialog"
          aria-live="polite"
        >
          <p className={styles.copy}>
            We use cookies for analytics to understand how people use this site
            and improve the experience over time.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.acceptButton}`}
              disabled={isBannerExiting}
              onClick={() => setConsent(true)}
            >
              accept
            </button>
            <button
              type="button"
              className={styles.button}
              disabled={isBannerExiting}
              onClick={() => setConsent(false)}
            >
              decline
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
