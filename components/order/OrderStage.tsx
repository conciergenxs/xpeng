"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import CarTurntable, { type CarTurntableHandle } from "@/components/CarTurntable";
import Img from "@/components/Img";
import InViewVideo from "@/components/InViewVideo";
import { RotateIcon } from "@/components/model/PaintStage";
import { paintsFor, type GalleryItem, type GalleryTab, type Model, type Paint, type Variant } from "@/lib/vehicles";
import { num } from "@/lib/format";
import s from "./OrderStage.module.css";

type Tab = "overview" | "exterior" | GalleryTab;

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Ringkasan" },
  { id: "exterior", label: "Eksterior" },
  { id: "interior", label: "Interior" },
  { id: "tech", label: "Teknologi" },
  { id: "comfort", label: "Kenyamanan" },
];
const GALLERY: GalleryTab[] = ["interior", "tech", "comfort"];
const isGallery = (t: Tab): t is GalleryTab => (GALLERY as Tab[]).includes(t);

/** Resting angles on the official 360° sequence: three-quarter front for the overview, side profile for paint. */
const OVERVIEW_FRAME = 32;
const EXTERIOR_FRAME = 0;

type Props = { model: Model; variant: Variant; paint: Paint; onPaint: (paintId: string) => void };

/**
 * The car as currently specified, beside the order panel. Overview and Exterior show the shared 360° turntable
 * (Exterior adds the paint swatches); Interior, Tech and Ride Comfort switch to the model's official photos and
 * films. Galleries mount on first visit, so their media loads only when asked for.
 */
export default function OrderStage({ model, variant, paint, onPaint }: Props) {
  const ids = useId();
  const [tab, setTab] = useState<Tab>("overview");
  const [carReady, setCarReady] = useState(false); // the 360° car is on screen, not its loading state
  const [visited, setVisited] = useState<Set<Tab>>(() => new Set<Tab>(["overview"]));
  const [slides, setSlides] = useState<Record<GalleryTab, number>>({ interior: 0, tech: 0, comfort: 0 });
  const car = useRef<CarTurntableHandle>(null);

  // A gallery tab keeps the last angle, so returning to the car never jolts it.
  const [rest, setRest] = useState(OVERVIEW_FRAME);

  // Another model starts each gallery from its first slide.
  useEffect(() => setSlides({ interior: 0, tech: 0, comfort: 0 }), [model.slug]);

  const choose = (t: Tab) => {
    setTab(t);
    setVisited((v) => (v.has(t) ? v : new Set(v).add(t)));
    if (t === "overview") setRest(OVERVIEW_FRAME);
    if (t === "exterior") setRest(EXTERIOR_FRAME);
  };
  const go = (t: GalleryTab, i: number) => {
    const n = model.gallery[t].length;
    setSlides((sl) => ({ ...sl, [t]: (i + n) % n }));
  };

  const is360 = !isGallery(tab);
  const simulated = paint.turntable?.simulated;

  return (
    <aside className={s.stage} aria-label="Mobil Anda">
      <div id={`${ids}-panel`} role="tabpanel" aria-labelledby={`${ids}-tab-${tab}`} className={s.media}>
        <div className={`${s.view} ${s.view360} ${is360 ? s.viewOn : ""}`} aria-hidden={!is360} inert={!is360}>
          <div className={s.carWrap}>
            <span className={s.bigLabel} aria-hidden>
              {model.shortName}
            </span>
            <CarTurntable
              key={model.slug}
              ref={car}
              className={s.car}
              paints={model.paints}
              body={model.paintBody}
              modelName={model.name}
              paintId={paint.id}
              frame={rest}
              sizes="(max-width: 960px) 100vw, 60vw"
              hideUntilReady
              onReady={setCarReady}
            />
          </div>
          <p className={`${s.cue} ${carReady ? "" : s.cueHidden}`} aria-hidden={!carReady}>
            <RotateIcon />
            <span>{tab === "exterior" ? paint.name : "Geser untuk memutar 360°"}</span>
            {/* Recoloured from the official sequence: said plainly, so it is never taken for XPENG imagery. */}
            {simulated && <span className={s.simulated}>Warna simulasi</span>}
          </p>
        </div>

        {GALLERY.map(
          (t) =>
            visited.has(t) && (
              <div key={`${model.slug}-${t}`} className={`${s.view} ${tab === t ? s.viewOn : ""}`} aria-hidden={tab !== t} inert={tab !== t}>
                <Gallery
                  items={model.gallery[t]}
                  index={slides[t]}
                  active={tab === t}
                  label={`${model.name} ${TABS.find((x) => x.id === t)!.label.toLowerCase()}`}
                  onIndex={(i) => go(t, i)}
                />
              </div>
            ),
        )}
      </div>

      <div className={s.controls}>
        <MediaTabs ids={ids} tab={tab} onChange={choose} />

        {/* One row, the same height for each tab, so switching never moves the tabs. */}
        <div className={s.sub}>
          {tab === "overview" && (
            <dl key="facts" className={s.facts}>
              <div className={s.factVariant}>
                <dt>Varian</dt>
                <dd>{variant.name}</dd>
              </div>
              <div>
                <dt>Jarak tempuh</dt>
                <dd>{variant.rangeLabel}</dd>
              </div>
              <div>
                <dt>0–100 km/jam</dt>
                <dd>{num(variant.accel)} dtk</dd>
              </div>
              <div>
                <dt>Kursi</dt>
                <dd>{model.seats}</dd>
              </div>
            </dl>
          )}

          {tab === "exterior" && (
            <fieldset key="paint" className={s.swatches}>
              <legend className="sr-only">Warna</legend>
              {paintsFor(variant.id).map((p) => (
                <label key={p.id} className={s.swatch} title={p.name} onPointerEnter={() => car.current?.warm(p.id)}>
                  <input
                    type="radio"
                    name={`${ids}-paint`}
                    className="sr-only"
                    checked={p.id === paint.id}
                    onChange={() => onPaint(p.id)}
                    onFocus={() => car.current?.warm(p.id)}
                  />
                  <span className={s.dot} style={{ background: p.swatch }} aria-hidden />
                  <span className="sr-only">{p.name}</span>
                </label>
              ))}
            </fieldset>
          )}

          {isGallery(tab) && (
            <div key={tab} className={s.pager} role="group" aria-label="Slide">
              {model.gallery[tab].map((it, i) => (
                <button
                  key={it.title}
                  type="button"
                  className={`${s.page} ${i === slides[tab] ? s.pageOn : ""}`}
                  aria-label={`${i + 1} dari ${model.gallery[tab].length}: ${it.title}`}
                  aria-current={i === slides[tab] ? "true" : undefined}
                  onClick={() => go(tab, i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/** Tabs on a track, the active one marked by a white thumb that slides to it. Scrolls sideways on phones. */
function MediaTabs({ ids, tab, onChange }: { ids: string; tab: Tab; onChange: (t: Tab) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const b = el.querySelector<HTMLElement>('[aria-selected="true"]');
      if (b) setThumb({ x: b.offsetLeft, w: b.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab]);

  // Keep the active tab in view when the track scrolls, without scrolling the page.
  useEffect(() => {
    const el = track.current;
    const b = el?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!el || !b || el.scrollWidth <= el.clientWidth) return;
    if (b.offsetLeft < el.scrollLeft || b.offsetLeft + b.offsetWidth > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: b.offsetLeft - (el.clientWidth - b.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [tab]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    const n = step ? (i + step + TABS.length) % TABS.length : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : -1;
    if (n < 0) return;
    e.preventDefault();
    onChange(TABS[n].id);
    track.current?.querySelectorAll<HTMLElement>('[role="tab"]')[n]?.focus();
  };

  return (
    <div ref={track} role="tablist" aria-label="Galeri" className={s.tabs} onKeyDown={onKeyDown}>
      <span
        className={s.thumb}
        style={thumb ? { transform: `translateX(${thumb.x}px)`, width: thumb.w } : { opacity: 0 }}
        aria-hidden
      />
      {TABS.map((t) => (
        <button
          key={t.id}
          id={`${ids}-tab-${t.id}`}
          type="button"
          role="tab"
          aria-selected={t.id === tab}
          aria-controls={`${ids}-panel`}
          tabIndex={t.id === tab ? 0 : -1}
          className={`${s.tab} ${t.id === tab ? s.tabOn : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

type GalleryProps = { items: GalleryItem[]; index: number; active: boolean; label: string; onIndex: (i: number) => void };

/** Crossfading slides with a caption; films play only while their slide is on screen. Swipe on touch screens. */
function Gallery({ items, index, active, label, onIndex }: GalleryProps) {
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const sw = swipe.current;
    swipe.current = null;
    if (!sw || sw.id !== e.pointerId) return;
    const dx = e.clientX - sw.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - sw.y)) onIndex(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div className={s.frame} role="group" aria-roledescription="korsel" aria-label={label} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {items.map((it, i) => (
        <div
          key={it.title}
          className={`${s.slide} ${i === index ? s.slideOn : ""}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} dari ${items.length}`}
          aria-hidden={i !== index}
          inert={i !== index}
        >
          {it.video ? (
            <InViewVideo className={s.fill} mp4={it.video.mp4} poster={it.video.poster} label={it.title} active={active && i === index} />
          ) : (
            <Img src={it.image} alt={it.title} sizes="(max-width: 960px) 100vw, 60vw" className={s.fill} />
          )}
          <div className={s.caption}>
            <p className={s.capTitle}>{it.title}</p>
            <p className={s.capText}>{it.text}</p>
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <>
          <button type="button" className={`${s.arrow} ${s.prev}`} aria-label="Slide sebelumnya" onClick={() => onIndex(index - 1)}>
            <Chevron flip />
          </button>
          <button type="button" className={`${s.arrow} ${s.next}`} aria-label="Slide berikutnya" onClick={() => onIndex(index + 1)}>
            <Chevron />
          </button>
        </>
      )}
    </div>
  );
}

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
