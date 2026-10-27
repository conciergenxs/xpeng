"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOTLINE } from "@/lib/showrooms";
import s from "./SiteFooter.module.css";

const OFFICIAL = "https://xpeng.co.id/en";

const icon = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export default function SiteFooter() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/order")) return null;

  return (
    <footer className={`${s.footer} dark no-print`}>
      {/* Horizon glow: a thin lit curve across the top, brightest on the right. */}
      <div className={s.horizon} aria-hidden>
        <span />
      </div>

      <div className="wrap">
        <div className={s.top}>
          <div className={s.contact}>
            <img src="/media/brand/xpeng-logo-white.svg" alt="XPENG" width={154} height={20} className={s.logo} />
            <ul>
              <li>
                <svg {...icon}>
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                </svg>
                <span>
                  Hotline 24 jam: <a href={`tel:${HOTLINE}`}>{HOTLINE}</a>
                </span>
              </li>
              <li>
                <svg {...icon}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <a className="link" href="mailto:customercare@erajaya.com">customercare@erajaya.com</a>
              </li>
            </ul>
          </div>

          <nav className={s.cols} aria-label="Tautan situs">
            <div>
              <h2 className={s.colTitle}>Model</h2>
              <ul>
                <li><Link href="/models/x9/">New X9</Link></li>
                <li><Link href="/models/g6/">G6</Link></li>
                <li><Link href="/compare/">Bandingkan model</Link></li>
              </ul>
            </div>
            <div>
              <h2 className={s.colTitle}>Pembelian</h2>
              <ul>
                <li><Link href="/order/">Pesan online</Link></li>
                <li><Link href="/order/?plan=finance">Simulasi kredit</Link></li>
                <li><Link href="/#showrooms">Showroom</Link></li>
                <li><a href={`${OFFICIAL}/book-now`}>Jadwalkan test drive</a></li>
              </ul>
            </div>
            <div>
              <h2 className={s.colTitle}>Untuk pemilik</h2>
              <ul>
                <li><a href={`${OFFICIAL}/charging`}>Pengisian daya</a></li>
                <li><a href={`${OFFICIAL}/service`}>Servis</a></li>
                <li><a href={`${OFFICIAL}/roadside-assistance`}>Bantuan di jalan</a></li>
                <li><a href={`${OFFICIAL}/xpeng-app`}>Aplikasi XPENG</a></li>
              </ul>
            </div>
            <div>
              <h2 className={s.colTitle}>XPENG</h2>
              <ul>
                <li><a href={`${OFFICIAL}/about-xpeng`}>Tentang XPENG</a></li>
                <li><a href={`${OFFICIAL}/ai-mobility`}>Mobilitas AI</a></li>
                <li><a href={`${OFFICIAL}/news`}>Berita</a></li>
                <li><a href={`${OFFICIAL}/events`}>Acara</a></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className={s.legal}>
          <p className={s.policies}>
            <a href={`${OFFICIAL}/privacy-policy`}>Kebijakan privasi</a>
            <a href={`${OFFICIAL}/cookie-policy`}>Kebijakan cookie</a>
          </p>
          <p>© XPENG Inc.</p>
        </div>
      </div>
    </footer>
  );
}
