import { getVariant } from "@/lib/vehicles";
import { cashQuote, financeQuote, leaseQuote, type PlanState } from "@/lib/payment";
import { rupiah } from "@/lib/format";
import s from "./order.module.css";

/** The chosen plan as definition rows; shared by review and confirmation. */
export default function PlanSummary({ variantId, plan }: { variantId: string; plan: PlanState }) {
  const price = getVariant(variantId)!.price;

  if (plan.kind === "cash") {
    const q = cashQuote(price, plan.cash);
    return (
      <dl className={s.summaryList}>
        <div>
          <dt>Plan</dt>
          <dd>Cash</dd>
        </div>
        <div>
          <dt>Vehicle price, OTR Jakarta</dt>
          <dd>{rupiah(q.price)}</dd>
        </div>
        {plan.cash.insurance && (
          <div>
            <dt>Insurance, year one</dt>
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
          <dt>Plan</dt>
          <dd>Finance</dd>
        </div>
        <div>
          <dt>Down payment</dt>
          <dd>
            {rupiah(q.dp)} ({plan.finance.dpPct}%)
          </dd>
        </div>
        <div>
          <dt>Tenor and rate</dt>
          <dd>
            {plan.finance.tenor} months, <span className="est">{plan.finance.rate.toFixed(2)}% flat</span>
          </dd>
        </div>
        <div>
          <dt>Monthly instalment</dt>
          <dd className="est">{rupiah(q.monthly)}</dd>
        </div>
        <div>
          <dt>Total first payment (TDP)</dt>
          <dd className="est">{rupiah(q.tdp)}</dd>
        </div>
      </dl>
    );
  }

  const q = leaseQuote(price, plan.lease);
  return (
    <dl className={s.summaryList}>
      <div>
        <dt>Plan</dt>
        <dd>Lease (concept)</dd>
      </div>
      <div>
        <dt>Contract</dt>
        <dd>
          {plan.lease.term} months, {(plan.lease.mileage / 1000).toFixed(0)}k km a year
        </dd>
      </div>
      <div>
        <dt>Monthly rent</dt>
        <dd className="est">{rupiah(q.monthly)}</dd>
      </div>
      <div>
        <dt>Initial payment</dt>
        <dd className="est">{rupiah(q.initial)}</dd>
      </div>
    </dl>
  );
}
