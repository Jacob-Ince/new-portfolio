const BASE_URL = "https://www.jacobince.com";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/studio/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
