import { defaultPlan, type PlanKind, type PlanState } from "./payment";
import { getVariant, paintsFor, variantsFor, type ModelSlug, type VariantId } from "./vehicles";

export const STEPS = ["Mobil", "Pembayaran", "Data diri", "Tinjau"] as const;
export const CONFIRMED = STEPS.length;

export type Customer = {
  buyerType: "individual" | "company";
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  showroomId: string;
  contact: "whatsapp" | "phone" | "email";
  tradeIn: boolean;
  notes: string;
};

export type OrderState = {
  step: number;
  model: ModelSlug;
  variantId: VariantId;
  paintId: string;
  plan: PlanState;
  customer: Customer;
  consent: { terms: boolean; marketing: boolean };
  reference?: string;
  submittedAt?: string;
};

export const emptyCustomer: Customer = {
  buyerType: "individual",
  company: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  showroomId: "",
  contact: "whatsapp",
  tradeIn: false,
  notes: "",
};

export function initialOrder(model: ModelSlug = "x9"): OrderState {
  return {
    step: 0,
    model,
    variantId: variantsFor(model)[0].id,
    paintId: paintsFor(variantsFor(model)[0].id)[0].id,
    plan: defaultPlan,
    customer: emptyCustomer,
    consent: { terms: false, marketing: false },
  };
}

const STEP_PARAM: Record<string, number> = { vehicle: 0, payment: 1, details: 2, review: 3 };

/** Keeps the paint to one the chosen variant is offered in, else that variant's first. */
export function withAvailablePaint(state: OrderState): OrderState {
  const paints = paintsFor(state.variantId);
  return paints.some((p) => p.id === state.paintId) ? state : { ...state, paintId: paints[0].id };
}

/** Deep links: /order/?model=g6&variant=g6-pro&paint=stellar-purple&plan=lease&step=payment */
export function fromSearchParams(params: URLSearchParams, stored?: OrderState): OrderState {
  // A refresh on the confirmation keeps it; any deep link starts a new order but keeps the customer's details.
  if (![...params.keys()].length && stored) return stored;
  const base = stored?.step === CONFIRMED ? { ...initialOrder(stored.model), customer: stored.customer } : stored;

  const variant = getVariant(params.get("variant"));
  const modelParam = params.get("model");
  const model: ModelSlug | undefined = variant?.model ?? (modelParam === "x9" || modelParam === "g6" ? modelParam : undefined);

  let state = base ?? initialOrder(model);
  if (model && model !== state.model) state = { ...initialOrder(model), customer: state.customer, plan: state.plan };
  if (variant) state = { ...state, variantId: variant.id };

  const paint = params.get("paint");
  if (paint && paintsFor(state.variantId).some((p) => p.id === paint)) state = { ...state, paintId: paint };

  const plan = params.get("plan");
  if (plan === "cash" || plan === "finance" || plan === "lease") state = { ...state, plan: { ...state.plan, kind: plan as PlanKind } };

  const step = params.get("step");
  if (step && step in STEP_PARAM) state = { ...state, step: STEP_PARAM[step] };
  else if (model || variant) state = { ...state, step: 0 };
  return withAvailablePaint(state);
}

export type Errors = Partial<Record<keyof Customer | "terms", string>>;

export function validateCustomer(c: Customer): Errors {
  const e: Errors = {};
  if (c.buyerType === "company" && !c.company.trim()) e.company = "Isi nama perusahaan sesuai akta pendirian.";
  if (!c.firstName.trim()) e.firstName = "Isi nama depan Anda.";
  if (!c.lastName.trim()) e.lastName = "Isi nama belakang Anda.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) e.email = "Alamat email belum lengkap. Contoh: nama@contoh.com.";
  const digits = c.phone.replace(/\D/g, "").replace(/^0/, "").replace(/^62/, "");
  if (!/^8\d{8,11}$/.test(digits)) e.phone = "Masukkan nomor ponsel yang diawali angka 8, misalnya 812 3456 7890.";
  if (!c.showroomId) e.showroomId = "Pilih showroom yang akan melayani Anda.";
  return e;
}

export function makeReference(date = new Date()) {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `XP-${yy}${mm}${dd}-${rand}`;
}

export const STORAGE_KEY = "xpeng-order-v1";
