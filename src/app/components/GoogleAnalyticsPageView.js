"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function GoogleAnalyticsPageView({ gaId }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!gaId || !pathname || typeof window.gtag !== "function") return;

    const search = window.location.search || "";
    const pagePath = `${pathname}${search}`;

    window.gtag("config", gaId, {
      page_path: pagePath,
    });
  }, [gaId, pathname]);

  return null;
}
