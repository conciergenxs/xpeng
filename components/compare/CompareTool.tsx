"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Img from "@/components/Img";
import { getVariant, models, modelList, variants, type Model, type Variant, type VariantId } from "@/lib/vehicles";
import { monthlyFrom } from "@/lib/payment";
import { rupiah, rupiahShort, mm } from "@/lib/format";
import s from "./CompareTool.module.css";

type Row = {
  label: string;
  value: (v: Variant, m: Model) => string;
  num?: (v: Variant, m: Model) => number;
  better?: "high" | "low";
  est?: boolean;
};

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: "Price",
    rows: [
      { label: "OTR Jakarta", value: (v) => rupiah(v.price), num: (v) => v.price },
      { label: "Finance from", value: (v) => `${rupiahShort(monthlyFrom(v.price))}/month`, est: true },
    ],
  },
  {
    title: "Range and performance",
    rows: [
      { label: "Range (NEDC)", value: (v) => v.rangeLabel, num: (v) => v.rangeKm, better: "high" },
      { label: "0–100 km/h", value: (v) => `${v.accel} s`, num: (v) => v.accel, better: "low" },
      { label: "Drivetrain", value: (v) => v.drivetrain },
    ],
  },
  {
    title: "Charging",
    rows: [
      { label: "10–80% on DC", value: () => "12 min" },
      { label: "DC fast charging, peak", value: (v) => `${v.dcKw} kW`, num: (v) => v.dcKw, better: "high" },
    ],
  },
  {
    title: "Size and space",
    rows: [
      { label: "Seats", value: (_, m) => String(m.seats) },
      { label: "Length", value: (_, m) => mm(m.lengthMm), num: (_, m) => m.lengthMm },
      { label: "Width", value: (_, m) => mm(m.widthMm) },
      { label: "Height", value: (_, m) => mm(m.heightMm) },
      { label: "Wheelbase", value: (_, m) => mm(m.wheelbaseMm), num: (_, m) => m.wheelbaseMm },
      { label: "Cargo, maximum", value: (_, m) => `${m.cargoMaxL.toLocaleString("en-US")} L`, num: (_, m) => m.cargoMaxL, better: "high" },
    ],
  },
  {
    title: "Cabin and technology",
    rows: [{ label: "Screens", value: (_, m) => m.screens }],
  },
];

const DEFAULTS: VariantId[] = ["x9-lr-pro", "g6-pro-awd"];
const MAX = 3;

export default function CompareTool() {
  const params = useSearchParams();
  const [slots, setSlots] = useState<VariantId[]>(DEFAULTS);
  const [diffOnly, setDiffOnly] = useState(false);
  const [compact, setCompact] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromUrl = ["a", "b", "c"].map((k) => getVariant(params.get(k))?.id).filter(Boolean) as VariantId[];
    if (fromUrl.length === 1) {
      // Arriving from a model page: pair it with the other model's equivalent.
      const other = variants.find((v) => v.model !== getVariant(fromUrl[0])!.model)!;
      setSlots([fromUrl[0], other.id]);
    } else if (fromUrl.length > 1) setSlots(fromUrl.slice(0, MAX));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const qs = slots.map((id, i) => `${"abc"[i]}=${id}`).join("&");
    window.history.replaceState(null, "", `?${qs}`);
  }, [slots]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const picked = slots.map((id) => {
    const v = getVariant(id)!;
    return { v, m: models[v.model] };
  });
  const longest = Math.max(...modelList.map((m) => m.lengthMm));
  const sameModel = picked.every((p) => p.m.slug === picked[0].m.slug);
  const setSlot = (i: number, id: VariantId) => setSlots((s) => s.map((x, j) => (j === i ? id : x)));
  const remove = (i: number) => setSlots((s) => s.filter((_, j) => j !== i));
  const add = () => {
    const unused = variants.find((v) => !slots.includes(v.id));
    if (unused) setSlots((s) => [...s, unused.id]);
  };

  const cols = { "--cols": slots.length + (slots.length < MAX ? 1 : 0), "--n": slots.length } as React.CSSProperties;
  let hidden = 0;

  return (
    <div className={s.root}>
      <div className={`wrap ${s.intro}`}>
        <div>
          <h1 className="headline">Compare models</h1>
          <p className="lede">
            Pick up to three variants. Bars show how each one measures against the others in the same row.
          </p>
        </div>
        <label className={s.diffToggle}>
          <input type="checkbox" role="switch" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
          <span>Only show differences</span>
        </label>
      </div>

      <div ref={sentinel} aria-hidden />

      <div className={`${s.head} ${compact ? s.compact : ""}`}>
        <div className={`wrap ${s.grid}`} style={cols}>
          <div className={s.labelCol} aria-hidden />
          {picked.map(({ v, m }, i) => (
            <div key={i} className={s.slot}>
              <div className={s.slotCar} aria-hidden>
                <span style={{ width: `${(m.lengthMm / longest) * 100}%` }}>
                  <Img src={m.silhouette} alt="" sizes="(max-width: 760px) 45vw, 25vw" />
                </span>
              </div>
              {slots.length > 2 && (
                <button type="button" className={s.remove} onClick={() => remove(i)}>
                  <span aria-hidden>×</span>
                  <span className="sr-only">Remove {v.fullName}</span>
                </button>
              )}
              <p className={s.slotModel} aria-hidden>
                {m.name}
              </p>
              <div className={s.selectWrap}>
                <label className="sr-only" htmlFor={`slot-${i}`}>
                  Car {i + 1}
                </label>
                <select id={`slot-${i}`} value={v.id} onChange={(e) => setSlot(i, e.target.value as VariantId)}>
                  {modelList.map((mm) => (
                    <optgroup key={mm.slug} label={mm.name}>
                      {variants
                        .filter((x) => x.model === mm.slug)
                        .map((x) => (
                          <option key={x.id} value={x.id} aria-label={x.fullName}>
                            {x.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <p className={s.slotPrice}>{rupiah(v.price)}</p>
              <div className={s.slotCtas}>
                <Link href={`/order/?model=${v.model}&variant=${v.id}`} className="btn btn-sm">
                  Order
                </Link>
                <Link href={`/models/${v.model}/`} className={`link small ${s.explore}`}>
                  Explore
                </Link>
              </div>
            </div>
          ))}
          {slots.length < MAX && (
            <div className={`${s.slot} ${s.addSlot}`}>
              <button type="button" className={s.add} onClick={add}>
                <span aria-hidden className={s.plus}>+</span>
                Add a car
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`wrap ${s.body}`}>
        {SECTIONS.map((sec) => {
          const rows = sec.rows.filter((r) => {
            const vals = picked.map(({ v, m }) => r.value(v, m));
            const same = vals.every((x) => x === vals[0]);
            if (diffOnly && same) {
              hidden++;
              return false;
            }
            return true;
          });
          if (!rows.length) return null;
          return (
            <section key={sec.title} className={s.section} aria-labelledby={`sec-${sec.title}`}>
              <h2 id={`sec-${sec.title}`} className={s.sectionTitle}>
                {sec.title}
              </h2>
              <table className={s.table} style={cols}>
                <caption className="sr-only">{sec.title}</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Specification</th>
                    {picked.map(({ v }, i) => (
                      <th key={i} scope="col">
                        {v.fullName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const nums = r.num ? picked.map(({ v, m }) => r.num!(v, m)) : null;
                    const max = nums ? Math.max(...nums) : 0;
                    const best = nums && r.better ? (r.better === "high" ? Math.max(...nums) : Math.min(...nums)) : null;
                    const allSame = nums ? nums.every((n) => n === nums[0]) : false;
                    return (
                      <tr key={r.label} className={s.row}>
                        <th scope="row">{r.label}</th>
                        {picked.map(({ v, m }, i) => {
                          const n = nums?.[i];
                          const isBest = best !== null && n === best && !allSame;
                          return (
                            <td key={i} className={isBest ? s.best : undefined}>
                              <span className={r.est ? "est" : undefined}>{r.value(v, m)}</span>
                              {isBest && <span className="sr-only"> (best in this comparison)</span>}
                              {n !== undefined && (
                                <span className={s.bar} aria-hidden>
                                  <span
                                    style={{
                                      width: `${
                                        r.better === "low" ? (Math.min(...nums!) / n) * 100 : (n / max) * 100
                                      }%`,
                                    }}
                                  />
                                </span>
                              )}
                            </td>
                          );
                        })}
                        {slots.length < MAX && <td className={s.addSlot} aria-hidden />}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}

        {diffOnly && hidden > 0 && (
          <p className={s.hiddenNote}>
            {hidden} identical {hidden === 1 ? "row is" : "rows are"} hidden.{" "}
            <button type="button" className="link" onClick={() => setDiffOnly(false)}>
              Show all
            </button>
          </p>
        )}

        {!(diffOnly && sameModel) && (
        <>
        <section className={s.section} aria-labelledby="sec-signature">
          <h2 id="sec-signature" className={s.sectionTitle}>
            Signature features
          </h2>
          <div className={s.featureGrid} style={cols}>
            <span aria-hidden />
            {picked.map(({ m }, i) => (
              <ul key={i} className={s.features} aria-label={`${m.name} signature features`}>
                {m.signature.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        <section className={s.section} aria-labelledby="sec-fit">
          <h2 id="sec-fit" className={s.sectionTitle}>
            Best suited to
          </h2>
          <div className={s.featureGrid} style={cols}>
            <span aria-hidden />
            {picked.map(({ m }, i) => (
              <p key={i} className={s.fit}>
                {m.bestFor}
              </p>
            ))}
          </div>
        </section>
        </>
        )}

        <p className="fine">
          Prices OTR Jakarta and specifications as published on xpeng.co.id, October 2026. Finance figures are a
          simulation with 30% down over 36 months at an illustrative rate. Silhouettes are drawn to scale.
        </p>
      </div>
    </div>
  );
}
