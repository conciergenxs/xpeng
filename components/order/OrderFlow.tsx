"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Tween from "@/components/Tween";
import { getVariant, models } from "@/lib/vehicles";
import { cashQuote, financeQuote, leaseQuote, planLabel } from "@/lib/payment";
import { rupiah, rupiahShort } from "@/lib/format";
import {
  CONFIRMED,
  STEPS,
  STORAGE_KEY,
  fromSearchParams,
  makeReference,
  validateCustomer,
  type Errors,
  type OrderState,
} from "@/lib/order";
import OrderStage from "./OrderStage";
import StepVehicle from "./StepVehicle";
import StepPayment from "./StepPayment";
import StepDetails from "./StepDetails";
import StepReview from "./StepReview";
import Confirmation from "./Confirmation";
import s from "./order.module.css";

/** What the main button does on each step, and where the back arrow returns to. */
const NEXT_LABEL = ["Lanjut ke pembayaran", "Lanjut isi data diri", "Tinjau pesanan"];
const BACK_LABEL = ["Kembali ke pilihan mobil", "Kembali ke pembayaran", "Kembali ke data diri"];

function readStored(): OrderState | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OrderState) : undefined;
  } catch {
    return undefined;
  }
}

export default function OrderFlow() {
  const params = useSearchParams();
  const [order, setOrder] = useState<OrderState | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const panelTop = useRef<HTMLDivElement>(null);

  // Hydrate once: deep-link params win, otherwise restore the session's order.
  useEffect(() => {
    const next = fromSearchParams(new URLSearchParams(params.toString()), readStored());
    if (next.step > 2 && Object.keys(validateCustomer(next.customer)).length) next.step = 2;
    setOrder(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!order) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    } catch {
      /* private mode: the order still works for this page view */
    }
  }, [order]);

  if (!order) return <div className={s.loading} aria-busy="true" />;

  const model = models[order.model];
  const variant = getVariant(order.variantId)!;
  const paint = model.paints.find((p) => p.id === order.paintId) ?? model.paints[0];

  const update = (patch: Partial<OrderState>) => setOrder((o) => (o ? { ...o, ...patch } : o));

  const goTo = (step: number) => {
    setOrder((o) => (o ? { ...o, step } : o));
    setErrors({});
    requestAnimationFrame(() => {
      const top = panelTop.current;
      if (!top) return;
      const y = top.getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
      top.focus({ preventScroll: true });
    });
  };

  const next = () => {
    if (order.step === 2) {
      const e = validateCustomer(order.customer);
      setErrors(e);
      if (Object.keys(e).length) {
        requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
        return;
      }
    }
    if (order.step === 3) {
      if (!order.consent.terms) {
        setErrors({ terms: "Centang persetujuan syarat reservasi untuk melanjutkan." });
        requestAnimationFrame(() => document.getElementById("consent-terms")?.focus());
        return;
      }
      setSubmitting(true);
      // Simulated submission; a production build would post to the dealer order API here.
      window.setTimeout(() => {
        setOrder((o) => (o ? { ...o, step: CONFIRMED, reference: makeReference(), submittedAt: new Date().toISOString() } : o));
        setSubmitting(false);
        window.scrollTo({ top: 0 });
      }, 900);
      return;
    }
    goTo(order.step + 1);
  };

  if (order.step === CONFIRMED) {
    return (
      <Confirmation
        order={order}
        onNew={() => {
          setOrder({ ...order, step: 0, reference: undefined, submittedAt: undefined, consent: { terms: false, marketing: false } });
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  // The bar always shows the figure that matters for the chosen plan; monthly figures carry "/bln".
  const p = order.plan;
  const bar =
    p.kind === "cash"
      ? { value: cashQuote(variant.price, p.cash).total, label: "total OTR Jakarta", est: p.cash.insurance, perMonth: false }
      : p.kind === "finance"
        ? { value: financeQuote(variant.price, p.finance).monthly, label: `${p.finance.tenor} bulan`, est: true, perMonth: true }
        : { value: leaseQuote(variant.price, p.lease).monthly, label: `${p.lease.term} bulan`, est: true, perMonth: true };

  const ctaLabel = order.step === 3 ? `Reservasi ${model.name}` : NEXT_LABEL[order.step];

  return (
    <div className={s.layout}>
      {/* Stage: the car as currently specified, with its 360° view and official media */}
      <OrderStage model={model} variant={variant} paint={paint} onPaint={(paintId) => update({ paintId })} />

      {/* Panel: one step at a time */}
      <section className={s.panel} aria-labelledby="step-title">
        <div className={s.panelInner}>
          <ol className={s.stepper} aria-label="Langkah pemesanan">
            {STEPS.map((label, i) => {
              const state = i < order.step ? "done" : i === order.step ? "current" : "todo";
              return (
                <li key={label} className={s[state]}>
                  {i < order.step ? (
                    <button type="button" onClick={() => goTo(i)}>
                      <span className={s.stepNum} aria-hidden>
                        {/* Drawn in a centred box, so the tick sits in the middle of its circle. */}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.5 6.2 4.9 8.5 9.5 3.6" />
                        </svg>
                      </span>
                      <span>{label}</span>
                      <span className="sr-only">, selesai. Ubah</span>
                    </button>
                  ) : (
                    <span aria-current={i === order.step ? "step" : undefined}>
                      <span className={s.stepNum} aria-hidden>
                        {i + 1}
                      </span>
                      <span>{label}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <div ref={panelTop} tabIndex={-1} className={s.stepBody} key={order.step}>
            {order.step === 0 && <StepVehicle order={order} update={update} />}
            {order.step === 1 && <StepPayment order={order} update={update} />}
            {order.step === 2 && <StepDetails order={order} update={update} errors={errors} />}
            {order.step === 3 && <StepReview order={order} update={update} goTo={goTo} errors={errors} />}
          </div>
        </div>

        <div className={s.bar}>
          <div className={s.barFigure}>
            <p className={s.barValue}>
              <span className={bar.est ? "est" : undefined}>
                <Tween value={bar.value} format={p.kind === "cash" ? rupiah : rupiahShort} />
              </span>
              {bar.perMonth && <span className={s.barSuffix}>/bln</span>}
            </p>
            <p className={s.barLabel}>
              {planLabel[p.kind]}, {bar.label}
            </p>
          </div>
          <div className={s.barActions}>
            {order.step > 0 && (
              <button
                type="button"
                className={`btn btn-ghost ${s.barBack}`}
                onClick={() => goTo(order.step - 1)}
                aria-label={BACK_LABEL[order.step - 1]}
                title="Kembali"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M19 12H5M11 6l-6 6 6 6" />
                </svg>
              </button>
            )}
            <button type="button" className={`btn ${s.barCta}`} onClick={next} disabled={submitting} aria-busy={submitting} aria-label={submitting ? undefined : ctaLabel}>
              {submitting ? (
                "Memproses…"
              ) : (
                <>
                  <span className={s.ctaLong}>{ctaLabel}</span>
                  <span className={s.ctaShort}>{order.step === 3 ? "Reservasi" : "Lanjut"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
