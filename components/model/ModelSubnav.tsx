"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import s from "./ModelSubnav.module.css";

type Props = { name: string; slug: string; links: { id: string; label: string }[] };

/** Floating glass pill at the bottom of the screen: model name, section tabs and Order now. It appears once the
 *  hero has been scrolled past and leaves again on the way back up, or when the footer reaches it. */
export default function ModelSubnav({ name, slug, links }: Props) {
  const dock = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = links.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [links]);

  // Visibility, checked once per frame while scrolling. Showing and hiding use different hero thresholds, so
  // small scroll movements at the boundary never toggle it back and forth.
  useEffect(() => {
    const hero = document.getElementById("model-title")?.closest("section");
    const page = dock.current?.parentElement;
    if (!hero || !page) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const vh = window.innerHeight;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const pageBottom = page.getBoundingClientRect().bottom;
      setVisible((on) => (on ? heroBottom < vh * 0.4 && pageBottom >= vh - 4 : heroBottom < vh * 0.25 && pageBottom >= vh + 24));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // When the tabs scroll sideways (phones), keep the active one in view.
  useEffect(() => {
    const ul = tabs.current;
    const a = active && ul?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!ul || !a || ul.scrollWidth <= ul.clientWidth) return;
    const offset = a.getBoundingClientRect().left - ul.getBoundingClientRect().left + ul.scrollLeft;
    ul.scrollTo({ left: offset - (ul.clientWidth - a.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      ref={dock}
      className={`${s.dock} ${visible ? s.dockOn : ""} no-print`}
      aria-label={`Bagian halaman ${name}`}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className={s.pill}>
        <a href="#top" className={s.name}>
          {name}
        </a>
        <span className={s.divider} aria-hidden />
        <ul ref={tabs} className={s.links}>
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} aria-current={active === l.id ? "true" : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <span className={s.divider} aria-hidden />
        <Link href={`/order/?model=${slug}`} className={`btn btn-light btn-sm ${s.cta}`}>
          Pesan
        </Link>
      </div>
    </nav>
  );
}
