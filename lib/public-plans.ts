export type PublicPlanId = "STARTER" | "CREATOR" | "FACTORY";
export type BillingCycle = "MONTHLY" | "SIX_MONTHS" | "YEARLY";
export type PricingBillingKey = "monthly" | "sixMonths" | "yearly";

export type PublicPlan = {
  id: PublicPlanId;
  name: string;
  publicName: string;
  label: string;
  description: string;
  bestFor: string;
  monthly: number;
  sixMonths: number;
  yearly: number;
  badge?: string;
  channelLimit: number;
  aiCoachDailyLimit: number;
  features: string[];
  workflowCoverage: {
    launchChannel: string;
    produceVideo: string;
    improveChannel: string;
  };
};

export const PUBLIC_PLANS: Record<PublicPlanId, PublicPlan> = {
  STARTER: {
    id: "STARTER",
    name: "Starter",
    publicName: "Starter",
    label: "Bắt đầu workflow",
    description: "Cho creator mới cần chọn ngách, viết video đầu tiên và học cách đăng đúng.",
    bestFor: "Creator mới hoặc kênh đang thử thị trường",
    monthly: 199000,
    sixMonths: 149000,
    yearly: 99000,
    channelLimit: 1,
    aiCoachDailyLimit: 5,
    workflowCoverage: {
      launchChannel: "Basic",
      produceVideo: "Basic",
      improveChannel: "SEO only",
    },
    features: [
      "Niche Radar và SEO Tool",
      "Script Studio cho video đầu tiên",
      "Video Pipeline cơ bản",
      "AI Coach 5 lượt mỗi ngày",
      "1 kênh YouTube",
    ],
  },
  CREATOR: {
    id: "CREATOR",
    name: "Creator",
    publicName: "Creator",
    label: "Làm kênh đều đặn",
    description: "Gói chính cho creator muốn có workflow từ nghiên cứu đến sản xuất và tối ưu.",
    bestFor: "Creator đăng video đều và cần quy trình ổn định",
    monthly: 399000,
    sixMonths: 299000,
    yearly: 249000,
    badge: "Popular",
    channelLimit: 2,
    aiCoachDailyLimit: 20,
    workflowCoverage: {
      launchChannel: "Full",
      produceVideo: "Full",
      improveChannel: "Intelligence Hub",
    },
    features: [
      "Tất cả trong Starter",
      "Rival Scanner và Intelligence Hub",
      "Voice Studio cho voice, phụ đề, bản dịch",
      "Video Pipeline đầy đủ",
      "AI Coach 20 lượt mỗi ngày",
      "2 kênh YouTube",
    ],
  },
  FACTORY: {
    id: "FACTORY",
    name: "Workflow Team",
    publicName: "Workflow Team",
    label: "Vận hành theo team",
    description: "Cho team nhỏ hoặc agency cần nghiên cứu nhiều ngách, batch production và review liên tục.",
    bestFor: "Team sản xuất nhiều video hoặc quản lý nhiều kênh",
    monthly: 699000,
    sixMonths: 549000,
    yearly: 399000,
    channelLimit: 5,
    aiCoachDailyLimit: 50,
    workflowCoverage: {
      launchChannel: "Full + batch",
      produceVideo: "Full + batch",
      improveChannel: "Review workflow",
    },
    features: [
      "Tất cả trong Creator",
      "Batch workflow cho nhiều video",
      "Review kênh bằng Intelligence Hub",
      "AI Coach 50 lượt mỗi ngày",
      "5 kênh YouTube",
      "Ưu tiên hỗ trợ workflow",
    ],
  },
};

export const PUBLIC_PLAN_ORDER: PublicPlanId[] = ["STARTER", "CREATOR", "FACTORY"];

export const EXTRA_CHANNEL_SLOT = {
  id: "CHANNEL_SLOT",
  name: "+1 kênh YouTube",
  monthly: 169000,
  description: "Mua thêm 1 slot kênh YouTube cố định cho gói đang dùng.",
};

export const BILLING_DAYS: Record<BillingCycle, number> = {
  MONTHLY: 30,
  SIX_MONTHS: 180,
  YEARLY: 365,
};

export function getPublicPlan(planId: string | null | undefined): PublicPlan {
  const normalized = String(planId || "STARTER").toUpperCase() as PublicPlanId;
  return PUBLIC_PLANS[normalized] || PUBLIC_PLANS.STARTER;
}

export function getPlanMonthlyPrice(plan: Pick<PublicPlan, "monthly" | "sixMonths" | "yearly">, billing: PricingBillingKey) {
  return plan[billing];
}

export function getPlanCheckoutAmount(plan: Pick<PublicPlan, "monthly" | "sixMonths" | "yearly">, billingCycle: BillingCycle) {
  if (billingCycle === "SIX_MONTHS") return plan.sixMonths * 6;
  if (billingCycle === "YEARLY") return plan.yearly * 12;
  return plan.monthly;
}

export function getExtraChannelSlotAmount(billingCycle: BillingCycle, slots = 1) {
  return EXTRA_CHANNEL_SLOT.monthly * Math.max(1, slots);
}
