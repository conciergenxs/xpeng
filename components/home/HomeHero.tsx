"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { models, type ModelSlug } from "@/lib/vehicles";
import s from "./HomeHero.module.css";

type Slide = { slug: ModelSlug; video: string };

// Films live in assets/original and are copied into public/ by scripts/sync-original-media.mjs.
const slides: Slide[] = [
  { slug: "x9", video: "/media/x9/hero.mp4" },
  { slug: "g6", video: "/media/g6/hero.mp4" },
];

const sentence = (t: string) => `${t.charAt(0).toUpperCase()}${t.slice(1)}.`;

/** How long the outgoing film keeps playing underneath the crossfade. */
const FADE_MS = 1200;

export default function HomeHero() {
  // `active` follows the indicator immediately; `shown` swaps film and copy together once the film has a frame.
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [inView, setInView] = useState(true);
  const [reduce, setReduce] = useState(false);

  const section = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const fill = useRef<HTMLSpanElement>(null);
  const lastActive = useRef(active);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Start the target film; reveal it (with its copy) as soon as it can paint a frame.
  useEffect(() => {
    const v = videos.current[active];
    if (!v) return;
    if (lastActive.current !== active) {
      v.currentTime = 0;
      lastActive.current = active;
    }
    // Rewinding starts a seek, which can drop readyState, so wait for whichever signal comes first.
    const events = ["loadeddata", "seeked", "playing"] as const;
    const reveal = () => {
      if (v.readyState < 2) return;
      setShown(active);
      events.forEach((e) => v.removeEventListener(e, reveal));
    };
    events.forEach((e) => v.addEventListener(e, reveal));
    reveal();
    if (!reduce && inView) v.play().catch(() => {});
    else v.pause();
    return () => events.forEach((e) => v.removeEventListener(e, reveal));
  }, [active, inView, reduce]);

  // Pause the outgoing film once it has faded out.
  useEffect(() => {
    const t = window.setTimeout(() => {
      videos.current.forEach((v, i) => i !== shown && v?.pause());
    }, FADE_MS);
    return () => window.clearTimeout(t);
  }, [shown]);

  // The active bar mirrors the playing film; when the loop wraps, move to the next slide.
  useEffect(() => {
    const bar = fill.current;
    if (reduce) {
      bar?.style.setProperty("--p", "1");
      return;
    }
    let raf = 0;
    let last = 0;
    const tick = () => {
      const v = videos.current[active];
      if (v && v.duration && active === shown) {
        const p = v.currentTime / v.duration;
        if (p + 0.5 < last) {
          setActive((a) => (a + 1) % slides.length);
          return;
        }
        last = p;
        fill.current?.style.setProperty("--p", p.toFixed(4));
      } else {
        fill.current?.style.setProperty("--p", "0");
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, shown, reduce]);

  const current = models[slides[shown].slug];
  const target = slides[active];

  return (
    <section ref={section} className={`${s.hero} dark`} aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        XPENG Indonesia: explore, compare and order your XPENG online
      </h1>

      <div className={s.media} aria-hidden>
        {slides.map((sl, i) => (
          <video
            key={sl.slug}
            ref={(el) => {
              videos.current[i] = el;
            }}
            className={`${s.video} ${i === shown ? s.videoOn : ""}`}
            src={sl.video}
            muted
            loop
            playsInline
            autoPlay={i === 0}
            preload={i === 0 ? "auto" : "metadata"}
            onPlaying={() => {
              // Once the first film is running, start buffering the other one.
              if (i === 0) videos.current.forEach((v, j) => j !== 0 && v && (v.preload = "auto"));
            }}
            tabIndex={-1}
          />
        ))}
        <div className={s.scrim} />
      </div>

      <div className={`wrap ${s.inner}`}>
        <div className={s.copy} key={current.slug}>
          <p className={s.eyebrow}>New {current.shortName}</p>
          <h2 className={s.headline}>{sentence(current.tagline)}</h2>
        </div>

        <div className={s.controls}>
          <div className={s.indicator} role="group" aria-label="Hero films">
            {slides.map((sl, i) => {
              const on = i === active;
              return (
                <button
                  key={sl.slug}
                  type="button"
                  className={`${s.step} ${on ? s.stepOn : ""}`}
                  aria-label={`Show the New ${models[sl.slug].shortName}`}
                  aria-current={on ? "true" : undefined}
                  onClick={() => setActive(i)}
                >
                  <span className={s.track}>
                    <span ref={on ? fill : undefined} className={s.fill} />
                  </span>
                </button>
              );
            })}
          </div>
          <Link href={`/models/${target.slug}/`} className={`btn btn-light ${s.explore}`}>
            Explore<span className="sr-only"> the New {models[target.slug].shortName}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
