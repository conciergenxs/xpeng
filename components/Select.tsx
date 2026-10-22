"use client";

import { useEffect, useId, useRef, useState } from "react";
import s from "./Select.module.css";

type Option<T extends string> = { value: T; label: string; detail?: string };

type Props<T extends string> = {
  /** Accessible name, e.g. "New X9 variant". */
  label: string;
  placeholder: string;
  options: Option<T>[];
  value: T | null;
  onChange: (v: T) => void;
  className?: string;
};

/**
 * A pill that opens a rounded list, in place of the browser's select menu. Arrow keys, Home and End move
 * through the options, Enter or Space chooses, Escape closes the list only (never a dialog around it), and a
 * click outside closes it.
 */
export default function Select<T extends string>({ label, placeholder, options, value, onChange, className }: Props<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  const show = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  };
  const pick = (i: number) => {
    onChange(options[i].value);
    close();
  };

  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) return;
    e.preventDefault();
    show();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    const move = { ArrowDown: Math.min(last, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: last }[e.key];
    if (move !== undefined) {
      e.preventDefault();
      setActive(move);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Escape") {
      // Stops the surrounding dialog's own Escape.
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={root} className={`${s.root} ${open ? s.open : ""} ${className ?? ""}`}>
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      <button
        ref={button}
        type="button"
        className={s.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? close() : show())}
        onKeyDown={onButtonKey}
      >
        <span id={`${id}-value`} className={selected ? s.value : s.placeholder}>
          {selected?.label ?? placeholder}
        </span>
        <svg className={s.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <ul
        ref={list}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        className={s.list}
        inert={!open}
        onKeyDown={onListKey}
      >
        {options.map((o, i) => (
          <li
            key={o.value}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={o.value === value}
            className={`${s.option} ${i === active ? s.active : ""}`}
            onPointerEnter={() => setActive(i)}
            onClick={() => pick(i)}
          >
            <span className={s.optText}>
              <span className={s.optLabel}>{o.label}</span>
              {o.detail && <span className={s.optDetail}>{o.detail}</span>}
            </span>
            <svg className={s.tick} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3.5 8.3 6.6 11.3 12.5 5" />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
}
