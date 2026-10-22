"use client";

import { useId } from "react";
import s from "./Segmented.module.css";

type Option<T> = { value: T; label: React.ReactNode; hint?: React.ReactNode };

type Props<T extends string | number> = {
  label: string;
  hideLabel?: boolean;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  tone?: "light" | "dark";
  size?: "md" | "lg";
};

/** A radio group drawn as a segmented track; arrow keys move between options natively. */
export default function Segmented<T extends string | number>({
  label,
  hideLabel,
  options,
  value,
  onChange,
  tone = "light",
  size = "md",
}: Props<T>) {
  const name = useId();
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  return (
    <fieldset className={`${s.root} ${tone === "dark" ? s.dark : ""} ${size === "lg" ? s.lg : ""}`}>
      <legend className={hideLabel ? "sr-only" : s.legend}>{label}</legend>
      <div
        className={s.track}
        style={{ "--n": options.length, "--i": index } as React.CSSProperties}
      >
        <span className={s.thumb} aria-hidden />
        {options.map((o) => (
          <label key={String(o.value)} className={`${s.option} ${o.value === value ? s.on : ""}`}>
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={o.value === value}
              onChange={() => onChange(o.value)}
            />
            <span className={s.optLabel}>{o.label}</span>
            {o.hint && <span className={s.hint}>{o.hint}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
