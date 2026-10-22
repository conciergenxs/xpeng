"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import CarTurntable, { type CarTurntableHandle } from "@/components/CarTurntable";
import type { CarBody, Paint } from "@/lib/vehicles";
import s from "./PaintStage.module.css";

type Props = { id: string; title: string; modelName: string; slug: string; paints: Paint[]; body: CarBody };

/**
 * Colour stage around the shared turntable: every paint with a 360° sequence turns on drag, and a colour change
 * keeps the angle. Simulated sequences are labelled; for a paint without a sequence, the cue below the car says
 * which paint can be turned. The section takes on the paint's tint.
 */
export default function PaintStage({ id, title, modelName, slug, paints, body }: Props) {
  // Open on the paint with XPENG's own sequence, so the first view is the official one.
  const [current, setCurrent] = useState(
    () => paints.find((p) => p.turntable && !p.turntable.simulated) ?? paints.find((p) => p.turntable) ?? paints[0],
  );
  const car = useRef<CarTurntableHandle>(null);
  const turnable = paints.find((p) => p.turntable && !p.turntable.simulated) ?? paints.find((p) => p.turntable);

  return (
    <section id={id} className={s.stage} style={{ "--stage": current.stage } as React.CSSProperties} aria-labelledby={`${id}-title`}>
      <div className={`wrap ${s.head}`}>
        <h2 id={`${id}-title`} className="headline">
          {title}
        </h2>
      </div>

      <div className={`wrap ${s.body}`}>
        <CarTurntable ref={car} className={s.carArea} paints={paints} body={body} modelName={modelName} paintId={current.id} />

        {/* The 360° cue while the car turns; on a paint without a sequence, where the 360° view is instead. */}
        <div className={s.hint}>
          {current.turntable ? (
            <p>
              <RotateIcon />
              <span className={s.hintText}>Drag to explore 360°</span>
              {/* Recoloured from the official sequence: said plainly, so it is never taken for XPENG imagery. */}
              {current.turntable.simulated && (
                <span className={s.simulated}>Simulated colour</span>
              )}
            </p>
          ) : (
            turnable && (
              <button type="button" className={s.hintLink} onClick={() => setCurrent(turnable)}>
                <RotateIcon />
                360° view in {turnable.name}
              </button>
            )
          )}
        </div>
      </div>

      {/* One panel: the selected colour, the swatches, and ordering in that colour. */}
      <div className="wrap">
        <div className={s.picker}>
          <div className={s.selected} aria-live="polite">
            <p className={s.selectedLabel}>Selected colour</p>
            <p className={s.selectedName}>{current.name}</p>
            <p className={s.selectedText}>{current.description}</p>
          </div>
          <fieldset className={s.swatches}>
            <legend className="sr-only">Paint colour</legend>
            {paints.map((p) => (
              <label key={p.id} className={s.swatch} title={p.name} onPointerEnter={() => car.current?.warm(p.id)}>
                <input
                  type="radio"
                  name={`${id}-paint`}
                  className="sr-only"
                  checked={p.id === current.id}
                  onChange={() => setCurrent(p)}
                  onFocus={() => car.current?.warm(p.id)}
                />
                <span className={s.dot} style={{ background: p.swatch }} aria-hidden />
                <span className="sr-only">{p.name}</span>
              </label>
            ))}
          </fieldset>
          <Link className={s.order} href={`/order/?model=${slug}&paint=${current.id}`}>
            <span>Order in {current.name}</span>
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function RotateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6" />
      <path d="M17.7 2.8v3.8h-3.8M6.3 21.2v-3.8h3.8" />
    </svg>
  );
}
