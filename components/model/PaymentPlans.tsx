"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import Img from "@/components/Img";
import RangeField from "@/components/RangeField";
import Segmented from "@/components/Segmented";
import Select from "@/components/Select";
import Tween from "@/components/Tween";
import { ASSUMPTIONS, defaultPlan, planLabel, planSummary, type PlanKind, type PlanState } from "@/lib/payment";
import { getVariant, modelList, models, variantsFor, type ModelSlug, type VariantId } from "@/lib/vehicles";
import { rupiah, rupiahShort } from "@/lib/format";
import o from "@/components/order/order.module.css";
import s from "./PaymentPlans.module.css";

const F = ASSUMPTIONS.finance;
const L = ASSUMPTIONS.lease;
const MAX_COLUMNS = 3;

const OpenContext = createContext<(id: VariantId) => void>(() => {});

/** The variant card's way in: a quiet text link that opens the payment plans with that variant first. */
export function PaymentPlansButton({ variantId }: { variantId: VariantId }) {
  const open = useContext(OpenContext);
  const v = getVariant(variantId)!;
  return (
    <button type="button" className={s.trigger} onClick={() => open(variantId)}>
      <span>Explore payment plans</span>
      <span className="sr-only">
        {" "}
        for the {models[v.model].name} {v.name}
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

/** Another variant to compare against: the next one of the same model, or the other model's first. */
function partner(id: VariantId): VariantId {
  const v = getVariant(id)!;
  const same = variantsFor(v.model);
  if (same.length > 1) return same[(same.findIndex((x) => x.id === id) + 1) % same.length].id;
  return variantsFor(modelList.find((m) => m.slug !== v.model)!.slug)[0].id;
}

/**
 * Payment plans for any variant, without starting an order: Cash, Finance or Lease, with that plan's settings,
 * applied to up to three vehicles side by side. Prices are the official OTR figures; everything derived from
 * them comes from lib/payment, whose rates are illustrative, and is marked as a simulation.
 * Wraps the variant list, so each card's PaymentPlansButton can open it.
 */
export default function PaymentPlans({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [columns, setColumns] = useState<VariantId[]>([]);
  const [plan, setPlan] = useState<PlanState>(defaultPlan);

  const open = useCallback((id: VariantId) => {
    setColumns([id, partner(id)]);
    dialog.current?.showModal();
  }, []);
  const close = () => dialog.current?.close();
  const patch = (p: Partial<PlanState>) => setPlan((x) => ({ ...x, ...p }));
  const setColumn = (i: number, id: VariantId) => setColumns((c) => c.map((x, j) => (j === i ? id : x)));

  return (
    <OpenContext.Provider value={open}>
      {children}

      <dialog
        ref={dialog}
        className={`${o.modal} ${s.dialog}`}
        aria-labelledby="payment-plans-title"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className={o.modalHead}>
          <div>
            <h2 id="payment-plans-title" className={o.modalTitle}>
              Payment plans
            </h2>
            <p className={s.sub}>See what each vehicle costs to pay for, and compare them side by side.</p>
          </div>
          <button type="button" className={o.modalClose} onClick={close} aria-label="Close payment plans">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className={`${o.modalBody} ${s.body}`}>
          {/* The plan and its settings, shared by every column so they stay comparable. */}
          <div className={s.planBar}>
            <div className={s.kinds}>
              <Segmented
                label="Payment plan"
                size="lg"
                value={plan.kind}
                onChange={(kind: PlanKind) => patch({ kind })}
                options={(["cash", "finance", "lease"] as PlanKind[]).map((k) => ({ value: k, label: planLabel[k] }))}
              />
            </div>

            <div className={s.settings}>
              {plan.kind === "cash" && (
                <label className={s.toggle}>
                  <span>
                    <span className={o.toggleTitle}>Add first-year comprehensive insurance</span>
                    <span className={o.toggleHint}>
                      Estimated at {(ASSUMPTIONS.insuranceRate * 100).toFixed(1)}% of the vehicle price.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    className={o.switch}
                    checked={plan.cash.insurance}
                    onChange={(e) => patch({ cash: { insurance: e.target.checked } })}
                  />
                </label>
              )}
              {plan.kind === "finance" && (
                <>
                  <RangeField
                    label="Down payment"
                    value={plan.finance.dpPct}
                    min={F.dpMin}
                    max={F.dpMax}
                    step={5}
                    onChange={(dpPct) => patch({ finance: { ...plan.finance, dpPct } })}
                    display={`${plan.finance.dpPct}%`}
                    valueText={`${plan.finance.dpPct} percent`}
                    minLabel={`${F.dpMin}%`}
                    maxLabel={`${F.dpMax}%`}
                  />
                  <Segmented
                    label="Tenor"
                    value={plan.finance.tenor}
                    onChange={(tenor: number) => patch({ finance: { ...plan.finance, tenor } })}
                    options={F.tenors.map((t) => ({
                      value: t,
                      label: `${t / 12} yr`,
                    }))}
                  />
                  <RangeField
                    label="Interest rate, flat per year"
                    value={plan.finance.rate}
                    min={F.rateMin}
                    max={F.rateMax}
                    step={0.25}
                    onChange={(rate) => patch({ finance: { ...plan.finance, rate } })}
                    display={`${plan.finance.rate.toFixed(2)}%`}
                    valueText={`${plan.finance.rate.toFixed(2)} percent flat per year`}
                    minLabel={`${F.rateMin}%`}
                    maxLabel={`${F.rateMax}%`}
                  />
                </>
              )}
              {plan.kind === "lease" && (
                <>
                  <Segmented
                    label="Contract length"
                    value={plan.lease.term}
                    onChange={(term: number) => patch({ lease: { ...plan.lease, term } })}
                    options={L.terms.map((t) => ({
                      value: t,
                      label: `${t} months`,
                    }))}
                  />
                  <Segmented
                    label="Distance per year"
                    value={plan.lease.mileage}
                    onChange={(mileage: number) => patch({ lease: { ...plan.lease, mileage } })}
                    options={L.mileages.map((m) => ({
                      value: m,
                      label: `${m / 1000}k km`,
                    }))}
                  />
                </>
              )}
            </div>
          </div>

          {/* Always MAX_COLUMNS equal tracks, the add tile filling what is left: a vehicle's card is the same
              size whether one, two or three are shown. */}
          <div className={s.columns} style={{ "--cols": MAX_COLUMNS } as React.CSSProperties}>
            {columns.map((id, i) => (
              <Column
                key={i}
                id={id}
                base={i > 0 ? columns[0] : undefined}
                plan={plan}
                onChange={(next) => setColumn(i, next)}
                onRemove={columns.length > 1 ? () => setColumns((c) => c.filter((_, j) => j !== i)) : undefined}
              />
            ))}
            {columns.length > 0 && columns.length < MAX_COLUMNS && (
              <button
                type="button"
                className={s.add}
                style={{ "--rest": MAX_COLUMNS - columns.length } as React.CSSProperties}
                onClick={() => setColumns((c) => [...c, partner(c[c.length - 1])])}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add a vehicle to compare
              </button>
            )}
          </div>

          <p className={s.note}>
            Prices are official on-the-road prices in Jakarta. Figures marked <span className="est">like this</span> are
            simulations with illustrative rates, not an offer from XPENG, Erajaya or a financing partner.
          </p>
        </div>
      </dialog>
    </OpenContext.Provider>
  );
}

type ColumnProps = {
  id: VariantId;
  /** The first column, which the others are measured against. */
  base?: VariantId;
  plan: PlanState;
  onChange: (id: VariantId) => void;
  onRemove?: () => void;
};

function Column({ id, base, plan, onChange, onRemove }: ColumnProps) {
  const v = getVariant(id)!;
  const m = models[v.model];
  const kind = plan.kind;
  const sum = planSummary(v.price, plan)[kind];
  const sim = kind !== "cash" || plan.cash.insurance; // cash without insurance is the official price itself

  // The headline figure: the monthly payment, or for cash the total.
  const lead = kind === "cash" ? sum.total : sum.monthly;
  let delta: string | null = null;
  if (base) {
    const b = getVariant(base)!;
    const bs = planSummary(b.price, plan)[kind];
    const diff = lead - (kind === "cash" ? bs.total : bs.monthly);
    const name = `${models[b.model].shortName} ${b.name}`;
    delta =
      Math.abs(diff) < 1
        ? `Same as the ${name}`
        : `${rupiahShort(Math.abs(diff))} ${diff > 0 ? "more" : "less"} than the ${name}`;
  }

  const upfrontHint = {
    cash: "Paid in full before delivery",
    finance: "Down payment, admin fee and first instalment",
    lease: `${L.depositMonths} months’ refundable deposit and first month`,
  }[kind];

  return (
    <section className={s.column} aria-label={`${m.name} ${v.name}`}>
      <div className={s.colHead}>
        <span className={s.car}>
          <Img src={m.silhouette} alt="" sizes="240px" />
        </span>
        {onRemove && (
          <button type="button" className={s.remove} onClick={onRemove} aria-label={`Remove the ${m.name} ${v.name}`}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
        <div className={s.pickers}>
          <Select<ModelSlug>
            label="Model"
            placeholder="Model"
            value={v.model}
            onChange={(slug) => slug !== v.model && onChange(variantsFor(slug)[0].id)}
            options={modelList.map((x) => ({ value: x.slug, label: x.name }))}
          />
          <Select<VariantId>
            label={`${m.name} variant`}
            placeholder="Variant"
            value={id}
            onChange={onChange}
            options={variantsFor(v.model).map((x) => ({
              value: x.id,
              label: x.name,
              detail: rupiah(x.price),
            }))}
          />
        </div>
      </div>

      <div className={s.lead}>
        <p className={s.leadLabel}>
          {kind === "cash" ? "Total price" : kind === "finance" ? "Monthly instalment" : "Monthly rent"}
        </p>
        <p className={s.leadFigure}>
          <span className={sim ? "est" : undefined}>
            <Tween value={lead} format={rupiah} />
          </span>
          {kind !== "cash" && <span className={s.per}>/month</span>}
        </p>
        <p className={s.delta}>{delta}</p>
      </div>

      <dl className={s.rows}>
        <div>
          <dt>Vehicle price, OTR Jakarta</dt>
          <dd>{rupiah(v.price)}</dd>
        </div>
        <div>
          <dt>
            Upfront payment
            <span className={s.hint}>{upfrontHint}</span>
          </dt>
          <dd className={sim ? "est" : undefined}>{rupiah(sum.upfront)}</dd>
        </div>
        <div>
          <dt>Monthly payment</dt>
          <dd className={kind === "cash" ? s.none : "est"}>{kind === "cash" ? "None" : rupiah(sum.monthly)}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{kind === "cash" ? "One payment" : `${sum.months} months`}</dd>
        </div>
        <div className={s.total}>
          <dt>
            Total cost
            {kind === "lease" && <span className={s.hint}>Rent over the term; the car is returned at the end</span>}
            {kind === "finance" && <span className={s.hint}>Everything paid over the loan</span>}
          </dt>
          <dd className={sim ? "est" : undefined}>{rupiah(sum.total)}</dd>
        </div>
      </dl>
    </section>
  );
}
