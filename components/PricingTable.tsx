import React, { useState } from "react";
import { ArrowRight, Bot, Check, Clapperboard, Layers, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import CheckoutModal from "./dashboard/CheckoutModal";
import {
  EXTRA_CHANNEL_SLOT,
  PUBLIC_PLAN_ORDER,
  PUBLIC_PLANS,
  PublicPlanId,
  PricingBillingKey,
  getPlanMonthlyPrice,
} from "@/lib/public-plans";

const planIcons: Record<PublicPlanId, React.ElementType> = {
  STARTER: Search,
  CREATOR: Clapperboard,
  FACTORY: Users,
};

const planAccents: Record<PublicPlanId, string> = {
  STARTER: "border-blue-300/35 bg-blue-300/[0.07] text-blue-200",
  CREATOR: "border-cyan-300/45 bg-cyan-300/[0.09] text-cyan-200",
  FACTORY: "border-amber-300/40 bg-amber-300/[0.08] text-amber-200",
};

const billingOptions: Array<{ id: PricingBillingKey; label: string; suffix: string; note?: string }> = [
  { id: "monthly", label: "Hàng tháng", suffix: "/tháng" },
  { id: "sixMonths", label: "6 tháng", suffix: "/tháng", note: "Tiết kiệm" },
  { id: "yearly", label: "1 năm", suffix: "/tháng", note: "Tốt nhất" },
];

const workflowRows = [
  {
    label: "Launch Channel",
    icon: Search,
    getValue: (planId: PublicPlanId) => PUBLIC_PLANS[planId].workflowCoverage.launchChannel,
  },
  {
    label: "Produce Video",
    icon: Clapperboard,
    getValue: (planId: PublicPlanId) => PUBLIC_PLANS[planId].workflowCoverage.produceVideo,
  },
  {
    label: "Improve Channel",
    icon: Layers,
    getValue: (planId: PublicPlanId) => PUBLIC_PLANS[planId].workflowCoverage.improveChannel,
  },
  {
    label: "AI Creator Coach",
    icon: Bot,
    getValue: (planId: PublicPlanId) => `${PUBLIC_PLANS[planId].aiCoachDailyLimit}/day`,
  },
  {
    label: "Channel slots",
    icon: ShieldCheck,
    getValue: (planId: PublicPlanId) => String(PUBLIC_PLANS[planId].channelLimit),
  },
];

const formatPrice = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function PricingTable() {
  const [billing, setBilling] = useState<PricingBillingKey>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PublicPlanId | typeof EXTRA_CHANNEL_SLOT.id | null>(null);

  return (
    <div className="w-full">
      <div className="mb-10 flex justify-center">
        <div className="grid w-full max-w-xl grid-cols-3 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {billingOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setBilling(option.id)}
              className={`min-h-11 rounded-full px-3 text-sm font-black transition ${
                billing === option.id ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              {option.label}
              {option.note && <span className="ml-1 hidden text-[10px] uppercase sm:inline">{option.note}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PUBLIC_PLAN_ORDER.map((planId) => {
          const plan = PUBLIC_PLANS[planId];
          const Icon = planIcons[plan.id];
          const price = getPlanMonthlyPrice(plan, billing);

          return (
            <article key={plan.id} className={`relative flex min-h-[560px] flex-col rounded-xl border p-6 ${planAccents[plan.id]}`}>
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-300 px-4 py-1 text-xs font-black uppercase tracking-[0.16em] text-slate-950">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.18em] opacity-80">{plan.label}</div>
                  <h2 className="mt-2 text-3xl font-black text-white">{plan.publicName}</h2>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20">
                  <Icon size={22} />
                </div>
              </div>

              <p className="min-h-[72px] text-sm leading-6 text-slate-300">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-black text-white">{formatPrice(price)}đ</span>
                <span className="ml-2 text-sm font-bold text-slate-400">{billingOptions.find((item) => item.id === billing)?.suffix}</span>
              </div>

              {billing !== "monthly" && (
                <div className="mt-2 text-sm font-bold text-emerald-300">
                  Thanh toán {billing === "yearly" ? "12 tháng" : "6 tháng"}: {formatPrice(price * (billing === "yearly" ? 12 : 6))}đ
                </div>
              )}

              <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
                <span className="font-black text-white">Phù hợp:</span> {plan.bestFor}
              </div>

              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-200">
                    <Check size={17} className="mt-1 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white text-sm font-black text-slate-950 hover:bg-cyan-100"
              >
                Chọn {plan.publicName}
                <ArrowRight size={16} />
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Workflow coverage</div>
            <h3 className="mt-2 text-2xl font-black text-white">So sánh theo việc cần làm</h3>
          </div>
          <div className="text-sm text-slate-400">Các giới hạn chi tiết được kiểm soát bởi billing và role hiện có.</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-400">
                <th className="py-4 pr-4 font-bold">Capability</th>
                {PUBLIC_PLAN_ORDER.map((planId) => (
                  <th key={planId} className="px-4 py-4 font-black text-white">{PUBLIC_PLANS[planId].publicName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workflowRows.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.label} className="border-b border-white/10 last:border-b-0">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3 font-bold text-slate-200">
                        <Icon size={17} className="text-cyan-300" />
                        {row.label}
                      </div>
                    </td>
                    {PUBLIC_PLAN_ORDER.map((planId) => (
                      <td key={`${row.label}-${planId}`} className="px-4 py-4 text-slate-300">{row.getValue(planId)}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          ["Không khóa vào tool lẻ", "Bạn chọn workflow, SeenYT đưa bạn tới đúng bước và đúng công cụ."],
          ["Dễ nâng cấp", "Khi kênh lớn hơn, nâng từ Starter lên Creator hoặc Workflow Team mà không đổi hệ thống."],
          ["Giữ route cũ an toàn", "Affiliate, academy và các flow thanh toán cũ vẫn được giữ đến khi review dependency xong."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <Sparkles size={18} className="text-cyan-300" />
            <h4 className="mt-4 font-black text-white">{title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">Channel add-on</div>
            <h3 className="mt-2 text-2xl font-black text-white">Mua thêm kênh khi đã dùng hết slot</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Starter có 1 kênh, Creator có 2 kênh, Workflow Team có 5 kênh. Nếu cần thêm, mua add-on {EXTRA_CHANNEL_SLOT.name.toLowerCase()} với giá {formatPrice(EXTRA_CHANNEL_SLOT.monthly)}đ/kênh, thanh toán một lần.
            </p>
          </div>
          <button
            onClick={() => setSelectedPlan(EXTRA_CHANNEL_SLOT.id)}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-300 px-6 text-sm font-black text-slate-950 hover:bg-emerald-200"
          >
            Mua thêm 1 kênh
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {selectedPlan && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setSelectedPlan(null)}
          requiredPlan={selectedPlan}
          forceYearly={billing === "yearly"}
          forceSixMonths={billing === "sixMonths"}
        />
      )}
    </div>
  );
}
