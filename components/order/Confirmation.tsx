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
  cash: ["KTP", "NPWP"],
  finance: ["KTP Anda, juga KTP pasangan bila sudah menikah", "Kartu Keluarga (KK)", "NPWP", "Bukti penghasilan: slip gaji atau rekening koran 3 bulan terakhir"],
  lease: ["Akta perusahaan dan NIB, atau KTP untuk pelanggan pribadi", "NPWP", "Laporan keuangan terbaru atau rekening koran 3 bulan terakhir"],
};

export default function Confirmation({ order, onNew }: { order: OrderState; onNew: () => void }) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => title.current?.focus({ preventScroll: true }), []);
  const model = models[order.model];
  const variant = getVariant(order.variantId)!;
  const paint = model.paints.find((p) => p.id === order.paintId)!;
  const showroom = showrooms.find((r) => r.id === order.customer.showroomId);
  const when = order.submittedAt ? new Date(order.submittedAt) : new Date();
  const channel = { whatsapp: "lewat WhatsApp", phone: "lewat telepon", email: "lewat email" }[order.customer.contact];

  const next = [
    {
      title: "Konsultan kami menghubungi Anda",
      text: `Tim ${showroom?.name ?? "showroom pilihan Anda"} akan menghubungi Anda ${channel} dalam satu hari kerja untuk memastikan ketersediaan mobil dan harga OTR di kota Anda.`,
    },
    {
      title: "Bayar uang tanda jadi",
      text: "Anda akan menerima nomor virtual account. Bayar dalam 24 jam untuk mengunci mobil pilihan Anda.",
    },
    order.plan.kind === "cash"
      ? { title: "Lunasi sisanya", text: "Transfer sisa pembayaran sebelum tanggal serah terima." }
      : order.plan.kind === "finance"
        ? {
            title: "Ajukan kredit",
            text: "Konsultan meneruskan pengajuan Anda ke mitra dan mendampingi sampai disetujui, biasanya dalam beberapa hari kerja.",
          }
        : {
            title: "Konfirmasi program sewa",
            text: "Skema sewa masih berupa ilustrasi konsep. Konsultan akan memastikan apakah program, mitra, tarif, dan ketentuannya tersedia sebelum ada pengajuan.",
          },
    { title: "Tanda tangan, lalu bawa pulang", text: `Tandatangani SPK, lalu jemput ${variant.fullName} Anda di ${showroom?.name ?? "showroom"}.` },
  ];

  return (
    <div className={s.page}>
      <div className={`wrap ${s.grid}`}>
        <div className={s.main}>
          <p className={s.ref}>
            Nomor referensi <strong>{order.reference}</strong>
          </p>
          <h1 className={`headline ${s.title}`} tabIndex={-1} ref={title}>
            {order.customer.firstName}, reservasi Anda sudah kami terima.
          </h1>
          <p className="lede">
            {variant.fullName} warna {paint.name} kini tertahan atas nama Anda. Pada layanan sebenarnya,
            ringkasannya dikirim ke {order.customer.email}.
          </p>

          <h2 className={s.sub}>Langkah berikutnya</h2>
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

          <h2 className={s.sub}>Dokumen yang perlu disiapkan</h2>
          <ul className={s.docs}>
            {DOCUMENTS[order.plan.kind].map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>

          <div className={`${s.actions} no-print`}>
            <button type="button" className="btn" onClick={() => window.print()}>
              Cetak atau simpan PDF
            </button>
            <Link href="/" className="btn btn-ghost">
              Kembali ke beranda
            </Link>
            <button type="button" className="btn btn-ghost" onClick={onNew}>
              Buat pesanan baru
            </button>
          </div>
          <p className="fine">
            Ada pertanyaan? Hubungi {HOTLINE}, 24 jam. Ini prototipe: tidak ada pesanan yang benar-benar dibuat, dan
            data Anda tidak keluar dari browser.
          </p>
        </div>

        <aside className={s.card} aria-label="Ringkasan pesanan">
          <div className={s.cardCar} style={{ background: paint.stage }}>
            <Img src={paint.image} alt={`${variant.fullName} warna ${paint.name}`} sizes="480px" />
          </div>
          <div className={s.cardBody}>
            <p className={s.cardName}>
              {variant.fullName}
            </p>
            <p className="muted small">
              {paint.name}, jarak tempuh {variant.rangeLabel.charAt(0).toLowerCase() + variant.rangeLabel.slice(1)}
            </p>
            <dl className={s.cardList}>
              <div>
                <dt>Harga OTR Jakarta</dt>
                <dd>{rupiah(variant.price)}</dd>
              </div>
              <div>
                <dt>Showroom</dt>
                <dd>{showroom?.name}</dd>
              </div>
              <div>
                <dt>Tanggal reservasi</dt>
                <dd>
                  {when.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
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
