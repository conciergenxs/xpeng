import Link from "next/link";
import s from "./OrderCta.module.css";

/** Closing call to action before the footer. `.dark` also tells the header to switch to its white variant here. */
export default function OrderCta() {
  return (
    <section className={`${s.section} dark`} aria-labelledby="cta-title">
      {/* Background is used exactly as supplied in assets/original/home/cta.png. */}
      <img src="/media/home/cta.png" alt="" width={1881} height={836} loading="lazy" decoding="async" className={s.bg} />
      <div className={s.veil} aria-hidden />

      <div className={`wrap ${s.content}`}>
        <h2 id="cta-title" className={`headline ${s.title}`}>
          <span>Pesan dari mana saja,</span> sesuai waktu Anda.
        </h2>
        <p className={`lede ${s.copy}`}>
          Pilih model, warna, dan cara bayar secara online. Ingin mencobanya dulu? Jadwalkan test drive.
        </p>
        <div className={s.ctas}>
          <Link href="/order/" className={`btn btn-light ${s.cta}`}>
            Pesan sekarang
          </Link>
          {/* The official booking page, as used by the footer and the model pages. */}
          <a href="https://xpeng.co.id/en/book-now" className={`btn btn-ghost-light ${s.cta} ${s.ctaSecondary}`}>
            Jadwalkan test drive
          </a>
        </div>
      </div>
    </section>
  );
}
