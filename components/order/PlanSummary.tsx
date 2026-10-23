import { getVariant } from "@/lib/vehicles";
import { cashQuote, financeQuote, leaseQuote, type PlanState } from "@/lib/payment";
import { num, rupiah } from "@/lib/format";
import s from "./order.module.css";

/** The chosen plan as definition rows; shared by review and confirmation. */
export default function PlanSummary({ variantId, plan }: { variantId: string; plan: PlanState }) {
  const price = getVariant(variantId)!.price;

  if (plan.kind === "cash") {
    const q = cashQuote(price, plan.cash);
    return (
      <dl className={s.summaryList}>
        <div>
          <dt>Cara bayar</dt>
          <dd>Tunai</dd>
        </div>
        <div>
          <dt>Harga mobil, OTR Jakarta</dt>
          <dd>{rupiah(q.price)}</dd>
        </div>
        {plan.cash.insurance && (
          <div>
            <dt>Asuransi, tahun pertama</dt>
            <dd className="est">{rupiah(q.insurance)}</dd>
          </div>
        )}
        <div>
          <dt>Total</dt>
          <dd>{rupiah(q.total)}</dd>
        </div>
      </dl>
    );
  }

  if (plan.kind === "finance") {
    const q = financeQuote(price, plan.finance);
    return (
      <dl className={s.summaryList}>
        <div>
          <dt>Cara bayar</dt>
          <dd>Kredit</dd>
        </div>
        <div>
          <dt>Uang muka</dt>
          <dd>
            {rupiah(q.dp)} ({plan.finance.dpPct}%)
          </dd>
        </div>
        <div>
          <dt>Tenor dan bunga</dt>
          <dd>
            {plan.finance.tenor} bulan, <span className="est">{num(plan.finance.rate, 2)}% flat</span>
          </dd>
        </div>
        <div>
          <dt>Cicilan per bulan</dt>
          <dd className="est">{rupiah(q.monthly)}</dd>
        </div>
        <div>
          <dt>Total pembayaran pertama (TDP)</dt>
          <dd className="est">{rupiah(q.tdp)}</dd>
        </div>
      </dl>
    );
  }

  const q = leaseQuote(price, plan.lease);
  return (
    <dl className={s.summaryList}>
      <div>
        <dt>Cara bayar</dt>
        <dd>Sewa (konsep)</dd>
      </div>
      <div>
        <dt>Kontrak</dt>
        <dd>
          {plan.lease.term} bulan, {num(plan.lease.mileage)} km per tahun
        </dd>
      </div>
      <div>
        <dt>Sewa per bulan</dt>
        <dd className="est">{rupiah(q.monthly)}</dd>
      </div>
      <div>
        <dt>Pembayaran awal</dt>
        <dd className="est">{rupiah(q.initial)}</dd>
      </div>
    </dl>
  );
}
