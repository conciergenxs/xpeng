"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import Img from "@/components/Img";
import type { CarBody, Paint } from "@/lib/vehicles";
import s from "./CarTurntable.module.css";

/**
 * Same turntable as the homepage showcase: the car area is shaped around the car, and every image (studio shot
 * or 360° sprite frame) is placed from its measured outline so the side profile spans CAR_LENGTH, centred,
 * standing on GROUND. Studio shots and sprite frame 0 share that angle, so the two line up when they crossfade.
 * Keep AREA_RATIO in sync with the aspect-ratio of .area in the stylesheet.
 */
const FRAMES = 36;
const CAR_LENGTH = 0.9;
const AREA_RATIO = 2.44;
const GROUND = 0.878;
const FRAME_RATIO = 350 / 750; // image height / width: sprite frames and studio shots alike
const MOBILE = "(max-width: 760px)";

const mod = (n: number) => ((n % FRAMES) + FRAMES) % FRAMES;

function placement({ l, r, b }: CarBody): React.CSSProperties {
  const k = CAR_LENGTH / (r - l);
  const kh = k * FRAME_RATIO * AREA_RATIO;
  return {
    width: `${k * 100}%`,
    height: `${kh * 100}%`,
    left: `${(0.5 - (k * (l + r)) / 2) * 100}%`,
    top: `${(GROUND - kh * b) * 100}%`,
  };
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const preloaded = new Set<string>();

/** Start downloading a paint's 360° sprite ahead of time, e.g. when the pointer rests on another model. */
export function preloadTurntable(paint: Paint) {
  if (!paint.turntable) return;
  const src = window.matchMedia(MOBILE).matches ? paint.turntable.mobile : paint.turntable.sprite;
  if (preloaded.has(src)) return;
  preloaded.add(src);
  new Image().src = src;
}

export type CarTurntableHandle = {
  /** Start loading a paint's sprite, or its studio shot when it has none, e.g. while its swatch is hovered. */
  warm: (paintId: string) => void;
};

type Props = {
  paints: Paint[];
  body: CarBody;
  modelName: string;
  /** The paint to show. A change keeps the angle, crossfading once the next sequence has decoded. */
  paintId: string;
  /** Resting angle, as a sprite frame (10° each). The car turns there once it can, and whenever it changes. */
  frame?: number;
  sizes?: string;
  className?: string;
  /** Only ever show the chosen paint's own 360° sequence: no studio shots, and a white loading state (or a
   *  retry, if it fails) whenever that sequence is not decoded yet, on first load, on a model switch (a new
   *  instance) and on a colour change alike. The car first appears straight at `frame`. */
  hideUntilReady?: boolean;
  /** Called with true once the car is on screen, and false while the loading state shows. */
  onReady?: (ready: boolean) => void;
  ref?: React.Ref<CarTurntableHandle>;
};

/**
 * Colour turntable. Every paint with a 360° sequence turns on drag or with the arrow keys; a paint without a
 * sequence shows its studio shot. Only the opening paint's sprite loads, as the car approaches the viewport.
 */
export default function CarTurntable({
  paints,
  body,
  modelName,
  paintId,
  frame,
  sizes = "(max-width: 760px) 100vw, 940px",
  className,
  hideUntilReady,
  onReady,
  ref,
}: Props) {
  const current = paints.find((p) => p.id === paintId) ?? paints[0];
  const [shown, setShown] = useState(current.id); // the paint on screen; follows `current` once its image is ready
  const [rendered, setRendered] = useState(() => new Set([current.id])); // studio shots in the DOM
  const [ready, setReady] = useState<Record<string, boolean>>({}); // decoded 360° sprites
  const [angle, setAngle] = useState(0);
  const [failed, setFailed] = useState(false); // hideUntilReady: the chosen paint's sprite could not load

  const root = useRef<HTMLDivElement>(null);
  const spins = useRef(new Map<string, HTMLDivElement>()); // turntable elements, by paint
  const first = useRef(current.id).current; // the studio shot in the first render may load lazily
  const pos = useRef(0); // fractional frame, so drags and momentum stay smooth
  const drag = useRef<{ id: number; x: number; start: number; lastX: number; lastT: number; v: number } | null>(null);
  const spin = useRef(0);
  const pick = useRef(0); // latest colour choice, so a slower earlier one never lands after it
  const loads = useRef(new Map<string, Promise<boolean>>()); // sprite downloads, by paint
  const latest = useRef(current);
  latest.current = current;

  const spinning = paints.find((p) => p.id === shown && p.turntable && ready[p.id]);

  const paint = useCallback((p: number) => {
    pos.current = p;
    spins.current.forEach((el) => el.style.setProperty("--frame", String(mod(Math.round(p)))));
  }, []);
  const settle = () => setAngle(mod(Math.round(pos.current)) * 10);

  /** Download and decode a paint's sprite once, at the size this screen uses. Resolves true when it can paint,
   *  so a colour change never shows a blank frame. */
  const loadSprite = useCallback((p: Paint) => {
    let load = loads.current.get(p.id);
    if (!load && p.turntable) {
      const img = new Image();
      img.src = window.matchMedia(MOBILE).matches ? p.turntable.mobile : p.turntable.sprite;
      load = img.decode().then(
        () => (setReady((r) => ({ ...r, [p.id]: true })), true),
        () => false,
      );
      loads.current.set(p.id, load);
    }
    return load ?? Promise.resolve(false);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        loadSprite(latest.current).then((ok) => ok || setFailed(true));
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadSprite]);

  useEffect(() => () => cancelAnimationFrame(spin.current), []);

  /** Turn to a frame by the shorter way round. */
  const turnTo = (target: number) =>
    new Promise<void>((done) => {
      cancelAnimationFrame(spin.current);
      const from = pos.current;
      const delta = Math.round((from - target) / FRAMES) * FRAMES + target - from;
      if (Math.abs(delta) < 0.5 || reducedMotion()) {
        paint(target);
        settle();
        return done();
      }
      const ms = Math.min(900, 160 + Math.abs(delta) * 28);
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / ms);
        paint(from + delta * (1 - Math.pow(1 - k, 3)));
        if (k < 1) spin.current = requestAnimationFrame(step);
        else {
          paint(target);
          settle();
          done();
        }
      };
      spin.current = requestAnimationFrame(step);
    });

  const choose = async (p: Paint) => {
    const token = ++pick.current;
    // Strict: the chosen paint at once, shown only when its own sequence can turn; the latest choice wins.
    if (hideUntilReady) {
      setFailed(false);
      setShown(p.id);
      if (!(await loadSprite(p)) && token === pick.current) setFailed(true);
      return;
    }
    // Turning car to turning car: the current colour stays, at its angle, until the next one can replace it.
    if (spinning && p.turntable) {
      if ((await loadSprite(p)) && token === pick.current) setShown(p.id);
      return;
    }
    if (p.turntable) loadSprite(p);
    setRendered((r) => (r.has(p.id) ? r : new Set(r).add(p.id)));
    // A studio shot only exists at frame 0, so turn back there first.
    if (spinning && !p.turntable) await turnTo(0);
    // Wait for the next studio shot to decode, so the old one stays until the new one can replace it.
    await new Promise((r) => requestAnimationFrame(r));
    await root.current?.querySelector<HTMLImageElement>(`img[data-paint="${p.id}"]`)?.decode().catch(() => {});
    if (token === pick.current) setShown(p.id);
  };

  // Follow the chosen paint.
  const chosen = useRef(current.id);
  useEffect(() => {
    if (current.id === chosen.current) return;
    chosen.current = current.id;
    choose(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

  // Rest at `frame` once a sequence can turn, and turn there again whenever it changes. A car that was hidden
  // until now starts there, rather than turning into place as it appears.
  const rested = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (frame === undefined || !spinning || rested.current === frame) return;
    const first = rested.current === undefined;
    rested.current = frame;
    if (first && hideUntilReady) {
      paint(frame);
      settle();
    } else turnTo(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, spinning?.id]);

  useImperativeHandle(ref, () => ({
    warm(id) {
      const p = paints.find((x) => x.id === id);
      if (!p) return;
      if (p.turntable && (spinning || hideUntilReady)) loadSprite(p);
      else setRendered((r) => (r.has(p.id) ? r : new Set(r).add(p.id)));
    },
  }));

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
    if (reducedMotion()) v = 0;
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

  // Strict mode shows the car only while the chosen paint's sequence is the one on screen and decoded.
  const visible = !hideUntilReady || (!!spinning && spinning.id === current.id);
  useEffect(() => onReady?.(visible), [visible, onReady]);

  const retry = () => {
    loads.current.delete(current.id);
    setFailed(false);
    const token = pick.current;
    loadSprite(current).then((ok) => ok || token !== pick.current || setFailed(true));
  };

  return (
    <div ref={root} className={`${s.area} ${className ?? ""}`} aria-busy={!visible}>
      {!visible &&
        (failed ? (
          <span className={s.loading} role="status">
            <span className={s.loadingText}>Tampilan 360° {modelName} gagal dimuat.</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={retry}>
              Muat ulang
            </button>
          </span>
        ) : (
          <span className={s.loading} role="status">
            <span className={s.loadingBar} aria-hidden />
            <span className={s.loadingText}>Menyiapkan {modelName}</span>
          </span>
        ))}
      {/* The car layers: hidden at once, faded in together when ready; their own crossfades are untouched. */}
      <div className={`${s.stack} ${visible ? "" : s.pending}`}>
        <span className={s.floor} aria-hidden />
        {paints.map(
          (p) =>
            !hideUntilReady &&
            rendered.has(p.id) && (
              <Img
                key={p.id}
                data-paint={p.id}
                src={p.image}
                alt={p.id === shown && !spinning ? `${modelName} warna ${p.name}` : ""}
                aria-hidden={p.id !== shown || !!spinning}
                loading={p.id === first ? "lazy" : "eager"}
                sizes={sizes}
                className={`${s.shot} ${p.id === shown && !spinning ? s.on : ""}`}
                style={placement(body)}
              />
            ),
        )}
        {paints.map(
          (p) =>
            p.turntable && (
              <div
                key={`spin-${p.id}`}
                ref={(el) => {
                  if (!el) return void spins.current.delete(p.id);
                  spins.current.set(p.id, el);
                  el.style.setProperty("--frame", String(mod(Math.round(pos.current))));
                }}
                className={`${s.turntable} ${spinning?.id === p.id ? s.on : ""}`}
                style={
                  {
                    ...placement(p.turntable.body),
                    "--sprite": ready[p.id] ? `url(${p.turntable.sprite})` : "none",
                    "--sprite-m": ready[p.id] ? `url(${p.turntable.mobile})` : "none",
                  } as React.CSSProperties
                }
                {...(spinning?.id === p.id
                  ? {
                      role: "slider",
                      tabIndex: 0,
                      "aria-label": `Putar ${modelName} warna ${p.name}. Geser ke samping atau gunakan tombol panah.`,
                      "aria-valuemin": 0,
                      "aria-valuemax": 350,
                      "aria-valuenow": angle,
                      "aria-valuetext": `Sudut pandang ${angle} derajat`,
                      onPointerDown,
                      onPointerMove,
                      onPointerUp,
                      onPointerCancel: onPointerUp,
                      onKeyDown,
                    }
                  : { "aria-hidden": true })}
              />
            ),
        )}
      </div>
    </div>
  );
}
