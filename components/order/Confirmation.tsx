"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Img from "@/components/Img";
import { getVariant, models } from "@/lib/vehicles";
import { showrooms, HOTLINE } from "@/lib/showrooms";
import { rupiah } from "@/lib/format";
import type { OrderState } from "@/lib/order";
import PlanSummary from "./PlanSummary";
import s from "./confirmation.module.css";

const DOCUMENTS = {
  cash: ["KTP (identity card)", "NPWP (tax number)"],
  finance: ["KTP for you and your spouse, if married", "KK (family card)", "NPWP", "Proof of income: payslips or 3 months of bank statements"],
  lease: ["Company deed and NIB, or KTP for individuals", "NPWP", "Latest financial statements or 3 months of bank statements"],
};

export default function Confirmation({ order, onNew }: { order: OrderState; onNew: () => void }) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => title.current?.focus({ preventScroll: true }), []);
  const model = models[order.model];
  const variant = getVariant(order.variantId)!;
  const paint = model.paints.find((p) => p.id === order.paintId)!;
  const showroom = showrooms.find((r) => r.id === order.customer.showroomId);
  const when = order.submittedAt ? new Date(order.submittedAt) : new Date();
  const channel = { whatsapp: "on WhatsApp", phone: "by phone", email: "by email" }[order.customer.contact];

  const next = [
    {
      title: "Your advisor gets in touch",
      text: `Someone from ${showroom?.name ?? "your showroom"} will contact you ${channel} within one working day to confirm availability and your city's OTR price.`,
    },
    {
      title: "Pay the reservation deposit",
      text: "You'll receive a virtual account number. Paying within 24 hours secures your car.",
    },
    order.plan.kind === "cash"
      ? { title: "Settle the balance", text: "Pay the remaining balance by bank transfer before your delivery date." }
      : {
          title: order.plan.kind === "finance" ? "Apply for financing" : "Apply for the lease",
          text: "Your advisor sends the application to a partner and walks you through approval, usually within a few working days.",
        },
    { title: "Sign and collect", text: `Sign your purchase agreement (SPK) and collect your ${model.name} at ${showroom?.name ?? "the showroom"}.` },
  ];

  return (
    <div className={s.page}>
      <div className={`wrap ${s.grid}`}>
        <div className={s.main}>
          <p className={s.ref}>
            Reference <strong>{order.reference}</strong>
          </p>
          <h1 className={`headline ${s.title}`} tabIndex={-1} ref={title}>
            Reservation received, {order.customer.firstName}.
          </h1>
          <p className="lede">
            Your {model.name} {variant.name} in {paint.name} is reserved. A summary would be sent to{" "}
            {order.customer.email} in the live service.
          </p>

          <h2 className={s.sub}>What happens next</h2>
          <ol className={s.timeline}>
            {next.map((n, i) => (
              <li key={n.title}>
                <span className={s.num} aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <h3>{n.title}</h3>
                  <p className="muted">{n.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2 className={s.sub}>Documents to have ready</h2>
          <ul className={s.docs}>
            {DOCUMENTS[order.plan.kind].map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>

          <div className={`${s.actions} no-print`}>
            <button type="button" className="btn" onClick={() => window.print()}>
              Print or save as PDF
            </button>
            <Link href="/" className="btn btn-ghost">
              Back to home
            </Link>
            <button type="button" className="btn btn-ghost" onClick={onNew}>
              Start another order
            </button>
          </div>
          <p className="fine">
            Questions? Call {HOTLINE}, 24 hours. This is a prototype: no order has been placed and no data has left
            your browser.
          </p>
        </div>

        <aside className={s.card} aria-label="Order summary">
          <div className={s.cardCar} style={{ background: paint.stage }}>
            <Img src={paint.image} alt={`${model.name} in ${paint.name}`} sizes="480px" />
          </div>
          <div className={s.cardBody}>
            <p className={s.cardName}>
              {model.name} {variant.name}
            </p>
            <p className="muted small">
              {paint.name}, {variant.rangeLabel} range
            </p>
            <dl className={s.cardList}>
              <div>
                <dt>Price, OTR Jakarta</dt>
                <dd>{rupiah(variant.price)}</dd>
              </div>
              <div>
                <dt>Showroom</dt>
                <dd>{showroom?.name}</dd>
              </div>
              <div>
                <dt>Reserved on</dt>
                <dd>
                  {when.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </dd>
              </div>
            </dl>
            <PlanSummary variantId={order.variantId} plan={order.plan} />
          </div>
        </aside>
      </div>
    </div>
  );
}
