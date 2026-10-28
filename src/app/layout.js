import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import PageTransition from "./components/PageTransition";
import CookieConsentBanner from "./components/CookieConsentBanner";

const inter = Inter({ subsets: ["latin"] });
const ubuntu = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
});

export const metadata = {
  title: {
    default: "Jacob Ince - Creative Developer",
    template: "%s | Jacob Ince",
  },
  description:
    "Portfolio of Jacob Ince, a London-based creative developer building interactive websites and digital experiences for brands, agencies and ambitious businesses",
  metadataBase: new URL("https://www.jacobince.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "standard",
      "max-snippet": -1,
    },
  },
  other: {
    google: "notranslate",
  },
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" translate="no" className="notranslate">
      <body className={`${inter.className} ${ubuntu.variable} notranslate`}>
        <CookieConsentBanner gaId={gaId} />
        <Suspense>
          <PageTransition>{children}</PageTransition>
        </Suspense>
      </body>
    </html>
  );
}
