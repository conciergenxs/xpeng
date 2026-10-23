"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Img from "@/components/Img";
import InViewVideo from "@/components/InViewVideo";
import s from "./WhyXpeng.module.css";

type Feature = {
  id: string;
  name: string;
  copy: string;
  media: { kind: "video"; mp4: string; poster: string; label: string } | { kind: "image"; src: string; alt: string };
};

// Visuals are the official "Why Choose XPENG" media from xpeng.com (originals in assets/original/home/why).
const FEATURES: Feature[] = [
  {
    id: "xpilot",
    name: "XPILOT ASSIST",
    copy: "Bantuan mengemudi yang cerdas ikut memantau sekitar mobil, sehingga Anda melaju lebih tenang dan percaya diri. Kendali tetap di tangan Anda.",
    media: {
      kind: "video",
      mp4: "/media/home/why/xpilot.mp4",
      poster: "/media/home/why/xpilot-poster.jpg",
      label: "XPENG X9 mundur keluar dari jalan sempit dengan bantuan reverse track assist",
    },
  },
  {
    id: "xmart",
    name: "XMART OS",
    copy: "Navigasi, hiburan, dan kontrol penting kendaraan berkumpul di satu kokpit digital. Semuanya mudah dijangkau, tanpa perlu mencari-cari.",
    media: { kind: "image", src: "/media/home/why/xmart-os", alt: "Pengemudi menggunakan layar sentuh tengah di kokpit XPENG X9" },
  },
  {
    id: "ota",
    name: "PEMBARUAN OTA",
    copy: "Sistem dan fitur yang didukung bisa terus disempurnakan lewat pembaruan perangkat lunak nirkabel, tanpa harus datang ke bengkel.",
    media: { kind: "image", src: "/media/home/why/ota", alt: "XPENG G6 dikelilingi garis digital yang menggambarkan pembaruan perangkat lunak" },
  },
  {
    id: "safety",
    name: "KESELAMATAN",
    copy: "Struktur kendaraan yang dirancang cermat dan sistem keselamatan terpadu bekerja bersama untuk membantu melindungi setiap penumpang.",
    media: { kind: "image", src: "/media/home/why/safety", alt: "Lapisan pelindung pada baterai XPENG" },
  },
];

const N = FEATURES.length;
/** Slide position relative to the active one, wrapped to -1…N-2 so a neighbour always peeks in on each side. */
const rel = (i: number, active: number) => ((((i - active) % N) + N + 1) % N) - 1;

export default function WhyXpeng() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false); // the floating control's visibility
  const [mediaInView, setMediaInView] = useState(false); // plays the film only while it can be seen
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const prevRel = useRef<number[]>(FEATURES.map((_, i) => rel(i, 0)));

  const go = useCallback((dir: 1 | -1) => setActive((a) => (a + dir + N) % N), []);

  // The control is shown only while the section sits beneath it: the carousel well into view, and the section
  // still covering the bottom of the screen where the control floats. As soon as the next or previous section
  // reaches that spot, it animates out. An observer switches the precise scroll check on only near the section.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let raf = 0;
    let tracking = false;
    const check = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setInView(r.top <= vh * 0.55 && r.bottom >= vh - 4);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    const start = () => {
      if (tracking) return;
      tracking = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      check();
    };
    const stop = () => {
      if (!tracking) return;
      tracking = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      raf = 0;
      setInView(false);
    };
    const near = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    const any = new IntersectionObserver(([e]) => setMediaInView(e.isIntersecting), { threshold: 0.2 });
    near.observe(el);
    any.observe(el);
    return () => {
      near.disconnect();
      any.disconnect();
      stop();
    };
  }, []);

  // Horizontal trackpad swipes (and shift + wheel) turn one slide per gesture; vertical scrolling is left alone.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    let acc = 0;
    let locked = false;
    let idle = 0;
    const onWheel = (e: WheelEvent) => {
      const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
      if (Math.abs(dx) <= Math.abs(e.shiftKey ? 0 : e.deltaY)) return;
      e.preventDefault(); // also stops the browser's back/forward swipe while over the carousel
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        acc = 0;
        locked = false;
      }, 180);
      if (locked) return;
      acc += dx;
      if (Math.abs(acc) > 40) {
        go(acc > 0 ? 1 : -1);
        locked = true; // one slide per gesture, released once the trackpad goes quiet
        acc = 0;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(idle);
    };
  }, [go]);

  // Touch: a horizontal swipe changes slide; vertical swipes still scroll the page (touch-action: pan-y).
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const st = swipe.current;
    swipe.current = null;
    if (!st || st.id !== e.pointerId) return;
    const dx = e.clientX - st.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - st.y)) go(dx < 0 ? 1 : -1);
  };

  const positions = FEATURES.map((_, i) => rel(i, active));
  // A slide that wraps from one end to the other jumps instead of sliding across the screen.
  const jumped = positions.map((p, i) => Math.abs(p - prevRel.current[i]) > 1);
  useEffect(() => {
    prevRel.current = positions;
  });

  const current = FEATURES[active];

  return (
    <section ref={section} className={s.section} aria-labelledby="why-title" aria-roledescription="korsel">
      <h2 id="why-title" className={`headline ${s.title}`}>
        Yang membuat XPENG berbeda.
      </h2>

      <div
        ref={viewport}
        className={s.viewport}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {FEATURES.map((f, i) => {
          const p = positions[i];
          const on = p === 0;
          return (
            <div
              key={f.id}
              className={`${s.slide} ${on ? s.slideOn : ""} ${jumped[i] ? s.noMotion : ""} ${p > 1 || p < -1 ? s.offstage : ""}`}
              style={{ "--pos": p } as React.CSSProperties}
              role="group"
              aria-roledescription="slide"
              aria-label={`${f.name}, ${i + 1} dari ${N}`}
              aria-hidden={!on}
              onClick={() => !on && Math.abs(p) === 1 && go(p as 1 | -1)}
            >
              {f.media.kind === "video" ? (
                <InViewVideo className={s.media} mp4={f.media.mp4} poster={f.media.poster} label={f.media.label} active={on && mediaInView} />
              ) : (
                <Img src={f.media.src} alt={on ? f.media.alt : ""} sizes="(max-width: 760px) 90vw, 86vw" className={s.media} />
              )}
            </div>
          );
        })}
      </div>

      {/* All four descriptions share one cell, so the block is exactly as tall as the longest. */}
      <div className={s.text} aria-live="polite">
        {FEATURES.map((f) => {
          const on = f.id === current.id;
          return (
            <div key={on ? `${f.id}-on` : f.id} className={`${s.textInner} ${on ? s.textOn : ""}`} aria-hidden={!on}>
              <h3 className={s.name}>{f.name}</h3>
              <p className={s.copy}>{f.copy}</p>
            </div>
          );
        })}
      </div>

      <FeatureControl visible={inView} label={current.name} onPrev={() => go(-1)} onNext={() => go(1)} />
    </section>
  );
}

/** Floating glass control: a pill that hugs the active feature's name, with a chevron button on each side. */
function FeatureControl({ visible, label, onPrev, onNext }: { visible: boolean; label: string; onPrev: () => void; onNext: () => void }) {
  const measure = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  // Animate the pill's width to the new label instead of letting it snap.
  useLayoutEffect(() => {
    if (measure.current) setWidth(measure.current.offsetWidth);
  }, [label]);

  return (
    <div className={`${s.control} ${visible ? s.controlOn : ""}`} aria-hidden={!visible} inert={!visible}>
      <button type="button" className={`${s.glass} ${s.chev} ${s.chevPrev}`} onClick={onPrev} aria-label="Fitur sebelumnya">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <div className={`${s.glass} ${s.pill}`} style={width ? { width } : undefined}>
        <span key={label} className={s.pillText}>
          {label}
        </span>
        <span ref={measure} className={s.measure} aria-hidden>
          {label}
        </span>
      </div>
      <button type="button" className={`${s.glass} ${s.chev} ${s.chevNext}`} onClick={onNext} aria-label="Fitur berikutnya">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
