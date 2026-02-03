import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslation } from 'next-i18next';

interface PricingTableProps {
  setSelectedPlan?: (plan: string) => void;
  userEmail?: string;
}

const planToRole: Record<string, string> = {
  "STARTER": "CREATIVE",
  "PRO": "SUPER",
  "VIP": "VIP",
};

const PricingCard = ({
  plan,
  priceMonthly,
  priceYearly,
  features,
  color,
  glow,
  isFeatured,
  isVip,
  isFree,
  isYearly,
  onUpgrade,
  t,
}: {
  plan: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  color: string;
  glow: string;
  isFeatured?: boolean;
  isVip?: boolean;
  isFree?: boolean;
  isYearly: boolean;
  onUpgrade: (plan: string, amount: number, role: string, yearly: boolean) => void;
  t: any;
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setApplyingPromo(true);
    setPromoError('');
    setPromoApplied(null);

    const baseAmount = isYearly ? priceYearly : priceMonthly;

    try {
      const res = await fetch('/api/apply-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, orderAmount: baseAmount }),
      });

      const data = await res.json();
      if (res.ok) {
        setPromoApplied(data);
      } else {
        setPromoError(data.error || t('pricing.invalidCode', 'Mã không hợp lệ'));
      }
    } catch (error) {
      setPromoError(t('pricing.connectionError', 'Lỗi kết nối'));
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleClick = () => {
    if (isFree) return;

    const baseAmount = isYearly ? priceYearly : priceMonthly;
    const amount = promoApplied ? promoApplied.finalAmount : baseAmount;
    const role = planToRole[plan] || "CREATIVE";

    onUpgrade(plan, amount, role, isYearly);
  };

  // Logic hiển thị giá theo phong cách VidIQ
  // Nếu chọn năm: Hiển thị giá chia đều cho 12 tháng
  const displayPrice = isYearly ? Math.round(priceYearly / 12) : priceMonthly;
  const billedNote = isYearly
    ? `${t('pricing.billedYearly', 'Thanh toán')} ${(promoApplied ? promoApplied.finalAmount : priceYearly).toLocaleString('vi-VN')} đ/${t('pricing.year', 'năm')}`
    : t('pricing.billedMonthly', 'Thanh toán hàng tháng');

  return (
    <div
      className="relative rounded-2xl bg-black/90 border border-gray-800 p-6 flex flex-col text-center transition-all hover:scale-105 shadow-2xl group"
      style={{ boxShadow: glow }}
    >
      {isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-600 text-black font-black text-sm px-6 py-2 rounded-full shadow-xl z-10 whitespace-nowrap">
          {t('pricing.mostPopular', 'MOST POPULAR')}
        </div>
      )}
      <h3 className="text-2xl font-bold mb-3 text-white tracking-wide">{plan}</h3>

      <div className="mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <h2 className="text-5xl font-light tracking-tighter" style={{ color }}>
            {displayPrice >= 1000 ? (displayPrice / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + 'k' : displayPrice.toLocaleString('vi-VN') + ' đ'}
          </h2>
          <span className="text-gray-400 font-normal text-lg">/{t('pricing.monthly')}</span>
        </div>

        {/* Billed note */}
        <p className="text-xs text-gray-500 mt-2 font-medium">
          {billedNote}
        </p>

        {/* Savings highlight logic */}
        {isYearly && (
          <div className="mt-2 text-xs font-bold text-green-400 bg-green-400/10 py-1 px-2 rounded inline-block">
            {t('pricing.discountSaved')} {(priceMonthly * 12 - priceYearly).toLocaleString('vi-VN')} đ /{t('pricing.yearly')}
          </div>
        )}

        {promoApplied && (
          <div className="mt-2 text-sm text-yellow-500 font-bold animate-pulse">
            🎉 {t('pricing.codeApplied')} {promoApplied.code}: {t('pricing.discountSaved')} {(promoApplied.finalAmount).toLocaleString('vi-VN')} đ
          </div>
        )}
      </div>

      <ul className="space-y-3 text-left text-gray-300 text-base flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex items-start">
            <span className="text-green-400 text-lg mr-2 mt-0.5">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {!isFree && !isVip && (
        <div className="mt-6 space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder={t('pricing.promoPlaceholder', 'Mã giảm giá...')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
            />
            <button
              onClick={handleApplyPromo}
              disabled={applyingPromo || !promoCode.trim()}
              className="px-4 py-2 bg-[#CDAD5A] text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {applyingPromo ? '...' : t('pricing.apply')}
            </button>
          </div>
          {promoError && <p className="text-red-400 text-xs text-left">{promoError}</p>}
          {promoApplied && <p className="text-green-400 text-xs text-left">✓ {t('pricing.codeApplied')} "{promoApplied.code}" {t('pricing.applied')}!</p>}
        </div>
      )}

      <button
        onClick={handleClick}
        className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl hover:shadow-cyan-500/20"
      >
        {isFree ? t('pricing.useFree', 'DÙNG FREE') : isVip ? t('pricing.upgradeVip', 'ĐĂNG KÝ NGAY') : plan === "BASIC" ? t('pricing.startStarter', 'BẮT ĐẦU NGAY') : t('pricing.upgradePro', 'NÂNG CẤP')}
      </button>
    </div>
  );
};

export default function PricingTable({ userEmail }: PricingTableProps) {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const [isYearly, setIsYearly] = useState(true); // Default to Yearly
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSelectedYearly, setIsSelectedYearly] = useState(false);
  const [checkoutYearly, setCheckoutYearly] = useState(false);

  const loggedInEmail = session?.user?.email || userEmail || "";
  const [customerEmail, setCustomerEmail] = useState(loggedInEmail);

  const BANK_INFO = {
    BANK_ID: "BIDV",
    ACCOUNT_NO: "8837301927",
    ACCOUNT_NAME: "Pham Van Tung",
  };

  // Translated features - Kept same as before
  const featuresMap = { /* ... (omitted, logic handled in render) ... */ };

  // Helper to get price dynamically
  const getPlanPrice = (plan: string, yearly: boolean) => {
    if (plan === "BASIC" || plan === "STARTER") return yearly ? 1390000 : 169000;
    if (plan === "PROFESSIONAL" || plan === "VIP") return yearly ? 4190000 : 499000;
    return 0;
  };

  const currentCheckoutPrice = getPlanPrice(selectedPlan === "STARTER" || selectedPlan === "BASIC" ? "BASIC" : "PROFESSIONAL", checkoutYearly);

  const handleUpgrade = (plan: string, amount: number, role: string, yearly: boolean) => {
    setSelectedPlan(plan);
    setSelectedAmount(amount);
    setSelectedRole(role);
    setIsSelectedYearly(yearly);
    setCheckoutYearly(yearly);
    setCustomerEmail(loggedInEmail || customerEmail);
    setShowQR(true);
  };

  const handlePayOSPayment = async () => {
    if (!customerEmail || !customerEmail.includes("@")) {
      setMessage(t('pricing.invalidEmail', '⚠️ Please enter a valid email!'));
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/payment/create-payos-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail,
          amount: currentCheckoutPrice,
          plan: selectedPlan,
          role: selectedRole,
          note: `${selectedPlan} - ${checkoutYearly ? t('pricing.yearly', 'Yearly') : t('pricing.monthly', 'Monthly')}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        setMessage("❌ " + t('pricing.paymentError', 'Error') + ": " + (data.error || t('pricing.cannotCreateLink', 'Cannot create payment link')));
      }
    } catch (err) {
      setMessage("❌ " + t('pricing.serverError', 'Server connection error.'));
    }
    setLoading(false);
  };

  return (
    <section className="relative py-20 overflow-hidden font-sans" id="pricing">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/90 z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#CDAD5A]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4">

        {/* Header with Integrated Toggle */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {t('pricing.title', 'CHOOSE YOUR PLAN')}
          </h2>
          <p className="text-gray-400 text-lg mb-8 font-light">
            {t('pricing.subtitle', 'Unlock the full potential of your content with our premium tools.')}
          </p>

          {/* TOGGLE SWITCH INSIDE HEADER */}
          <div className="inline-flex items-center justify-center p-1 bg-gray-800 rounded-full border border-gray-700 shadow-xl">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${!isYearly ? 'bg-gradient-to-r from-[#CDAD5A] to-[#F2E5BC] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {t('pricing.monthly', 'Monthly')}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isYearly ? 'bg-gradient-to-r from-[#CDAD5A] to-[#F2E5BC] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {t('pricing.yearly', 'Yearly')}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isYearly ? 'bg-black text-white' : 'bg-green-500 text-black'}`}>
                -30%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* GÓI CƠ BẢN (STARTER) */}
          <PricingCard
            plan="BASIC"
            priceMonthly={169000}
            priceYearly={1390000} // ~30% OFF (Original 1.69m)
            features={[
              t('pricing.features.starter1', '✅ Viết Kịch bản Viral (20/ngày)'),
              t('pricing.features.starter2', '✅ SEO Tool Pro (20/ngày)'),
              t('pricing.features.starter3', '✅ Phân tích Đối thủ (20/ngày)'),
              t('pricing.features.starter4', '✅ YouTube Teacher (Ngày 1-10)'),
              t('pricing.features.starter5', '✅ AI Voice Dubbing (10 credits)'),
              t('pricing.features.starter6', 'Email support'),
            ]}
            color="#CDAD5A"
            glow="0 0 30px rgba(205,173,90,0.3)"
            isYearly={isYearly}
            onUpgrade={(plan, amount, role, yearly) => handleUpgrade("STARTER", isYearly ? 1390000 : 169000, "CREATIVE", yearly)}
            t={t}
          />

          {/* GÓI CHUYÊN NGHIỆP (VIP) */}
          <PricingCard
            plan="PROFESSIONAL"
            priceMonthly={499000}
            priceYearly={4190000} // ~30% OFF (Original 4.99m)
            features={[
              t('pricing.features.vip1', '🔥 Tất cả tính năng CƠ BẢN (100/ngày)'),
              t('pricing.features.vip_high_cpm_v2', '🔥 Đào Ngách CPM Cao'),
              t('pricing.features.vip_blue_ocean_v2', '🔥 Tìm Ngách Xanh (Blue Ocean)'),
              t('pricing.features.vip_story_v2', '🔥 Kể Chuyện Lịch Sử / Story'),
              t('pricing.features.vip_refiner_v2', '🔥 Chỉnh Sửa & Nâng Cấp Kịch Bản'),
              t('pricing.features.vip_library_v2', '🔥 Thư viện ngách thắng 100%'),
              t('pricing.features.vip_thumbnail_ai', '🔥 Thiết Kế Thumbnail AI'),
              t('pricing.features.vip_velocity_v2', '✅ AI Video Generator (Velocity)'),
              t('pricing.features.vip_virtual_mc_v2', '✅ Virtual MC Creator'),
              t('pricing.features.vip_youtube_teacher_v2', '✅ Thầy YouTube (Day 21-30)'),
              t('pricing.features.vip_dubbing_credits_v2', '✅ AI Voice Dubbing (100 credits)'),
              t('pricing.features.vip_priority_support_v2', 'Priority Zalo Support'),
            ]}
            color="#FF00FF"
            glow="0 0 50px rgba(255,0,255,0.5)"
            isVip
            isFeatured
            isYearly={isYearly}
            onUpgrade={(plan, amount, role, yearly) => handleUpgrade("VIP", isYearly ? 4190000 : 499000, "VIP", yearly)}
            t={t}
          />
        </div>

        <div className="text-center mt-12 pb-12">
          <button
            onClick={() => handleUpgrade("FREE", 0, "FREE", false)}
            className="text-gray-500 hover:text-white text-sm underline transition-colors"
          >
            {t('pricing.wantTrial', 'Bạn muốn trải nghiệm thử trước? Bắt đầu với gói FREE (Có giới hạn)')}
          </button>
          <p className="mt-4 text-gray-600 text-xs text-center border-t border-gray-800 pt-6 max-w-2xl mx-auto">
            * Giá đã bao gồm VAT. Bạn có thể hủy gia hạn bất cứ lúc nào. Thanh toán an toàn qua Cổng thanh toán nội địa.
          </p>
        </div>

        {showQR && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#0D0D10] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-800 animate-slide-up">

              {/* LEFT COLUMN: VISUALS & BENEFITS */}
              <div className="w-full md:w-5/12 bg-gradient-to-br from-[#1a1a20] to-[#0a0a0c] p-8 flex flex-col relative overflow-hidden">
                {/* Hero Image */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl mb-6 border border-gray-700 group">
                  <img
                    src="/images/checkout-hero.jpg"
                    alt="10X Growth"
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">10x Views</div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 text-center">
                  Auditing, Creating, Optimizing on <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Autopilot</span>
                </h3>

                <div className="mt-6 flex-grow ">
                  <table className="w-full text-xs text-left text-gray-400 border-separate border-spacing-y-2">
                    <thead>
                      <tr>
                        <th className="pb-2 font-medium">Feature</th>
                        <th className="pb-2 text-center text-gray-500 font-medium">Free</th>
                        <th className="pb-2 text-center text-[#CDAD5A] font-bold">{selectedPlan === "STARTER" || selectedPlan === "BASIC" ? "Basic" : "Pro"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white/5 rounded-lg">
                        <td className="p-2 rounded-l-lg">Discovery</td>
                        <td className="text-center">Limited</td>
                        <td className="text-center text-white font-bold rounded-r-lg">Unlimited</td>
                      </tr>
                      <tr className="bg-white/5 rounded-lg">
                        <td className="p-2 rounded-l-lg">AI Coach</td>
                        <td className="text-center">5 days</td>
                        <td className="text-center text-white font-bold rounded-r-lg">Full Access</td>
                      </tr>
                      <tr className="bg-white/5 rounded-lg">
                        <td className="p-2 rounded-l-lg">SEO Tools</td>
                        <td className="text-center">Basic</td>
                        <td className="text-center text-white font-bold rounded-r-lg">Pro</td>
                      </tr>
                      <tr className="bg-white/5 rounded-lg">
                        <td className="p-2 rounded-l-lg">Viral Script</td>
                        <td className="text-center">No</td>
                        <td className="text-center text-white font-bold rounded-r-lg">Yes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT COLUMN: CHECKOUT FORM */}
              <div className="w-full md:w-7/12 bg-[#0D0D10] p-8 relative flex flex-col">
                <button
                  onClick={() => setShowQR(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white transition bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>

                <h2 className="text-2xl font-black text-white mb-6">Checkout</h2>

                {/* PLAN TOGGLE */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {/* Monthly Option */}
                  <div
                    onClick={() => setCheckoutYearly(false)}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative ${!checkoutYearly ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'}`}
                  >
                    <div className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Monthly</div>
                    <div className="text-2xl font-black text-white">
                      {(getPlanPrice(selectedPlan === "STARTER" || selectedPlan === "BASIC" ? "BASIC" : "PROFESSIONAL", false) / 1000).toFixed(0)}k <span className="text-sm font-normal text-gray-500">/tháng</span>
                    </div>
                  </div>

                  {/* Yearly Option */}
                  <div
                    onClick={() => setCheckoutYearly(true)}
                    className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all ${checkoutYearly ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'}`}
                  >
                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg transform -translate-y-1">
                      SAVE 30%
                    </div>
                    <div className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Yearly</div>
                    <div className="text-2xl font-black text-white">
                      {Math.round(getPlanPrice(selectedPlan === "STARTER" || selectedPlan === "BASIC" ? "BASIC" : "PROFESSIONAL", true) / 12000).toFixed(0)}k <span className="text-sm font-normal text-gray-500">/tháng</span>
                    </div>
                  </div>
                </div>

                {/* SUMMARY */}
                <div className="mt-auto border-t border-gray-800 pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold text-lg">{selectedPlan === "STARTER" || selectedPlan === "BASIC" ? "Basic Plan" : "Professional Plan"}</span>
                    <span className="text-white font-bold text-lg">{currentCheckoutPrice.toLocaleString('vi-VN')} đ</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-6">
                    {checkoutYearly
                      ? `Thanh toán ${currentCheckoutPrice.toLocaleString('vi-VN')} đ mỗi năm. Hủy bất cứ lúc nào.`
                      : `Thanh toán ${currentCheckoutPrice.toLocaleString('vi-VN')} đ mỗi tháng.`}
                  </p>

                  <div className="mb-4">
                    <label className="text-xs text-gray-400 font-bold mb-1 block">EMAIL (For account activation)</label>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      disabled={!!loggedInEmail}
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>

                  <button
                    onClick={handlePayOSPayment}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 transform hover:translate-y-[-2px]"
                  >
                    {loading ? 'Processing...' : `Pay Now • ${currentCheckoutPrice.toLocaleString('vi-VN')} đ`}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-600">
                    <span>🔒 Secure Payment via PayOS</span>
                    <span>•</span>
                    <span>Instant Activation</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}