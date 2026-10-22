"use client";

import { useId } from "react";
import s from "./RangeField.module.css";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: React.ReactNode;
  minLabel?: string;
  maxLabel?: string;
  valueText?: string;
};

export default function RangeField({ label, value, min, max, step, onChange, display, minLabel, maxLabel, valueText }: Props) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={s.field}>
      <div className={s.head}>
        <label htmlFor={id} className={s.label}>
          {label}
        </label>
        <output htmlFor={id} className={s.value}>
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className={s.range}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
      />
      {(minLabel || maxLabel) && (
        <div className={s.ends} aria-hidden>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
