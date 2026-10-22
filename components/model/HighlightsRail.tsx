"use client";

import { useEffect, useRef, useState } from "react";
import Img from "@/components/Img";
import type { Feature } from "@/lib/vehicles";
import s from "./HighlightsRail.module.css";

export default function HighlightsRail({ items, title }: { items: Feature[]; title: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setIndex(cards.indexOf(e.target as HTMLElement));
        });
      },
      { root: el, threshold: 0.6 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const go = (i: number) => {
    const el = rail.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    const inset = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    el.scrollTo({ left: card.offsetLeft - inset, behavior: "smooth" });
  };

  return (
    <div className={s.root}>
      <div className={`wrap ${s.head}`}>
        <h2 className="headline">{title}</h2>
        <div className={s.controls}>
          <button type="button" className={s.arrow} onClick={() => go(Math.max(0, index - 1))} disabled={index === 0} aria-label="Previous highlight">
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            className={s.arrow}
            onClick={() => go(Math.min(items.length - 1, index + 1))}
            disabled={index === items.length - 1}
            aria-label="Next highlight"
          >
            <span aria-hidden>›</span>
          </button>
        </div>
      </div>
      <ul ref={rail} className={s.rail} tabIndex={0} aria-label="Highlights, scroll horizontally">
        {items.map((h, i) => (
          <li key={h.title} className={s.card} aria-current={i === index ? "true" : undefined}>
            <Img src={h.image} alt="" sizes="(max-width: 760px) 86vw, 64vw" className={s.img} />
            <div className={s.caption}>
              <h3 className={s.cardTitle}>{h.title}</h3>
              <p className="muted">{h.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
