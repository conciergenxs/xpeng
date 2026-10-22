const idr = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** Rp 1.140.000.000 */
export const rupiah = (n: number) => `Rp ${idr.format(Math.round(n))}`;

/** Rp 1,14 M · Rp 21,3 jt — Indonesian short forms for miliar and juta. */
export const rupiahShort = (n: number) => {
  const fmt = (v: number, d: number) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: d, minimumFractionDigits: 0 }).format(v);
  if (n >= 1e9) return `Rp ${fmt(n / 1e9, 2)} M`;
  if (n >= 1e6) return `Rp ${fmt(n / 1e6, 1)} jt`;
  return rupiah(n);
};

export const mm = (n: number) => `${new Intl.NumberFormat("en-US").format(n)} mm`;

export const pct = (n: number, d = 0) => `${n.toFixed(d).replace(/\.0+$/, "")}%`;
