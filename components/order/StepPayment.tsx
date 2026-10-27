"use client";

import Segmented from "@/components/Segmented";
import RangeField from "@/components/RangeField";
import Tween from "@/components/Tween";
import { getVariant } from "@/lib/vehicles";
import {
  ASSUMPTIONS,
  cashQuote,
  financeQuote,
  leaseQuote,
  planSummary,
  type PlanKind,
  type PlanState,
} from "@/lib/payment";
import { num, rupiah, rupiahShort } from "@/lib/format";
import type { OrderState } from "@/lib/order";
import s from "./order.module.css";

type Props = { order: OrderState; update: (p: Partial<OrderState>) => void };

const F = ASSUMPTIONS.finance;
const L = ASSUMPTIONS.lease;

export default function StepPayment({ order, update }: Props) {
  const variant = getVariant(order.variantId)!;
  const price = variant.price;
  const plan = order.plan;
  const setPlan = (patch: Partial<PlanState>) => update({ plan: { ...plan, ...patch } });

  const cash = cashQuote(price, plan.cash);
  const fin = financeQuote(price, plan.finance);
  const lease = leaseQuote(price, plan.lease);
  const sum = planSummary(price, plan);

  return (
    <>
      <h2 id="step-title" className="headline">
        Pilih cara bayar.
      </h2>
      <fieldset className={s.group}>
        <legend className="sr-only">Cara bayar</legend>
        <div className={s.plans}>
          {(
            [
              { kind: "cash", label: "Tunai", figure: rupiahShort(cash.total), est: false },
              { kind: "finance", label: "Kredit", figure: `${rupiahShort(fin.monthly)}/bln`, est: true },
              { kind: "lease", label: "Sewa (konsep)", figure: `${rupiahShort(lease.monthly)}/bln`, est: true },
            ] as { kind: PlanKind; label: string; figure: string; est: boolean }[]
          ).map((o) => (
            <label key={o.kind} className={`${s.plan} ${plan.kind === o.kind ? s.selected : ""}`}>
              <input
                type="radio"
                name="plan"
                className="sr-only"
                checked={plan.kind === o.kind}
                onChange={() => setPlan({ kind: o.kind })}
              />
              <span className={s.planName}>{o.label}</span>
              <span className={s.planFigure}>
                <span className={o.est ? "est" : undefined}>{o.figure}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {plan.kind === "cash" && (
        <div className={s.planBody}>
          <div className={s.figureBlock}>
            <p className={s.bigEyebrow}>Total tunai</p>
            <p className={s.bigFigure}>
              <Tween value={cash.total} format={rupiah} />
            </p>
            <p className={s.bigLabel}>Dilunasi sebelum mobil diserahkan</p>
          </div>

          <label className={s.toggleRow}>
            <span>
              <span className={s.toggleTitle}>Sertakan asuransi all risk tahun pertama</span>
              <span className={s.toggleHint}>
                Kira-kira {num(ASSUMPTIONS.insuranceRate * 100, 1)}% dari harga mobil. Bisa juga memakai asuransi pilihan Anda sendiri.
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              className={s.switch}
              checked={plan.cash.insurance}
              onChange={(e) => setPlan({ cash: { insurance: e.target.checked } })}
            />
          </label>

          <h3 className={`${s.groupLabel} ${s.breakdownHead}`}>Rinciannya</h3>
          <dl className={s.breakdown}>
            <div>
              <dt>Harga mobil, OTR Jakarta</dt>
              <dd>{rupiah(cash.price)}</dd>
            </div>
            {plan.cash.insurance && (
              <div>
                <dt>Asuransi all risk, tahun pertama</dt>
                <dd className="est">{rupiah(cash.insurance)}</dd>
              </div>
            )}
            <div className={s.total}>
              <dt>Total</dt>
              <dd>{rupiah(cash.total)}</dd>
            </div>
            <div>
              <dt>Uang tanda jadi, dibayar hari ini</dt>
              <dd className="est">{rupiah(cash.dueToday)}</dd>
            </div>
            <div>
              <dt>Sisa pelunasan, sebelum serah terima</dt>
              <dd>{rupiah(cash.balance)}</dd>
            </div>
          </dl>
          <p className={s.hint}>
            Di luar Jakarta, harga OTR bisa berbeda karena pajak daerah (BBNKB). Konsultan kami akan menyampaikan angka
            pasti untuk kota Anda.
          </p>
        </div>
      )}

      {plan.kind === "finance" && (
        <div className={s.planBody}>
          <div className={s.figureBlock}>
            <p className={s.bigEyebrow}>Cicilan per bulan</p>
            <p className={s.bigFigure}>
              <span className="est">
                <Tween value={fin.monthly} format={rupiah} />
              </span>
            </p>
            <p className={s.bigLabel}>
              selama {plan.finance.tenor} bulan <span className="sim-tag">Simulasi</span>
            </p>
          </div>

          <div className={s.controls}>
            <RangeField
              label="Uang muka (DP)"
              value={plan.finance.dpPct}
              min={F.dpMin}
              max={F.dpMax}
              step={5}
              onChange={(dpPct) => setPlan({ finance: { ...plan.finance, dpPct } })}
              display={
                <>
                  {plan.finance.dpPct}% <span className={s.valueSub}>{rupiahShort(fin.dp)}</span>
                </>
              }
              valueText={`${plan.finance.dpPct} persen, ${rupiah(fin.dp)}`}
              minLabel={`${F.dpMin}%`}
              maxLabel={`${F.dpMax}%`}
            />
            <Segmented
              label="Tenor"
              value={plan.finance.tenor}
              onChange={(tenor: number) => setPlan({ finance: { ...plan.finance, tenor } })}
              options={F.tenors.map((t) => ({ value: t, label: `${t / 12} thn`, hint: `${t} bln` }))}
            />
            <RangeField
              label="Bunga flat per tahun"
              value={plan.finance.rate}
              min={F.rateMin}
              max={F.rateMax}
              step={0.25}
              onChange={(rate) => setPlan({ finance: { ...plan.finance, rate } })}
              display={`${num(plan.finance.rate, 2)}%`}
              valueText={`${num(plan.finance.rate, 2)} persen flat per tahun`}
              minLabel={`${F.rateMin}%`}
              maxLabel={`${F.rateMax}%`}
            />
          </div>

          <h3 className={`${s.groupLabel} ${s.breakdownHead}`}>Rinciannya</h3>
          <dl className={s.breakdown}>
            <div>
              <dt>Uang muka</dt>
              <dd>{rupiah(fin.dp)}</dd>
            </div>
            <div>
              <dt>Pokok pinjaman</dt>
              <dd>{rupiah(fin.principal)}</dd>
            </div>
            <div>
              <dt>Total bunga selama {plan.finance.tenor} bulan</dt>
              <dd className="est">{rupiah(fin.interest)}</dd>
            </div>
            <div>
              <dt>Biaya administrasi</dt>
              <dd className="est">{rupiah(fin.admin)}</dd>
            </div>
            <div className={s.total}>
              <dt>
                Total pembayaran pertama (TDP)
                <span className={s.dtHint}>Uang muka, biaya administrasi, dan cicilan pertama yang dibayar di depan (ADDM)</span>
              </dt>
              <dd className="est">{rupiah(fin.tdp)}</dd>
            </div>
            <div>
              <dt>Total dibayar sampai lunas</dt>
              <dd className="est">{rupiah(fin.totalPaid)}</dd>
            </div>
          </dl>
          <p className={s.hint}>
            Kredit diajukan melalui mitra pembiayaan dan perlu disetujui lebih dulu. Umumnya Anda perlu menyiapkan KTP,
            KK, NPWP, dan bukti penghasilan. Bunga di sini hanya ilustrasi, bukan penawaran.
          </p>
        </div>
      )}

      {plan.kind === "lease" && (
        <div className={s.planBody}>
          <div className={s.figureBlock}>
            <p className={s.bigEyebrow}>Sewa per bulan</p>
            <p className={s.bigFigure}>
              <span className="est">
                <Tween value={lease.monthly} format={rupiah} />
              </span>
            </p>
            <p className={s.bigLabel}>
              selama {plan.lease.term} bulan <span className="sim-tag">Ilustrasi konsep</span>
            </p>
          </div>

          <div className={s.controls}>
            <Segmented
              label="Masa kontrak"
              value={plan.lease.term}
              onChange={(term: number) => setPlan({ lease: { ...plan.lease, term } })}
              options={L.terms.map((t) => ({ value: t, label: `${t} bulan` }))}
            />
            <Segmented
              label="Jarak tempuh per tahun"
              value={plan.lease.mileage}
              onChange={(mileage: number) => setPlan({ lease: { ...plan.lease, mileage } })}
              options={L.mileages.map((m) => ({ value: m, label: `${num(m)} km` }))}
            />
          </div>

          <h3 className={`${s.groupLabel} ${s.breakdownHead}`}>Rinciannya</h3>
          <dl className={s.breakdown}>
            <div>
              <dt>
                Deposit jaminan
                <span className={s.dtHint}>Senilai {L.depositMonths} bulan sewa, dikembalikan di akhir kontrak</span>
              </dt>
              <dd className="est">{rupiah(lease.deposit)}</dd>
            </div>
            <div>
              <dt>Sewa bulan pertama</dt>
              <dd className="est">{rupiah(lease.monthly)}</dd>
            </div>
            <div className={s.total}>
              <dt>Pembayaran awal</dt>
              <dd className="est">{rupiah(lease.initial)}</dd>
            </div>
            <div>
              <dt>Total sewa selama {plan.lease.term} bulan</dt>
              <dd className="est">{rupiah(lease.totalPaid)}</dd>
            </div>
          </dl>

          <div className={s.includes}>
            <h3 className={s.groupLabel}>Contoh cakupan sewa bulanan</h3>
            <ul>
              <li>Servis berkala di bengkel resmi XPENG</li>
              <li>Asuransi all risk</li>
              <li>Perpanjangan STNK dan pajak kendaraan tahunan</li>
              <li>Bantuan darurat di jalan, 24 jam</li>
            </ul>
          </div>
          <p className={s.hint}>
            Seluruh skema sewa ini adalah ilustrasi konsep, bukan penawaran. Program, mitra, tarif, pembayaran awal,
            opsi mengembalikan atau mengganti mobil di akhir kontrak, serta biaya kelebihan jarak tempuh (contoh:{" "}
            {rupiah(L.excessKm)}/km) belum resmi dan masih perlu divalidasi oleh XPENG Indonesia.
          </p>
        </div>
      )}

      {/* Side-by-side: every plan, same car, same moment */}
      <div className={s.compareWrap}>
        <h3 className={s.groupLabel}>Tiga cara bayar, mobil yang sama</h3>
        <div className={s.compareScroll}>
          <table className={s.compareTable}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Aspek</span>
                </th>
                {(["cash", "finance", "lease"] as const).map((k) => (
                  <th key={k} scope="col" className={plan.kind === k ? s.colOn : undefined}>
                    <button type="button" onClick={() => setPlan({ kind: k })} aria-pressed={plan.kind === k}>
                      {k === "cash" ? "Tunai" : k === "finance" ? "Kredit" : "Sewa (konsep)"}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Dibayar di awal</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>{rupiahShort(sum.cash.upfront)}</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.finance.upfront)}</span>
                </td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.lease.upfront)}</span>
                </td>
              </tr>
              <tr>
                <th scope="row">Per bulan</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>Tidak ada</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.finance.monthly)}</span>
                </td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.lease.monthly)}</span>
                </td>
              </tr>
              <tr>
                <th scope="row">Jangka waktu</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>Sekali bayar</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>{sum.finance.months} bulan</td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>{sum.lease.months} bulan</td>
              </tr>
              <tr>
                <th scope="row">Total selama periode</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>{rupiahShort(sum.cash.total)}</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.finance.total)}</span>
                </td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.lease.total)}</span>
                </td>
              </tr>
              <tr>
                <th scope="row">Di akhir periode</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>Mobil milik Anda</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>Mobil milik Anda</td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>Kembalikan atau ganti baru</td>
              </tr>
              <tr>
                <th scope="row">Cocok bila</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>Ingin total biaya paling rendah</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>Ingin mencicil, lalu memiliki</td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>Ingin biaya pasti, tanpa urusan jual kembali</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
