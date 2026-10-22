// Payment simulations. Every constant below is ILLUSTRATIVE — not an XPENG Indonesia,
// Erajaya or partner-bank offer. The UI tags each derived figure as a simulation.

export type PlanKind = "cash" | "finance" | "lease";

export const ASSUMPTIONS = {
  reservationDeposit: 10_000_000,
  insuranceRate: 0.015, // first-year comprehensive cover, share of OTR price
  finance: {
    dpMin: 10,
    dpMax: 70,
    dpDefault: 30,
    tenors: [12, 24, 36, 48, 60],
    tenorDefault: 36,
    rateMin: 0,
    rateMax: 10,
    rateDefault: 4.5, // flat rate per year, the convention Indonesian dealers quote
    adminFee: 3_500_000,
  },
  lease: {
    terms: [24, 36, 48],
    termDefault: 36,
    mileages: [15_000, 20_000, 30_000],
    mileageDefault: 20_000,
    residual: { 24: 0.62, 36: 0.52, 48: 0.44 } as Record<number, number>,
    mileageAdjust: { 15000: 0.02, 20000: 0, 30000: -0.05 } as Record<number, number>,
    annualRate: 0.075,
    servicePerMonth: 0.0011, // maintenance, insurance and STNK renewal bundle, share of price
    depositMonths: 3,
    excessKm: 2_500,
  },
};

export type FinanceInput = { dpPct: number; tenor: number; rate: number };
export type LeaseInput = { term: number; mileage: number };
export type CashInput = { insurance: boolean };

export type PlanState = {
  kind: PlanKind;
  cash: CashInput;
  finance: FinanceInput;
  lease: LeaseInput;
};

export const defaultPlan: PlanState = {
  kind: "finance",
  cash: { insurance: false },
  finance: {
    dpPct: ASSUMPTIONS.finance.dpDefault,
    tenor: ASSUMPTIONS.finance.tenorDefault,
    rate: ASSUMPTIONS.finance.rateDefault,
  },
  lease: { term: ASSUMPTIONS.lease.termDefault, mileage: ASSUMPTIONS.lease.mileageDefault },
};

export function cashQuote(price: number, input: CashInput) {
  const insurance = input.insurance ? price * ASSUMPTIONS.insuranceRate : 0;
  const total = price + insurance;
  const dueToday = ASSUMPTIONS.reservationDeposit;
  return { price, insurance, total, dueToday, balance: total - dueToday };
}

export function financeQuote(price: number, input: FinanceInput) {
  const dp = Math.round((price * input.dpPct) / 100);
  const principal = price - dp;
  const years = input.tenor / 12;
  const interest = principal * (input.rate / 100) * years;
  const monthly = (principal + interest) / input.tenor;
  const admin = ASSUMPTIONS.finance.adminFee;
  // TDP (total down payment) with the first instalment paid in advance (ADDM).
  const tdp = dp + monthly + admin;
  const totalPaid = dp + monthly * input.tenor + admin;
  return { dp, principal, interest, monthly, admin, tdp, totalPaid, tenor: input.tenor };
}

export function leaseQuote(price: number, input: LeaseInput) {
  const L = ASSUMPTIONS.lease;
  const residualPct = (L.residual[input.term] ?? 0.5) + (L.mileageAdjust[input.mileage] ?? 0);
  const residual = price * residualPct;
  const depreciation = (price - residual) / input.term;
  const financeCharge = ((price + residual) * L.annualRate) / 24;
  const service = price * L.servicePerMonth;
  const monthly = depreciation + financeCharge + service;
  // Refundable security deposit plus the first month's rent, paid at signing.
  const deposit = monthly * L.depositMonths;
  const initial = deposit + monthly;
  const totalPaid = monthly * input.term;
  return { monthly, deposit, initial, totalPaid, term: input.term, mileage: input.mileage, residualPct };
}

/** One row per plan for the side-by-side comparison. */
export function planSummary(price: number, plan: PlanState) {
  const c = cashQuote(price, plan.cash);
  const f = financeQuote(price, plan.finance);
  const l = leaseQuote(price, plan.lease);
  return {
    cash: { upfront: c.total, monthly: 0, months: 0, total: c.total },
    finance: { upfront: f.tdp, monthly: f.monthly, months: f.tenor, total: f.totalPaid },
    lease: { upfront: l.initial, monthly: l.monthly, months: l.term, total: l.totalPaid },
  };
}

/** The "from Rp … per month" teaser shown outside the order flow. */
export const monthlyFrom = (price: number) => financeQuote(price, defaultPlan.finance).monthly;

export const planLabel: Record<PlanKind, string> = {
  cash: "Cash",
  finance: "Finance",
  lease: "Lease",
};
