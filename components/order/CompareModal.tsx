"use client";

import { useState } from "react";
import Img from "@/components/Img";
import Select from "@/components/Select";
import { fromPrice, getVariant, modelList, variantsFor, type Model, type ModelSlug, type Variant, type VariantId } from "@/lib/vehicles";
import { mm, num, rupiah } from "@/lib/format";
import s from "./order.module.css";

type Props = { current: ModelSlug; ref: React.RefObject<HTMLDialogElement | null> };

/** All from the official data in lib/vehicles. With a variant chosen, its own figures; until then, the
 *  model's span across its variants. */
const n = (x: number) => num(x);
const span = (lo: number, hi: number, unit: string) => (lo === hi ? `${n(lo)} ${unit}` : `${n(lo)}–${n(hi)} ${unit}`);
const ROWS: { label: string; value: (m: Model, v?: Variant) => string }[] = [
  { label: "Harga OTR Jakarta", value: (m, v) => (v ? rupiah(v.price) : `Mulai ${rupiah(fromPrice(m.slug))}`) },
  { label: "Pilihan varian", value: (m) => String(variantsFor(m.slug).length) },
  {
    label: "Jarak tempuh (NEDC)",
    value: (m, v) => {
      if (v) return v.rangeLabel;
      const r = variantsFor(m.slug).map((x) => x.rangeKm);
      return span(Math.min(...r), Math.max(...r), "km");
    },
  },
  {
    label: "0–100 km/jam",
    value: (m, v) => (v ? `${n(v.accel)} dtk` : `Tercepat ${n(Math.min(...variantsFor(m.slug).map((x) => x.accel)))} dtk`),
  },
  {
    label: "Penggerak",
    value: (m, v) => v?.drivetrain ?? [...new Set(variantsFor(m.slug).map((x) => x.drivetrain))].join(" atau "),
  },
  { label: "Pengisian cepat DC", value: (m) => m.charge },
  { label: "Kursi", value: (m) => String(m.seats) },
  { label: "Panjang × lebar × tinggi", value: (m) => `${n(m.lengthMm)} × ${n(m.widthMm)} × ${mm(m.heightMm)}` },
  { label: "Jarak sumbu roda", value: (m) => mm(m.wheelbaseMm) },
  { label: "Bagasi maksimum", value: (m) => `${n(m.cargoMaxL)} L` },
  { label: "Layar", value: (m) => m.screens },
];

/**
 * X9 and G6 side by side in a modal, for information only: it never changes the order. A variant picker above
 * each column's price shows that variant's own figures. A native dialog: Escape and the backdrop close it,
 * focus stays inside.
 */
export default function CompareModal({ current, ref }: Props) {
  const close = () => ref.current?.close();
  const [picked, setPicked] = useState<Partial<Record<ModelSlug, VariantId>>>({});

  return (
    <dialog
      ref={ref}
      className={s.modal}
      aria-labelledby="compare-models-title"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className={s.modalHead}>
        <h2 id="compare-models-title" className={s.modalTitle}>
          X9 atau G6?
        </h2>
        <button type="button" className={s.modalClose} onClick={close} aria-label="Tutup perbandingan">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className={s.modalBody}>
        <table className={s.cmp}>
          <caption className="sr-only">Perbandingan New X9 dan G6</caption>
          <thead>
            <tr>
              <td />
              {modelList.map((m) => (
                <th key={m.slug} scope="col" className={m.slug === current ? s.cmpOn : undefined}>
                  <span className={s.cmpCar}>
                    <Img src={m.silhouette} alt="" sizes="(max-width: 640px) 45vw, 360px" />
                  </span>
                  <span className={s.cmpName}>{m.name}</span>
                  <span className={s.cmpType}>{m.bodyType}</span>
                  <Select
                    className={s.cmpSelect}
                    label={`Varian ${m.name}`}
                    placeholder="Pilih varian"
                    value={picked[m.slug] ?? null}
                    onChange={(id) => setPicked((p) => ({ ...p, [m.slug]: id }))}
                    options={variantsFor(m.slug).map((v) => ({ value: v.id, label: v.name, detail: rupiah(v.price) }))}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                {modelList.map((m) => (
                  <td key={m.slug} className={m.slug === current ? s.cmpOn : undefined}>
                    {r.value(m, picked[m.slug] && getVariant(picked[m.slug]!))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </dialog>
  );
}
