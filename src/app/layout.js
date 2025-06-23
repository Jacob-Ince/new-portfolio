import { Inter } from "next/font/google";
import "./globals.css";
import CustomCursor from "./components/CustomCursor";

const inter = Inter({ subsets: ["latin"] });
const ubuntu = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
});

export const metadata = {
  title: "JAC.OB",
  description: "A web development portfolio by jacob ince",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${ubuntu.variable}`}>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
