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
    default: "XPENG Indonesia — Mobil listrik pintar, pesan secara online",
    template: "%s | XPENG Indonesia",
  },
  description:
    "Kenali New X9 dan G6, bandingkan setiap varian, hitung simulasi tunai, kredit, atau sewa dalam rupiah, lalu amankan unit Anda secara online.",
  icons: { icon: "/media/brand/xpeng-mark-white.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f2f3f5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={archivo.variable}>
      <body>
        <a href="#main" className="skip">
          Langsung ke konten utama
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
