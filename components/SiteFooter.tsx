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
                  Hotline, 24 hours: <a href={`tel:${HOTLINE}`}>{HOTLINE}</a>
                </span>
              </li>
              <li>
                <svg {...icon}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <a className="link" href="mailto:customercare@erajaya.com">customercare@erajaya.com</a>
              </li>
              <li>
                <svg {...icon}>
                  <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
                <span>Showrooms open daily, 09.00–18.00</span>
              </li>
            </ul>
          </div>

          <nav className={s.cols} aria-label="Footer">
            <div>
              <h2 className={s.colTitle}>Models</h2>
              <ul>
                <li><Link href="/models/x9/">New X9</Link></li>
                <li><Link href="/models/g6/">G6</Link></li>
                <li><Link href="/compare/">Compare</Link></li>
              </ul>
            </div>
            <div>
              <h2 className={s.colTitle}>Buy</h2>
              <ul>
                <li><Link href="/order/">Order online</Link></li>
                <li><Link href="/order/?plan=finance">Finance estimate</Link></li>
                <li><Link href="/#showrooms">Showrooms</Link></li>
                <li><a href={`${OFFICIAL}/book-now`}>Book a test drive</a></li>
              </ul>
            </div>
            <div>
              <h2 className={s.colTitle}>Ownership</h2>
              <ul>
                <li><a href={`${OFFICIAL}/charging`}>Charging</a></li>
                <li><a href={`${OFFICIAL}/service`}>Service</a></li>
                <li><a href={`${OFFICIAL}/roadside-assistance`}>Roadside assistance</a></li>
                <li><a href={`${OFFICIAL}/xpeng-app`}>XPENG app</a></li>
              </ul>
            </div>
            <div>
              <h2 className={s.colTitle}>XPENG</h2>
              <ul>
                <li><a href={`${OFFICIAL}/about-xpeng`}>About</a></li>
                <li><a href={`${OFFICIAL}/ai-mobility`}>AI mobility</a></li>
                <li><a href={`${OFFICIAL}/news`}>News</a></li>
                <li><a href={`${OFFICIAL}/events`}>Events</a></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className={s.legal}>
          <p className={s.policies}>
            <a href={`${OFFICIAL}/privacy-policy`}>Privacy policy</a>
            <a href={`${OFFICIAL}/cookie-policy`}>Cookie policy</a>
          </p>
          <p>© XPENG Inc.</p>
        </div>
      </div>
    </footer>
  );
}
