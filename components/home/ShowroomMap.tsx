"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Img from "@/components/Img";
import { showrooms, FIND_US_URL, type Showroom } from "@/lib/showrooms";
import s from "./ShowroomMap.module.css";

type Region = Showroom["region"];

// Same projection and crop as scripts/build-map.py, which drew /media/map/indonesia.svg.
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const project = (lng: number, lat: number) => [(lng - 94) * 100, ((merc(7) - merc(lat)) * 100 * 180) / Math.PI];
const [CX0, CY0] = project(94.6, 6.4);
const [CX1, CY1] = project(126.8, -11.2);
/** Position on the static map, as percentages of its box. */
const onMap = (lng: number, lat: number) => {
  const [x, y] = project(lng, lat);
  return { left: `${((x - CX0) / (CX1 - CX0)) * 100}%`, top: `${((y - CY0) / (CY1 - CY0)) * 100}%` };
};

/** Areas in find-us order; each marker sits at the mean position of its showrooms. */
type Side = "right" | "left" | "above" | "below";
/** Label sides chosen to clear neighbours (Bandung sits ~120 km from Jakarta, ~270 km from Semarang) and, for
 *  Surabaya, the detail card to its east. */
const SIDE: Record<Region, Side> = { Jakarta: "left", Bandung: "below", Semarang: "above", Surabaya: "below", Batam: "right" };

const REGIONS: { id: Region; rooms: Showroom[]; pos: { left: string; top: string }; side: Side }[] = (
  [...new Set(showrooms.map((r) => r.region))] as Region[]
).map((id) => {
  const rooms = showrooms.filter((r) => r.region === id);
  const lng = rooms.reduce((a, r) => a + r.lng, 0) / rooms.length;
  const lat = rooms.reduce((a, r) => a + r.lat, 0) / rooms.length;
  return { id, rooms, pos: onMap(lng, lat), side: SIDE[id] };
});

const tabLabel = (r: Showroom) => r.name.replace(/^XPENG /, "").replace(/^Surabaya /, "");

export default function ShowroomMap() {
  const [selectedId, setSelectedId] = useState("pondok-indah");
  const selected = showrooms.find((r) => r.id === selectedId)!;
  const region = REGIONS.find((g) => g.id === selected.region)!;
  const hasTabs = region.rooms.length > 1;

  return (
    <section id="showrooms" className={s.section} aria-labelledby="showrooms-title">
      <div className={`wrap ${s.grid}`}>
        {/* Static illustration; markers pick an area. */}
        <div className={s.map}>
          <div className={s.mapBox}>
            <img src="/media/map/indonesia.svg" alt="" className={s.mapImg} width={3220} height={1769} />
            {REGIONS.map((g) => {
              const on = g.id === region.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`${s.marker} ${on ? s.markerOn : ""} ${s[g.side]}`}
                  style={g.pos}
                  aria-pressed={on}
                  aria-label={`${g.id}: ${g.rooms.length} showroom`}
                  onClick={() => setSelectedId(g.rooms[0].id)}
                >
                  <span className={s.dot} aria-hidden />
                  <span className={s.markerLabel} aria-hidden>
                    {g.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={s.copy}>
          <h2 id="showrooms-title" className="headline">
            Lihat langsung, lalu coba sendiri.
          </h2>
          <p className={s.sub}>Datangi showroom XPENG untuk melihat mobilnya dari dekat, test drive, atau berbincang dengan tim kami.</p>
        </div>

        {/* The slot keeps its height when an area has one showroom, so nothing jumps. */}
        <div className={s.tabsSlot}>
          {hasTabs && (
            <ShowroomTabs
              key={region.id}
              label={`Showroom di ${region.id}`}
              rooms={region.rooms}
              value={selected.id}
              onChange={setSelectedId}
            />
          )}
        </div>

        <aside className={s.card} aria-labelledby="showroom-card-title" aria-live="polite">
          <div className={s.cardMedia}>
            <Img src="/media/home/bento-cover" alt="Staf XPENG menunjukkan mobil kepada pelanggan" sizes="400px" className={s.cardImg} />
          </div>
          <div className={s.cardBody} key={selected.id}>
            <h3 id="showroom-card-title" className={s.cardName}>
              {selected.name}
            </h3>
            <p className={s.cardCity}>{selected.city}</p>
            <dl className={s.rows}>
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
                <dt className="sr-only">Alamat</dt>
                <dd className={s.address}>{selected.address}</dd>
              </div>
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <dt className={s.rowLabel}>Jam operasional</dt>
                <dd>{selected.hours}</dd>
              </div>
            </dl>
          </div>
          <a className={`btn ${s.cta}`} href={FIND_US_URL} target="_blank" rel="noreferrer">
            Lihat detail
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
            <span className="sr-only"> (membuka xpeng.co.id)</span>
          </a>
        </aside>
      </div>
    </section>
  );
}

/** One light-grey track; a white pill slides to the selected name, sized to its label. */
function ShowroomTabs({
  label,
  rooms,
  value,
  onChange,
}: {
  label: string;
  rooms: Showroom[];
  value: string;
  onChange: (id: string) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = track.current?.querySelector<HTMLButtonElement>(`[data-id="${value}"]`);
    if (!el) return;
    setThumb({ left: el.offsetLeft, width: el.offsetWidth });
    // Keep the chosen tab visible when the bar scrolls sideways on narrow screens.
    const sc = track.current?.parentElement;
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollTo({ left: el.offsetLeft - (sc.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
  }, [value]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = rooms.findIndex((r) => r.id === value);
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = rooms[(i + step + rooms.length) % rooms.length];
    onChange(next.id);
    track.current?.querySelector<HTMLButtonElement>(`[data-id="${next.id}"]`)?.focus();
  };

  return (
    <div className={s.tabsScroll}>
      <div ref={track} className={s.tabs} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
        {thumb && <span className={s.thumb} style={{ transform: `translateX(${thumb.left}px)`, width: thumb.width }} aria-hidden />}
        {rooms.map((r) => {
          const on = r.id === value;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              data-id={r.id}
              className={`${s.tab} ${on ? s.tabOn : ""}`}
              onClick={() => onChange(r.id)}
            >
              {tabLabel(r)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
