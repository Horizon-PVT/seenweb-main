import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Loader2, ShieldCheck, Sparkles, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  BillingCycle,
  EXTRA_CHANNEL_SLOT,
  getExtraChannelSlotAmount,
  getPlanCheckoutAmount,
  getPublicPlan,
} from "@/lib/public-plans";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan?: string;
  userEmail?: string;
  forceYearly?: boolean;
  forceSixMonths?: boolean;
}

const PLAN_GRADIENTS: Record<string, string> = {
  STARTER: "from-blue-600 to-blue-800",
  CREATOR: "from-cyan-600 to-blue-800",
  FACTORY: "from-amber-600 to-orange-800",
};

const formatPrice = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function CheckoutModal({
  isOpen,
  onClose,
  requiredPlan = "",
  userEmail = "",
  forceYearly = false,
  forceSixMonths = false,
}: CheckoutModalProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    forceYearly ? "YEARLY" : forceSixMonths ? "SIX_MONTHS" : "MONTHLY"
  );
  const [email, setEmail] = useState(userEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setBillingCycle(forceYearly ? "YEARLY" : forceSixMonths ? "SIX_MONTHS" : "MONTHLY");
      if (userEmail) setEmail(userEmail);
    }
  }, [isOpen, forceYearly, forceSixMonths, userEmail]);

  if (!isOpen || !mounted) return null;

  const isChannelSlotUpgrade = requiredPlan === EXTRA_CHANNEL_SLOT.id;
  const plan = getPublicPlan(requiredPlan);
  const planBgColor = PLAN_GRADIENTS[plan.id] || PLAN_GRADIENTS.STARTER;
  const displayName = isChannelSlotUpgrade ? EXTRA_CHANNEL_SLOT.name : plan.publicName;
  const features = isChannelSlotUpgrade
    ? [
        "Thêm 1 slot kênh YouTube vào tài khoản hiện tại",
        "Áp dụng cộng dồn với giới hạn kênh của gói đang dùng",
        "Thanh toán theo cùng chu kỳ bạn chọn",
      ]
    : plan.features;

  const getMonthlyPrice = () => {
    if (isChannelSlotUpgrade) return EXTRA_CHANNEL_SLOT.monthly;
    if (billingCycle === "SIX_MONTHS") return plan.sixMonths;
    if (billingCycle === "YEARLY") return plan.yearly;
    return plan.monthly;
  };

  const getPrice = () => isChannelSlotUpgrade ? getExtraChannelSlotAmount(billingCycle) : getPlanCheckoutAmount(plan, billingCycle);

  const handlePayment = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email.");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Email không hợp lệ.");
      return;
    }

    setIsLoading(true);
    try {
      const billingLabel = billingCycle === "YEARLY" ? "1 năm" : billingCycle === "SIX_MONTHS" ? "6 tháng" : "hàng tháng";
      const planDescription = isChannelSlotUpgrade
        ? "Mua thêm 1 kênh SeenYT"
        : `Nâng cấp SeenYT ${plan.publicName} (${billingLabel})`;

      const res = await axios.post("/api/payment/create-payos-link", {
        email,
        amount: Math.round(getPrice()),
        plan: planDescription,
        role: plan.id,
        note: isChannelSlotUpgrade ? "One-time extra channel slot" : `Cycle: ${billingCycle}`,
        billingCycle: isChannelSlotUpgrade ? "MONTHLY" : billingCycle,
        isSlotUpgrade: isChannelSlotUpgrade,
        extraChannelSlots: isChannelSlotUpgrade ? 1 : 0,
      });

      if (res.data.success && res.data.data.paymentUrl) {
        window.location.href = res.data.data.paymentUrl;
      } else {
        toast.error("Không thể tạo link thanh toán. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      toast.error(error.response?.data?.error || "Lỗi kết nối thanh toán.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative grid max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl lg:grid-cols-[0.9fr_1.1fr]"
            >
              <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/70">
                <X size={20} />
              </button>

              <div className={`bg-gradient-to-br ${planBgColor} p-8`}>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                  <Sparkles size={14} />
                  SeenYT plan
                </div>
                <h2 className="mt-6 text-4xl font-black text-white">{displayName}</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
                  {isChannelSlotUpgrade
                    ? "Mở rộng số kênh YouTube có thể kết nối mà không cần đổi gói hiện tại."
                    : "Kích hoạt workflow làm kênh YouTube trong Studio: nghiên cứu, sản xuất, tối ưu và review với AI Coach."}
                </p>

                <div className="mt-8 rounded-xl border border-white/20 bg-black/20 p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-black text-white">
                    <ShieldCheck size={17} />
                    Quyền lợi gói
                  </div>
                  <div className="space-y-3">
                    {features.map((feature) => (
                      <div key={feature} className="flex gap-3 text-sm leading-6 text-white/85">
                        <Check size={15} className="mt-1 shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-black text-white">Thanh toán an toàn</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Sau khi PayOS xác nhận, tài khoản sẽ được kích hoạt theo role tương ứng và chuyển về Studio.
                </p>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-slate-400">Gói đăng ký</div>
                      <div className="mt-1 text-2xl font-black text-white">{displayName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Tổng thanh toán</div>
                      <div className="mt-1 text-3xl font-black text-white">{formatPrice(getPrice())}đ</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="mb-3 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Chu kỳ thanh toán
                  </label>
                  {isChannelSlotUpgrade ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-sm font-black text-white">Thanh toán một lần</div>
                      <div className="mt-1 text-sm text-slate-400">{formatPrice(EXTRA_CHANNEL_SLOT.monthly)}đ/kênh</div>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          ["MONTHLY", "Hàng tháng", getMonthlyPrice()],
                          ["SIX_MONTHS", "6 tháng", plan.sixMonths],
                          ["YEARLY", "1 năm", plan.yearly],
                        ].map(([id, label, price]) => (
                          <button
                            key={String(id)}
                            onClick={() => setBillingCycle(id as BillingCycle)}
                            className={`rounded-xl border p-4 text-left transition ${
                              billingCycle === id ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"
                            }`}
                          >
                            <div className="text-sm font-black text-white">{label}</div>
                            <div className="mt-1 text-sm text-slate-400">{formatPrice(Number(price))}đ/tháng</div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 text-sm font-bold text-cyan-200">Giá theo tháng: {formatPrice(getMonthlyPrice())}đ</div>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Email kích hoạt
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none transition focus:border-cyan-300"
                  />
                  <p className="mt-2 text-xs text-slate-500">Email này dùng để xác nhận thanh toán và kích hoạt tài khoản.</p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className={`mt-8 inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r ${planBgColor} text-base font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Thanh toán qua PayOS
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
