"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Img from "@/components/Img";
import Segmented from "@/components/Segmented";
import { models, variantsFor, type ModelSlug } from "@/lib/vehicles";
import s from "./VehicleShowcase.module.css";

/**
 * Official xpeng.com 360° turntable sprites: 36 frames side by side, 10° apart, frame 0 = left profile.
 * `body` is the car's measured outline in frame 0 (left, right, ground), as fractions of the frame,
 * excluding the soft ground shadow. Every frame shares the sprite's scale, so one placement fits all 36.
 */
const SPRITES: Record<ModelSlug, { desktop: string; mobile: string; body: { l: number; r: number; b: number } }> = {
  x9: { desktop: "/media/x9/360-sprite.png", mobile: "/media/x9/360-sprite.png", body: { l: 0.14, r: 0.9, b: 0.8457 } },
  g6: { desktop: "/media/g6/360-sprite.png", mobile: "/media/g6/360-sprite-m.png", body: { l: 0.1133, r: 0.87, b: 0.825 } },
};
const FRAMES = 36;
const MOBILE = "(max-width: 760px)";

/**
 * The car area is shaped around the car rather than the photo frame: at 90% length, the tallest of the
 * 36 views needs ~0.36 of the area's width above the ground line and ~0.05 below it (wheels plus ring).
 * Keep AREA_RATIO in sync with the aspect-ratio of .carArea in the stylesheet.
 */
const CAR_LENGTH = 0.9; // side profile length, as a share of the area's width
const AREA_RATIO = 2.44; // area width / height
const GROUND = 0.878; // ground line, as a share of the area's height
const FRAME_RATIO = 350 / 750; // sprite frame height / width (same for both models)

const mod = (n: number) => ((n % FRAMES) + FRAMES) % FRAMES;

/** Place a sprite frame so the car's measured side profile spans CAR_LENGTH, centred, standing on GROUND. */
function placement({ l, r, b }: { l: number; r: number; b: number }): React.CSSProperties {
  const k = CAR_LENGTH / (r - l); // frame width as a share of the area's width
  const kh = k * FRAME_RATIO * AREA_RATIO; // frame height as a share of the area's height
  return {
    width: `${k * 100}%`,
    height: `${kh * 100}%`,
    left: `${(0.5 - (k * (l + r)) / 2) * 100}%`,
    top: `${(GROUND - kh * b) * 100}%`,
  };
}

export default function VehicleShowcase() {
  const [slug, setSlug] = useState<ModelSlug>("x9");
  const [loaded, setLoaded] = useState<Partial<Record<ModelSlug, boolean>>>({});
  const [angle, setAngle] = useState(0);

  const car = useRef<HTMLDivElement>(null);
  const pos = useRef(0); // fractional frame, so drags and momentum stay smooth
  const drag = useRef<{ id: number; x: number; start: number; lastX: number; lastT: number; v: number } | null>(null);
  const spin = useRef(0);

  const model = models[slug];
  const sprite = SPRITES[slug];
  const maxRange = Math.max(...variantsFor(slug).map((v) => v.rangeKm));

  const paint = useCallback((p: number) => {
    pos.current = p;
    const f = mod(Math.round(p));
    car.current?.style.setProperty("--frame", String(f));
  }, []);

  // Preload the current model's sprite first, then the other, at the size this screen uses.
  useEffect(() => {
    const mobile = window.matchMedia(MOBILE).matches;
    const order: ModelSlug[] = ["x9", "g6"];
    let cancelled = false;
    (async () => {
      for (const m of order) {
        const src = mobile ? SPRITES[m].mobile : SPRITES[m].desktop;
        // decode() resolves once the strip can paint, so a large sprite never shows a blank first frame.
        const img = new Image();
        img.src = src;
        await img.decode().catch(() => {});
        if (!cancelled) setLoaded((l) => ({ ...l, [m]: true }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => cancelAnimationFrame(spin.current), []);

  const settle = () => setAngle(mod(Math.round(pos.current)) * 10);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(spin.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, start: pos.current, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // Dragging across roughly the car's width turns it once; dragging right brings the front towards you.
    const pxPerFrame = Math.max(6, e.currentTarget.clientWidth / 40);
    paint(d.start - (e.clientX - d.x) / pxPerFrame);
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.v = (-(e.clientX - d.lastX) / pxPerFrame / dt) * 0.6 + d.v * 0.4;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    // A pause before release means no flick; a hard flick coasts about a third of a turn at most.
    let v = e.timeStamp - d.lastT > 80 ? 0 : Math.max(-0.08, Math.min(0.08, d.v));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) v = 0;
    let last = performance.now();
    const glide = (t: number) => {
      const dt = t - last;
      last = t;
      v *= Math.pow(0.9, dt / 16);
      paint(pos.current + v * dt);
      if (Math.abs(v) > 0.002) spin.current = requestAnimationFrame(glide);
      else settle();
    };
    spin.current = requestAnimationFrame(glide);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: 1, ArrowRight: -1, ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (step === undefined && e.key !== "Home") return;
    e.preventDefault();
    cancelAnimationFrame(spin.current);
    paint(e.key === "Home" ? 0 : Math.round(pos.current) + (step ?? 0));
    settle();
  };

  return (
    <section className={s.section} aria-labelledby="showcase-title">
      <div className={`wrap ${s.inner}`}>
        <div className={s.head}>
          <h2 id="showcase-title" className={s.title}>
            XPENG mana yang cocok untuk Anda?
          </h2>
          <p className={s.sub}>
            New X9 yang lega untuk tujuh orang, atau G6 yang sporty. Putar mobilnya, lalu lihat detailnya.
          </p>
          <div className={s.toggle}>
            <Segmented
              label="Model"
              hideLabel
              value={slug}
              onChange={setSlug}
              options={[
                { value: "x9", label: "New X9" },
                { value: "g6", label: "G6" },
              ]}
            />
          </div>
        </div>

        <div className={s.stage}>
          {/* Same fixed box for both models: switching never moves anything around it. */}
          <div className={s.carArea}>
            <p className={s.bigLabel} aria-hidden key={`label-${slug}`}>
              {model.shortName}
            </p>
            <span className={s.floor} aria-hidden />
            {!loaded[slug] && (
              <Img src={model.silhouette} alt="" sizes="(max-width: 760px) 80vw, 720px" className={s.placeholder} />
            )}
            <div
              key={slug}
              ref={(el) => {
                car.current = el;
                el?.style.setProperty("--frame", String(mod(Math.round(pos.current))));
              }}
              className={`${s.car} ${loaded[slug] ? s.carReady : ""}`}
              style={
                {
                  ...placement(sprite.body),
                  "--sprite": `url(${sprite.desktop})`,
                  "--sprite-m": `url(${sprite.mobile})`,
                } as React.CSSProperties
              }
              role="slider"
              tabIndex={0}
              aria-label={`Putar ${model.name}. Geser ke samping atau gunakan tombol panah.`}
              aria-valuemin={0}
              aria-valuemax={350}
              aria-valuenow={angle}
              aria-valuetext={`Sudut pandang ${angle} derajat`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
            />
          </div>

          <p className={s.hint} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6" />
              <path d="M17.7 2.8v3.8h-3.8M6.3 21.2v-3.8h3.8" />
            </svg>
            360°
          </p>
        </div>

        <div className={s.foot} key={`foot-${slug}`}>
          <div className={s.ident}>
            <h3 className={s.name}>{model.name}</h3>
            <p className={s.type}>{model.bodyType}</p>
          </div>
          <dl className={s.specs}>
            <div>
              <dt className={s.label}>Jarak tempuh (NEDC)</dt>
              <dd className={s.value}>
                <span className={s.pre}>Hingga</span>
                {maxRange} km
              </dd>
            </div>
            <div>
              <dt className={s.label}>Kursi</dt>
              <dd className={s.value}>{model.seats}</dd>
            </div>
            <div>
              <dt className={s.label}>Pengisian daya</dt>
              <dd className={s.value}>{model.charge}</dd>
            </div>
          </dl>
          <div className={s.ctas}>
            <Link href={`/order/?model=${slug}`} className={`btn ${s.cta}`}>
              Pesan sekarang
            </Link>
            <Link href={`/models/${slug}/`} className={`btn btn-ghost ${s.cta}`}>
              Jelajahi {model.name}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
