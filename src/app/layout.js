import { Inter } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import PageTransition from "./components/PageTransition";

const inter = Inter({ subsets: ["latin"] });
const ubuntu = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
});

export const metadata = {
  title: {
    default: "jac.ob",
    template: "%s — jac.ob",
  },
  description:
    "Portfolio of Jacob Ince, a London-based front-end developer creating interactive web experiences across development, design, motion, and 3D.",
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
  themeColor: "#10F200",
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" translate="no" className="notranslate">
      <body className={`${inter.className} ${ubuntu.variable} notranslate`}>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        <Suspense>
          <PageTransition>{children}</PageTransition>
        </Suspense>
      </body>
    </html>
  );
}
