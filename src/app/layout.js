import { Inter } from "next/font/google";
import "./globals.css";
import PageTransition from "./components/PageTransition";

const inter = Inter({ subsets: ["latin"] });
const ubuntu = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
});

export const metadata = {
  title: "JAC.OB",
  description: "A web development portfolio by jacob ince",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" translate="no" className="notranslate">
      <body className={`${inter.className} ${ubuntu.variable} notranslate`}>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
