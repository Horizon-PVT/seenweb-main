import { isValidToolRole } from "./roles";
import {
  BILLING_DAYS,
  BillingCycle,
  EXTRA_CHANNEL_SLOT,
  PUBLIC_PLANS,
  getExtraChannelSlotAmount,
  getPlanCheckoutAmount,
} from "./public-plans";

export type ResolvedPaymentPlan = {
  plan: string;
  role: string;
  amount: number;
  note: string;
  billingCycle: BillingCycle;
  membershipDays: number | null;
  hasMasterclass: boolean;
  referralCode?: string | null;
  isSlotUpgrade: boolean;
  extraChannelSlots: number;
};

const TOOL_PLAN_PRICES: Record<string, Record<BillingCycle, number>> = {
  STARTER: {
    MONTHLY: getPlanCheckoutAmount(PUBLIC_PLANS.STARTER, "MONTHLY"),
    SIX_MONTHS: getPlanCheckoutAmount(PUBLIC_PLANS.STARTER, "SIX_MONTHS"),
    YEARLY: getPlanCheckoutAmount(PUBLIC_PLANS.STARTER, "YEARLY"),
  },
  CREATOR: {
    MONTHLY: getPlanCheckoutAmount(PUBLIC_PLANS.CREATOR, "MONTHLY"),
    SIX_MONTHS: getPlanCheckoutAmount(PUBLIC_PLANS.CREATOR, "SIX_MONTHS"),
    YEARLY: getPlanCheckoutAmount(PUBLIC_PLANS.CREATOR, "YEARLY"),
  },
  FACTORY: {
    MONTHLY: getPlanCheckoutAmount(PUBLIC_PLANS.FACTORY, "MONTHLY"),
    SIX_MONTHS: getPlanCheckoutAmount(PUBLIC_PLANS.FACTORY, "SIX_MONTHS"),
    YEARLY: getPlanCheckoutAmount(PUBLIC_PLANS.FACTORY, "YEARLY"),
  },
  AGENCY: { MONTHLY: 1990000, SIX_MONTHS: 1590000 * 6, YEARLY: 1290000 * 12 },
  ENTERPRISE: { MONTHLY: 4990000, SIX_MONTHS: 3990000 * 6, YEARLY: 2990000 * 12 },
};

function normalizeBillingCycle(value: unknown): BillingCycle {
  const cycle = String(value || "MONTHLY").toUpperCase();
  if (cycle === "SIX_MONTHS" || cycle === "YEARLY") return cycle;
  return "MONTHLY";
}

function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function assertReasonableEmail(email: unknown): string {
  if (typeof email !== "string") throw new Error("Invalid email.");
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Invalid email.");
  }
  return normalized;
}

export function resolvePaymentPlan(input: {
  email: unknown;
  amount?: unknown;
  plan?: unknown;
  role?: unknown;
  note?: unknown;
  referralCode?: unknown;
  billingCycle?: unknown;
  isSlotUpgrade?: unknown;
  extraChannelSlots?: unknown;
}): { email: string; payment: ResolvedPaymentPlan } {
  const email = assertReasonableEmail(input.email);
  const planCode = String(input.plan || "").trim();
  const requestedRole = String(input.role || "STARTER").trim().toUpperCase();
  const billingCycle = normalizeBillingCycle(input.billingCycle);
  const note = typeof input.note === "string" ? input.note.trim() : "";
  const referralCode = normalizeReferralCode(input.referralCode);

  if (input.isSlotUpgrade === true) {
    const extraChannelSlots = Math.max(1, Math.min(20, Number(input.extraChannelSlots || 1)));
    return {
      email,
      payment: {
        plan: `${EXTRA_CHANNEL_SLOT.name} x${extraChannelSlots}`,
        role: requestedRole && isValidToolRole(requestedRole) ? requestedRole : "CREATOR",
        amount: getExtraChannelSlotAmount(billingCycle, extraChannelSlots),
        note: note || EXTRA_CHANNEL_SLOT.description,
        billingCycle,
        membershipDays: null,
        hasMasterclass: false,
        referralCode,
        isSlotUpgrade: true,
        extraChannelSlots,
      },
    };
  }

  if (planCode === "MASTERCLASS_COURSE") {
    return {
      email,
      payment: {
        plan: planCode,
        role: "MASTERCLASS",
        amount: 849000,
        note: note || "SeenYT Academy Masterclass",
        billingCycle: "MONTHLY",
        membershipDays: null,
        hasMasterclass: true,
        referralCode,
        isSlotUpgrade: false,
        extraChannelSlots: 0,
      },
    };
  }

  if (planCode === "ZOOM_VIP_TICKET") {
    return {
      email,
      payment: {
        plan: planCode,
        role: "MASTERCLASS",
        amount: 499000,
        note: note || "SeenYT Academy Zoom VIP ticket",
        billingCycle: "MONTHLY",
        membershipDays: null,
        hasMasterclass: true,
        referralCode,
        isSlotUpgrade: false,
        extraChannelSlots: 0,
      },
    };
  }

  if (planCode === "ZOOM_VIP_COMBO") {
    return {
      email,
      payment: {
        plan: planCode,
        role: "CREATOR",
        amount: 849000,
        note: note || "SeenYT Academy Zoom VIP combo plus 2 months Creator",
        billingCycle: "MONTHLY",
        membershipDays: 60,
        hasMasterclass: true,
        referralCode,
        isSlotUpgrade: false,
        extraChannelSlots: 0,
      },
    };
  }

  if (!isValidToolRole(requestedRole) || requestedRole === "FREE" || requestedRole === "ADMIN") {
    throw new Error("Invalid paid role.");
  }

  const priceByCycle = TOOL_PLAN_PRICES[requestedRole];
  if (!priceByCycle) throw new Error("Unsupported paid plan.");

  return {
    email,
    payment: {
      plan: planCode || `SeenYT ${requestedRole}`,
      role: requestedRole,
      amount: priceByCycle[billingCycle],
      note,
      billingCycle,
      membershipDays: BILLING_DAYS[billingCycle],
      hasMasterclass: false,
      referralCode,
      isSlotUpgrade: false,
      extraChannelSlots: 0,
    },
  };
}
