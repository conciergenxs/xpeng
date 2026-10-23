"use client";

import Segmented from "@/components/Segmented";
import { showrooms, showroomAreas } from "@/lib/showrooms";
import type { Customer, Errors, OrderState } from "@/lib/order";
import s from "./order.module.css";

type Props = { order: OrderState; update: (p: Partial<OrderState>) => void; errors: Errors };

export default function StepDetails({ order, update, errors }: Props) {
  const c = order.customer;
  const set = <K extends keyof Customer>(k: K, v: Customer[K]) => update({ customer: { ...c, [k]: v } });

  const field = (
    k: "company" | "firstName" | "lastName" | "email",
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div className={s.field}>
      <label htmlFor={`f-${k}`}>{label}</label>
      <input
        id={`f-${k}`}
        value={c[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={errors[k] ? "true" : undefined}
        aria-describedby={errors[k] ? `e-${k}` : undefined}
        {...props}
      />
      {errors[k] && (
        <p id={`e-${k}`} className={s.error}>
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <h2 id="step-title" className="headline">
        Siapa yang memesan?
      </h2>
      <p className={s.stepIntro}>
        Data ini dipakai konsultan kami untuk menyiapkan pesanan dan menghubungi Anda. Di prototipe ini, tidak ada data
        yang dikirim.
      </p>

      <div className={s.form}>
        <Segmented
          label="Dibeli atas nama"
          value={c.buyerType}
          onChange={(v) => set("buyerType", v)}
          options={[
            { value: "individual", label: "Pribadi" },
            { value: "company", label: "Perusahaan" },
          ]}
        />

        {c.buyerType === "company" && field("company", "Nama perusahaan (PT/CV)", { autoComplete: "organization" })}

        <div className={s.fieldRow}>
          {field("firstName", "Nama depan", { autoComplete: "given-name" })}
          {field("lastName", "Nama belakang", { autoComplete: "family-name" })}
        </div>

        {field("email", "Email", { type: "email", autoComplete: "email", inputMode: "email" })}

        <div className={s.field}>
          <label htmlFor="f-phone">Nomor ponsel</label>
          <div className={s.phone}>
            <span aria-hidden>+62</span>
            <input
              id="f-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="812 3456 7890"
              value={c.phone}
              onChange={(e) => set("phone", e.target.value)}
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? "e-phone" : "h-phone"}
            />
          </div>
          {errors.phone ? (
            <p id="e-phone" className={s.error}>
              {errors.phone}
            </p>
          ) : (
            <p id="h-phone" className={s.fieldHint}>
              Kode +62 sudah terpasang, cukup isi nomor berikutnya.
            </p>
          )}
        </div>

        <div className={s.field}>
          <label htmlFor="f-showroom">Showroom</label>
          <select
            id="f-showroom"
            value={c.showroomId}
            onChange={(e) => set("showroomId", e.target.value)}
            aria-invalid={errors.showroomId ? "true" : undefined}
            aria-describedby={errors.showroomId ? "e-showroom" : "h-showroom"}
          >
            <option value="" disabled>
              Pilih showroom
            </option>
            {showroomAreas.map((area) => (
              <optgroup key={area} label={area}>
                {showrooms
                  .filter((r) => r.area === area)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          {errors.showroomId ? (
            <p id="e-showroom" className={s.error}>
              {errors.showroomId}
            </p>
          ) : (
            <p id="h-showroom" className={s.fieldHint}>
              Konsultan Anda bertugas di sini, dan di sini pula mobil Anda diserahkan.
            </p>
          )}
        </div>

        <Segmented
          label="Hubungi saya lewat"
          value={c.contact}
          onChange={(v) => set("contact", v)}
          options={[
            { value: "whatsapp", label: "WhatsApp" },
            { value: "phone", label: "Telepon" },
            { value: "email", label: "Email" },
          ]}
        />

        <label className={s.check}>
          <input type="checkbox" checked={c.tradeIn} onChange={(e) => set("tradeIn", e.target.checked)} />
          <span>Saya punya mobil untuk tukar tambah</span>
        </label>

        <div className={s.field}>
          <label htmlFor="f-notes">
            Ada yang perlu kami ketahui? <span className={s.optional}>Opsional</span>
          </label>
          <textarea
            id="f-notes"
            rows={3}
            value={c.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Misalnya bulan pengiriman yang Anda inginkan, atau pertanyaan soal charger di rumah"
          />
        </div>
      </div>
    </>
  );
}
