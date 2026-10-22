import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "XPENG Indonesia — Explore, compare and order online",
    template: "%s | XPENG Indonesia",
  },
  description:
    "Explore the XPENG New X9 and G6, compare variants, estimate cash, finance and lease payments in rupiah, and reserve your car online.",
  icons: { icon: "/media/brand/xpeng-mark-white.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f2f3f5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
