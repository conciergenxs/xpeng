"use client";

import { useEffect, useRef, useState } from "react";
import s from "./InViewVideo.module.css";

type Props = {
  mp4: string;
  webm?: string;
  poster: string;
  label: string;
  className?: string;
  /** False pauses it, e.g. when it sits in a hidden tab. Defaults to true. */
  active?: boolean;
};

/** Muted loop that only plays while on screen, with a visible pause control. */
export default function InViewVideo({ mp4, webm, poster, label, className, active = true }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!active) {
      v.pause();
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setUserPaused(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !userPaused) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [userPaused, active]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      v.play().catch(() => {});
    } else {
      setUserPaused(true);
      v.pause();
    }
  };

  return (
    <div className={`${s.wrap} ${className ?? ""}`}>
      <video
        ref={ref}
        className={s.video}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={mp4} type="video/mp4" />
        {webm && <source src={webm} type="video/webm" />}
      </video>
      <button type="button" className={s.control} onClick={toggle} tabIndex={active ? undefined : -1}>
        <span aria-hidden className={playing ? s.pauseIcon : s.playIcon} />
        <span className="sr-only">{playing ? "Jeda video" : "Putar video"}</span>
      </button>
    </div>
  );
}
