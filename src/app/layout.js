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
  title: "jac.ob",
  description: "A Web Development Portfolio by Jacob Ince",
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
