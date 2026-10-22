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
          <span>Experience XPENG</span> on your terms.
        </h2>
        <p className={`lede ${s.copy}`}>
          Order your XPENG online and take the next step towards a smarter, more connected drive.
        </p>
        <div className={s.ctas}>
          <Link href="/order/" className={`btn btn-light ${s.cta}`}>
            Order now
          </Link>
          {/* The official booking page, as used by the footer and the model pages. */}
          <a href="https://xpeng.co.id/en/book-now" className={`btn btn-ghost-light ${s.cta} ${s.ctaSecondary}`}>
            Book a test drive
          </a>
        </div>
      </div>
    </section>
  );
}
