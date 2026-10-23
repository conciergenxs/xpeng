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

const CONTACT = { whatsapp: "WhatsApp", phone: "Telepon", email: "Email" };

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
        Periksa sekali lagi.
      </h2>
      <p className={s.stepIntro}>Pastikan semuanya sesuai; setiap bagian masih bisa diubah. Reservasi ini belum mengikat — pesanan baru final setelah SPK ditandatangani di showroom.</p>

      <section className={s.review} aria-labelledby="rv-car">
        <div className={s.reviewHead}>
          <h3 id="rv-car">Mobil Anda</h3>
          <button type="button" className="link small" onClick={() => goTo(0)}>
            Ubah<span className="sr-only"> mobil</span>
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
            <dt>Warna</dt>
            <dd>{paint.name}</dd>
          </div>
          <div>
            <dt>Harga OTR Jakarta</dt>
            <dd>{rupiah(variant.price)}</dd>
          </div>
        </dl>
      </section>

      <section className={s.review} aria-labelledby="rv-pay">
        <div className={s.reviewHead}>
          <h3 id="rv-pay">Pembayaran</h3>
          <button type="button" className="link small" onClick={() => goTo(1)}>
            Ubah<span className="sr-only"> pembayaran</span>
          </button>
        </div>
        <PlanSummary variantId={order.variantId} plan={order.plan} />
      </section>

      <section className={s.review} aria-labelledby="rv-you">
        <div className={s.reviewHead}>
          <h3 id="rv-you">Data diri</h3>
          <button type="button" className="link small" onClick={() => goTo(2)}>
            Ubah<span className="sr-only"> data diri</span>
          </button>
        </div>
        <dl className={s.summaryList}>
          <div>
            <dt>Nama</dt>
            <dd>
              {c.firstName} {c.lastName}
              {c.buyerType === "company" && `, ${c.company}`}
            </dd>
          </div>
          <div>
            <dt>Kontak</dt>
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
            <dt>Dihubungi lewat</dt>
            <dd>
              {CONTACT[c.contact]}
              {c.tradeIn && ", ada mobil untuk tukar tambah"}
            </dd>
          </div>
        </dl>
      </section>

      <div className={s.deposit}>
        <div>
          <p className={s.depositLabel}>Uang tanda jadi</p>
          <p className={s.depositValue}>
            <span className="est">{rupiah(ASSUMPTIONS.reservationDeposit)}</span>
          </p>
        </div>
        <p className={s.hint}>
          Setelah reservasi, Anda akan menerima nomor virtual account untuk membayar uang tanda jadi dalam 24 jam.
          Jumlah ini nantinya mengurangi harga akhir, dan dikembalikan bila pengajuan pembiayaan tidak disetujui. Prototipe
          ini tidak menagih pembayaran apa pun; nominalnya hanya ilustrasi.
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
            Saya menyetujui{" "}
            <button type="button" className="link" onClick={() => terms.current?.showModal()}>
              syarat reservasi
            </button>{" "}
            dan mengizinkan XPENG Indonesia memproses data saya untuk pesanan ini, sesuai{" "}
            <a className="link" href="https://xpeng.co.id/en/privacy-policy" target="_blank" rel="noreferrer">
              kebijakan privasi
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
          <span>Kirimi saya kabar terbaru dan penawaran dari XPENG. Opsional.</span>
        </label>
      </div>

      <dialog ref={terms} className={s.dialog} aria-labelledby="terms-title" onClick={(e) => e.target === terms.current && terms.current?.close()}>
        <div className={s.dialogBody}>
          <h3 id="terms-title">Syarat reservasi (ilustrasi)</h3>
          <ol>
            <li>Reservasi menahan spesifikasi pilihan Anda selama konsultan memastikan ketersediaan, harga OTR final untuk kota Anda, dan jadwal pengiriman.</li>
            <li>Uang tanda jadi dipotongkan dari harga mobil saat pelunasan.</li>
            <li>Bila pengajuan kredit atau sewa ditolak, uang tanda jadi dikembalikan utuh.</li>
            <li>Angka kredit dan sewa di situs ini adalah perkiraan. Penawaran yang mengikat datang dari mitra pembiayaan.</li>
            <li>Pesanan baru mengikat setelah Anda menandatangani Surat Pesanan Kendaraan (SPK) di showroom.</li>
          </ol>
          <p className="fine">Syarat ini disusun untuk prototipe dan bukan ketentuan komersial XPENG Indonesia.</p>
          <form method="dialog">
            <button className="btn">Tutup</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
