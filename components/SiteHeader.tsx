"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { modelList, fromPrice } from "@/lib/vehicles";
import { rupiahShort } from "@/lib/format";
import { HOTLINE } from "@/lib/showrooms";
import Img from "./Img";
import s from "./SiteHeader.module.css";

const OVERLAY_ROUTES = [/^\/$/, /^\/models\/[^/]+\/?$/];

// Official xpeng.com (global) pages. xpeng.com has no Discover page of its own: Discover is a menu whose
// "About XPENG" page is also where its "Discover XPENG" button leads.
const DISCOVER_URL = "https://www.xpeng.com/brand";
const SERVICE_URL = "https://www.xpeng.com/service";

/** Breathing room between the menu button and the glass when it is a circle on small screens. */
const BURGER_PAD = 4;

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState<{ l: number; r: number } | null>(null);
  const [animate, setAnimate] = useState(false);

  const shell = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const burger = useRef<HTMLButtonElement>(null);

  const overlayRoute = OVERLAY_ROUTES.some((r) => r.test(pathname));
  const ordering = pathname.startsWith("/order");

  // Only the dark hero at the top of a page gets the separated layout; everywhere else the bar is one piece.
  const expanded = ordering || !overlayRoute || scrolled || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The collapsed glass hugs the nav links (or the menu button on small screens). Measure so the
  // expanded and collapsed shapes are the same element at two sizes, not two elements.
  useLayoutEffect(() => {
    const sh = shell.current;
    if (!sh || ordering) return;
    const measure = () => {
      const target = nav.current && nav.current.offsetWidth > 0 ? nav.current : burger.current;
      if (!target) return;
      const pad = target === burger.current ? BURGER_PAD : 0;
      const a = sh.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      setPill({ l: Math.round(b.left - a.left - pad), r: Math.round(a.right - b.right - pad) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sh);
    if (nav.current) ro.observe(nav.current);
    document.fonts?.ready.then(measure);
    // Enable transitions only after the first measured frame, so nothing animates into place on load.
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ordering]);

  const longest = Math.max(...modelList.map((m) => m.lengthMm));
  const isActive = (href: string) => pathname.startsWith(href);

  const headerClass = [s.header, expanded && s.expanded, open && s.isOpen, animate && s.animate, "no-print"]
    .filter(Boolean)
    .join(" ");
  const shellStyle = pill ? ({ "--l": `${pill.l}px`, "--r": `${pill.r}px` } as React.CSSProperties) : undefined;

  const logo = (
    <Link href="/" className={s.logo} aria-label="XPENG Indonesia, ke beranda">
      <img src="/media/brand/xpeng-logo-white.svg" alt="XPENG" width={154} height={20} />
    </Link>
  );

  if (ordering) {
    return (
      <header className={headerClass}>
        <div className="wrap">
          <div ref={shell} className={s.shell}>
            <span className={s.glass} aria-hidden />
            {logo}
            <p className={s.help}>
              Ada pertanyaan? Telepon <a className="link" href={`tel:${HOTLINE}`}>{HOTLINE}</a>, kami siaga 24 jam
            </p>
            <Link href="/" className={`btn btn-ghost-light btn-sm ${s.cta} ${s.exit}`}>
              Keluar
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={headerClass}>
      <div className="wrap">
        <div ref={shell} className={s.shell} style={shellStyle}>
          <span className={s.glass} aria-hidden />
          {logo}

          <nav ref={nav} className={s.nav} aria-label="Menu utama">
            <Link href="/models/x9/" aria-current={isActive("/models/x9") ? "page" : undefined}>X9</Link>
            <Link href="/models/g6/" aria-current={isActive("/models/g6") ? "page" : undefined}>G6</Link>
            {/* Official xpeng.com pages, in a new tab. Discover is a menu there; "About XPENG" is its page. */}
            <a href={DISCOVER_URL} target="_blank" rel="noopener">Tentang XPENG</a>
            <a href={SERVICE_URL} target="_blank" rel="noopener">Servis</a>
            <Link href="/#showrooms">Showroom</Link>
          </nav>

          <div className={s.actions}>
            <Link href="/order/" className={`btn btn-light btn-sm ${s.cta}`}>
              Pesan sekarang
            </Link>
            <button
              ref={burger}
              type="button"
              className={s.burger}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
              <span aria-hidden className={s.burgerLines} />
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={s.sheet}
        hidden={!open}
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <div className="wrap">
          <ul className={s.sheetModels}>
            {modelList.map((m) => (
              <li key={m.slug}>
                <Link href={`/models/${m.slug}/`} className={s.sheetModel}>
                  <span className={s.sheetCarBox}>
                    <Img
                      src={m.silhouette}
                      alt=""
                      sizes="50vw"
                      className={s.sheetCar}
                      style={{ width: `${(m.lengthMm / longest) * 100}%` }}
                    />
                  </span>
                  <span className={s.sheetName}>{m.shortName}</span>
                  <span className="fine">Mulai {rupiahShort(fromPrice(m.slug))}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className={s.sheetLinks}>
            <li><a href={DISCOVER_URL} target="_blank" rel="noopener">Tentang XPENG</a></li>
            <li><a href={SERVICE_URL} target="_blank" rel="noopener">Servis</a></li>
            <li><Link href="/order/">Pesan online</Link></li>
            <li><Link href="/#showrooms">Cari showroom</Link></li>
            <li><a href={`tel:${HOTLINE}`}>Telepon {HOTLINE}</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
