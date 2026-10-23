"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Img from "@/components/Img";
import { getVariant, models, modelList, variants, type Model, type Variant, type VariantId } from "@/lib/vehicles";
import { monthlyFrom } from "@/lib/payment";
import { rupiah, rupiahShort, mm, num } from "@/lib/format";
import s from "./CompareTool.module.css";

type Row = {
  label: string;
  value: (v: Variant, m: Model) => string;
  num?: (v: Variant, m: Model) => number;
  better?: "high" | "low";
  est?: boolean;
};

const SECTIONS: { id: string; title: string; rows: Row[] }[] = [
  {
    id: "sec-price",
    title: "Harga",
    rows: [
      { label: "OTR Jakarta", value: (v) => rupiah(v.price), num: (v) => v.price },
      { label: "Cicilan mulai", value: (v) => `${rupiahShort(monthlyFrom(v.price))}/bulan`, est: true },
    ],
  },
  {
    id: "sec-performance",
    title: "Jarak dan performa",
    rows: [
      { label: "Jarak tempuh (NEDC)", value: (v) => v.rangeLabel, num: (v) => v.rangeKm, better: "high" },
      { label: "0–100 km/jam", value: (v) => `${num(v.accel)} dtk`, num: (v) => v.accel, better: "low" },
      { label: "Penggerak", value: (v) => v.drivetrain },
    ],
  },
  {
    id: "sec-charging",
    title: "Pengisian daya",
    rows: [
      { label: "10–80% dengan DC", value: () => "12 mnt" },
      { label: "Pengisian cepat DC (puncak)", value: (v) => `${num(v.dcKw)} kW`, num: (v) => v.dcKw, better: "high" },
    ],
  },
  {
    id: "sec-size",
    title: "Dimensi dan ruang",
    rows: [
      { label: "Kursi", value: (_, m) => String(m.seats) },
      { label: "Panjang", value: (_, m) => mm(m.lengthMm), num: (_, m) => m.lengthMm },
      { label: "Lebar", value: (_, m) => mm(m.widthMm) },
      { label: "Tinggi", value: (_, m) => mm(m.heightMm) },
      { label: "Jarak sumbu roda", value: (_, m) => mm(m.wheelbaseMm), num: (_, m) => m.wheelbaseMm },
      { label: "Bagasi maksimum", value: (_, m) => `${num(m.cargoMaxL)} L`, num: (_, m) => m.cargoMaxL, better: "high" },
    ],
  },
  {
    id: "sec-cabin",
    title: "Kabin dan teknologi",
    rows: [{ label: "Layar", value: (_, m) => m.screens }],
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
          <h1 className="headline">Bandingkan model</h1>
          <p className="lede">
            Letakkan hingga tiga varian berdampingan. Bilah di tiap baris memperlihatkan selisihnya dalam sekali lihat.
          </p>
        </div>
        <label className={s.diffToggle}>
          <input type="checkbox" role="switch" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
          <span>Sembunyikan yang sama</span>
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
                  <span className="sr-only">Hapus {v.fullName}</span>
                </button>
              )}
              <p className={s.slotModel} aria-hidden>
                {m.name}
              </p>
              <div className={s.selectWrap}>
                <label className="sr-only" htmlFor={`slot-${i}`}>
                  Pilihan {i + 1}
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
                  Pesan
                </Link>
                <Link href={`/models/${v.model}/`} className={`link small ${s.explore}`}>
                  Jelajahi
                </Link>
              </div>
            </div>
          ))}
          {slots.length < MAX && (
            <div className={`${s.slot} ${s.addSlot}`}>
              <button type="button" className={s.add} onClick={add}>
                <span aria-hidden className={s.plus}>+</span>
                Tambah varian
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
            <section key={sec.id} className={s.section} aria-labelledby={sec.id}>
              <h2 id={sec.id} className={s.sectionTitle}>
                {sec.title}
              </h2>
              <table className={s.table} style={cols}>
                <caption className="sr-only">{sec.title}</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Spesifikasi</th>
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
                              {isBest && <span className="sr-only"> (paling unggul di perbandingan ini)</span>}
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
            {hidden} baris yang sama disembunyikan.{" "}
            <button type="button" className="link" onClick={() => setDiffOnly(false)}>
              Tampilkan semua
            </button>
          </p>
        )}

        {!(diffOnly && sameModel) && (
        <>
        <section className={s.section} aria-labelledby="sec-signature">
          <h2 id="sec-signature" className={s.sectionTitle}>
            Fitur khas
          </h2>
          <div className={s.featureGrid} style={cols}>
            <span aria-hidden />
            {picked.map(({ m }, i) => (
              <ul key={i} className={s.features} aria-label={`Fitur khas ${m.name}`}>
                {m.signature.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        <section className={s.section} aria-labelledby="sec-fit">
          <h2 id="sec-fit" className={s.sectionTitle}>
            Paling cocok untuk
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
          Harga OTR Jakarta dan spesifikasi mengacu pada xpeng.co.id, Oktober 2026. Angka cicilan adalah simulasi
          dengan DP 30% dan tenor 36 bulan pada suku bunga ilustratif. Siluet mobil digambar sesuai skala.
        </p>
      </div>
    </div>
  );
}
