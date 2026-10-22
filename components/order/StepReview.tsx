"use client";

import { useRef } from "react";
import { getVariant, models } from "@/lib/vehicles";
import { ASSUMPTIONS } from "@/lib/payment";
import { showrooms } from "@/lib/showrooms";
import { rupiah } from "@/lib/format";
import type { Errors, OrderState } from "@/lib/order";
import PlanSummary from "./PlanSummary";
import s from "./order.module.css";

type Props = {
  order: OrderState;
  update: (p: Partial<OrderState>) => void;
  goTo: (step: number) => void;
  errors: Errors;
};

const CONTACT = { whatsapp: "WhatsApp", phone: "Phone call", email: "Email" };

export default function StepReview({ order, update, goTo, errors }: Props) {
  const terms = useRef<HTMLDialogElement>(null);
  const model = models[order.model];
  const variant = getVariant(order.variantId)!;
  const paint = model.paints.find((p) => p.id === order.paintId)!;
  const c = order.customer;
  const showroom = showrooms.find((r) => r.id === c.showroomId);

  return (
    <>
      <h2 id="step-title" className="headline">
        Review and reserve
      </h2>
      <p className={s.stepIntro}>Check everything once more. You can change any part before you reserve.</p>

      <section className={s.review} aria-labelledby="rv-car">
        <div className={s.reviewHead}>
          <h3 id="rv-car">Your car</h3>
          <button type="button" className="link small" onClick={() => goTo(0)}>
            Change<span className="sr-only"> car</span>
          </button>
        </div>
        <dl className={s.summaryList}>
          <div>
            <dt>Model</dt>
            <dd>
              {model.name} {variant.name}
            </dd>
          </div>
          <div>
            <dt>Colour</dt>
            <dd>{paint.name}</dd>
          </div>
          <div>
            <dt>Price, OTR Jakarta</dt>
            <dd>{rupiah(variant.price)}</dd>
          </div>
        </dl>
      </section>

      <section className={s.review} aria-labelledby="rv-pay">
        <div className={s.reviewHead}>
          <h3 id="rv-pay">Payment</h3>
          <button type="button" className="link small" onClick={() => goTo(1)}>
            Change<span className="sr-only"> payment</span>
          </button>
        </div>
        <PlanSummary variantId={order.variantId} plan={order.plan} />
      </section>

      <section className={s.review} aria-labelledby="rv-you">
        <div className={s.reviewHead}>
          <h3 id="rv-you">Your details</h3>
          <button type="button" className="link small" onClick={() => goTo(2)}>
            Change<span className="sr-only"> details</span>
          </button>
        </div>
        <dl className={s.summaryList}>
          <div>
            <dt>Name</dt>
            <dd>
              {c.firstName} {c.lastName}
              {c.buyerType === "company" && `, ${c.company}`}
            </dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>
              {c.email}
              <br />
              +62 {c.phone.replace(/^\+?62|^0/, "")}
            </dd>
          </div>
          <div>
            <dt>Showroom</dt>
            <dd>{showroom?.name}</dd>
          </div>
          <div>
            <dt>Reach me by</dt>
            <dd>
              {CONTACT[c.contact]}
              {c.tradeIn && ", has a trade-in"}
            </dd>
          </div>
        </dl>
      </section>

      <div className={s.deposit}>
        <div>
          <p className={s.depositLabel}>Reservation deposit</p>
          <p className={s.depositValue}>
            <span className="est">{rupiah(ASSUMPTIONS.reservationDeposit)}</span>
          </p>
        </div>
        <p className={s.hint}>
          After you reserve, you&rsquo;d receive a bank virtual account number to pay the deposit within 24 hours. It
          comes off your final price and is refundable if your financing isn&rsquo;t approved. No payment is taken in
          this prototype; the deposit amount is illustrative.
        </p>
      </div>

      <div className={s.consents}>
        <label className={s.check}>
          <input
            id="consent-terms"
            type="checkbox"
            checked={order.consent.terms}
            onChange={(e) => update({ consent: { ...order.consent, terms: e.target.checked } })}
            aria-invalid={errors.terms ? "true" : undefined}
            aria-describedby={errors.terms ? "e-terms" : undefined}
          />
          <span>
            I agree to the{" "}
            <button type="button" className="link" onClick={() => terms.current?.showModal()}>
              reservation terms
            </button>{" "}
            and to XPENG Indonesia processing my details to handle this order, as described in the{" "}
            <a className="link" href="https://xpeng.co.id/en/privacy-policy" target="_blank" rel="noreferrer">
              privacy policy
            </a>
            .
          </span>
        </label>
        {errors.terms && (
          <p id="e-terms" className={s.error}>
            {errors.terms}
          </p>
        )}
        <label className={s.check}>
          <input
            type="checkbox"
            checked={order.consent.marketing}
            onChange={(e) => update({ consent: { ...order.consent, marketing: e.target.checked } })}
          />
          <span>Send me XPENG news and offers. Optional.</span>
        </label>
      </div>

      <dialog ref={terms} className={s.dialog} aria-labelledby="terms-title" onClick={(e) => e.target === terms.current && terms.current?.close()}>
        <div className={s.dialogBody}>
          <h3 id="terms-title">Reservation terms (illustrative)</h3>
          <ol>
            <li>A reservation holds your chosen specification while your advisor confirms availability, final OTR price for your city and delivery timing.</li>
            <li>The reservation deposit is deducted from the vehicle price at settlement.</li>
            <li>If financing or lease approval is declined, the deposit is refunded in full.</li>
            <li>Finance and lease figures shown online are estimates. The binding offer comes from the financing partner.</li>
            <li>The order becomes binding only once you sign the purchase agreement (SPK) with your showroom.</li>
          </ol>
          <p className="fine">These terms are written for this prototype and are not XPENG Indonesia&rsquo;s commercial terms.</p>
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
