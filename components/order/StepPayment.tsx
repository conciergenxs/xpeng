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
import { rupiah, rupiahShort } from "@/lib/format";
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
        Choose how to pay
      </h2>
      <fieldset className={s.group}>
        <legend className="sr-only">Payment plan</legend>
        <div className={s.plans}>
          {(
            [
              { kind: "cash", label: "Cash", figure: rupiahShort(cash.total), est: false },
              { kind: "finance", label: "Finance", figure: `${rupiahShort(fin.monthly)}/mo`, est: true },
              { kind: "lease", label: "Lease", figure: `${rupiahShort(lease.monthly)}/mo`, est: true },
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
            <p className={s.bigEyebrow}>Cash total</p>
            <p className={s.bigFigure}>
              <Tween value={cash.total} format={rupiah} />
            </p>
            <p className={s.bigLabel}>Total to pay before delivery</p>
          </div>

          <label className={s.toggleRow}>
            <span>
              <span className={s.toggleTitle}>Add first-year comprehensive insurance</span>
              <span className={s.toggleHint}>
                Estimated at {(ASSUMPTIONS.insuranceRate * 100).toFixed(1)}% of the vehicle price. You can also arrange your own.
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

          <h3 className={`${s.groupLabel} ${s.breakdownHead}`}>Breakdown</h3>
          <dl className={s.breakdown}>
            <div>
              <dt>Vehicle price, OTR Jakarta</dt>
              <dd>{rupiah(cash.price)}</dd>
            </div>
            {plan.cash.insurance && (
              <div>
                <dt>Comprehensive insurance, year one</dt>
                <dd className="est">{rupiah(cash.insurance)}</dd>
              </div>
            )}
            <div className={s.total}>
              <dt>Total</dt>
              <dd>{rupiah(cash.total)}</dd>
            </div>
            <div>
              <dt>Reservation deposit, due today</dt>
              <dd className="est">{rupiah(cash.dueToday)}</dd>
            </div>
            <div>
              <dt>Balance, due before delivery</dt>
              <dd>{rupiah(cash.balance)}</dd>
            </div>
          </dl>
          <p className={s.hint}>
            OTR prices outside Jakarta differ because of regional vehicle tax (BBNKB). Your advisor will confirm the
            figure for your city.
          </p>
        </div>
      )}

      {plan.kind === "finance" && (
        <div className={s.planBody}>
          <div className={s.figureBlock}>
            <p className={s.bigEyebrow}>Monthly instalment</p>
            <p className={s.bigFigure}>
              <span className="est">
                <Tween value={fin.monthly} format={rupiah} />
              </span>
            </p>
            <p className={s.bigLabel}>
              per month for {plan.finance.tenor} months <span className="sim-tag">Simulation</span>
            </p>
          </div>

          <div className={s.controls}>
            <RangeField
              label="Down payment (DP)"
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
              valueText={`${plan.finance.dpPct} percent, ${rupiah(fin.dp)}`}
              minLabel={`${F.dpMin}%`}
              maxLabel={`${F.dpMax}%`}
            />
            <Segmented
              label="Tenor"
              value={plan.finance.tenor}
              onChange={(tenor: number) => setPlan({ finance: { ...plan.finance, tenor } })}
              options={F.tenors.map((t) => ({ value: t, label: `${t / 12} yr`, hint: `${t} mo` }))}
            />
            <RangeField
              label="Interest rate, flat per year"
              value={plan.finance.rate}
              min={F.rateMin}
              max={F.rateMax}
              step={0.25}
              onChange={(rate) => setPlan({ finance: { ...plan.finance, rate } })}
              display={`${plan.finance.rate.toFixed(2)}%`}
              valueText={`${plan.finance.rate.toFixed(2)} percent flat per year`}
              minLabel={`${F.rateMin}%`}
              maxLabel={`${F.rateMax}%`}
            />
          </div>

          <h3 className={`${s.groupLabel} ${s.breakdownHead}`}>Breakdown</h3>
          <dl className={s.breakdown}>
            <div>
              <dt>Down payment</dt>
              <dd>{rupiah(fin.dp)}</dd>
            </div>
            <div>
              <dt>Loan amount</dt>
              <dd>{rupiah(fin.principal)}</dd>
            </div>
            <div>
              <dt>Total interest over {plan.finance.tenor} months</dt>
              <dd className="est">{rupiah(fin.interest)}</dd>
            </div>
            <div>
              <dt>Admin fee</dt>
              <dd className="est">{rupiah(fin.admin)}</dd>
            </div>
            <div className={s.total}>
              <dt>
                Total first payment (TDP)
                <span className={s.dtHint}>Down payment, admin fee and first instalment paid in advance (ADDM)</span>
              </dt>
              <dd className="est">{rupiah(fin.tdp)}</dd>
            </div>
            <div>
              <dt>Total paid over the loan</dt>
              <dd className="est">{rupiah(fin.totalPaid)}</dd>
            </div>
          </dl>
          <p className={s.hint}>
            Subject to approval by a financing partner. You&rsquo;ll typically need your KTP, KK, NPWP and proof of
            income. Rates shown are illustrative, not an offer.
          </p>
        </div>
      )}

      {plan.kind === "lease" && (
        <div className={s.planBody}>
          <div className={s.figureBlock}>
            <p className={s.bigEyebrow}>Monthly rent</p>
            <p className={s.bigFigure}>
              <span className="est">
                <Tween value={lease.monthly} format={rupiah} />
              </span>
            </p>
            <p className={s.bigLabel}>
              per month for {plan.lease.term} months <span className="sim-tag">Simulation</span>
            </p>
          </div>

          <div className={s.controls}>
            <Segmented
              label="Contract length"
              value={plan.lease.term}
              onChange={(term: number) => setPlan({ lease: { ...plan.lease, term } })}
              options={L.terms.map((t) => ({ value: t, label: `${t} months` }))}
            />
            <Segmented
              label="Distance per year"
              value={plan.lease.mileage}
              onChange={(mileage: number) => setPlan({ lease: { ...plan.lease, mileage } })}
              options={L.mileages.map((m) => ({ value: m, label: `${m / 1000}k km` }))}
            />
          </div>

          <h3 className={`${s.groupLabel} ${s.breakdownHead}`}>Breakdown</h3>
          <dl className={s.breakdown}>
            <div>
              <dt>
                Security deposit
                <span className={s.dtHint}>{L.depositMonths} months&rsquo; rent, refunded at the end</span>
              </dt>
              <dd className="est">{rupiah(lease.deposit)}</dd>
            </div>
            <div>
              <dt>First month&rsquo;s rent</dt>
              <dd className="est">{rupiah(lease.monthly)}</dd>
            </div>
            <div className={s.total}>
              <dt>Initial payment</dt>
              <dd className="est">{rupiah(lease.initial)}</dd>
            </div>
            <div>
              <dt>Total rent over {plan.lease.term} months</dt>
              <dd className="est">{rupiah(lease.totalPaid)}</dd>
            </div>
          </dl>

          <div className={s.includes}>
            <h3 className={s.groupLabel}>Included in the monthly rent</h3>
            <ul>
              <li>Scheduled maintenance at XPENG service centres</li>
              <li>Comprehensive insurance</li>
              <li>Annual STNK renewal and vehicle tax</li>
              <li>24-hour roadside assistance</li>
            </ul>
          </div>
          <p className={s.hint}>
            Hand the car back at the end, extend, or upgrade to a new XPENG. Distance above your allowance is charged at{" "}
            {rupiah(L.excessKm)}/km. Lease is shown as a concept: availability, terms and eligibility for individual
            and company customers are to be confirmed by XPENG Indonesia.
          </p>
        </div>
      )}

      {/* Side-by-side: every plan, same car, same moment */}
      <div className={s.compareWrap}>
        <h3 className={s.groupLabel}>Compare plans for this car</h3>
        <div className={s.compareScroll}>
          <table className={s.compareTable}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Measure</span>
                </th>
                {(["cash", "finance", "lease"] as const).map((k) => (
                  <th key={k} scope="col" className={plan.kind === k ? s.colOn : undefined}>
                    <button type="button" onClick={() => setPlan({ kind: k })} aria-pressed={plan.kind === k}>
                      {k === "cash" ? "Cash" : k === "finance" ? "Finance" : "Lease"}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Paid upfront</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>{rupiahShort(sum.cash.upfront)}</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.finance.upfront)}</span>
                </td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.lease.upfront)}</span>
                </td>
              </tr>
              <tr>
                <th scope="row">Monthly</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>None</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.finance.monthly)}</span>
                </td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.lease.monthly)}</span>
                </td>
              </tr>
              <tr>
                <th scope="row">Commitment</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>One payment</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>{sum.finance.months} months</td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>{sum.lease.months} months</td>
              </tr>
              <tr>
                <th scope="row">Total over the period</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>{rupiahShort(sum.cash.total)}</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.finance.total)}</span>
                </td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>
                  <span className="est">{rupiahShort(sum.lease.total)}</span>
                </td>
              </tr>
              <tr>
                <th scope="row">At the end</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>You own it</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>You own it</td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>Return or upgrade</td>
              </tr>
              <tr>
                <th scope="row">Suits</th>
                <td className={plan.kind === "cash" ? s.colOn : undefined}>Lowest total cost</td>
                <td className={plan.kind === "finance" ? s.colOn : undefined}>Spreading the cost, owning it</td>
                <td className={plan.kind === "lease" ? s.colOn : undefined}>Predictable costs, no resale worry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
