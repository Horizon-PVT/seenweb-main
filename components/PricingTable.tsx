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
  priceMonthly: string;
  priceYearly: string;
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

    const baseAmount = isYearly
      ? plan === "STARTER" ? 1490000 : plan === "VIP" ? 5490000 : 3990000
      : plan === "STARTER" ? 149000 : plan === "VIP" ? 549000 : 399000;

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
    if (isFree) return;

    const baseAmount = isYearly
      ? plan === "STARTER" ? 1490000 : plan === "VIP" ? 5490000 : 3990000
      : plan === "STARTER" ? 149000 : plan === "VIP" ? 549000 : 399000;

    const amount = promoApplied ? promoApplied.finalAmount : baseAmount;
    const role = planToRole[plan] || "CREATIVE";

    onUpgrade(plan, amount, role, isYearly);
  };

  const price = isYearly ? priceYearly : priceMonthly;
  const baseAmount = isYearly
    ? plan === "STARTER" ? 1490000 : plan === "VIP" ? 5490000 : plan === "PRO" ? 3990000 : 0
    : plan === "STARTER" ? 149000 : plan === "VIP" ? 549000 : plan === "PRO" ? 399000 : 0;
  const finalAmount = promoApplied ? promoApplied.finalAmount : baseAmount;

  return (
    <div
      className="relative rounded-2xl bg-black/90 border border-gray-800 p-6 flex flex-col text-center transition-all hover:scale-105 shadow-2xl"
      style={{ boxShadow: glow }}
    >
      {isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-600 text-black font-black text-sm px-6 py-2 rounded-full shadow-xl z-10 whitespace-nowrap">
          {t('pricing.mostPopular', 'MOST POPULAR')}
        </div>
      )}
      <h3 className="text-2xl font-bold mb-3 text-white tracking-wide">{plan}</h3>
      <div>
        {promoApplied ? (
          <>
            <h2 className="text-2xl font-bold line-through text-gray-500" style={{ color }}>
              {price}
            </h2>
            <h2 className="text-4xl font-bold mb-2 tracking-tight text-green-400">
              {finalAmount.toLocaleString('vi-VN')} đ
            </h2>
            <p className="text-sm text-yellow-400 font-semibold mb-4">🎉 {t('pricing.discountSaved', 'Saved')} {promoApplied.discount.toLocaleString('vi-VN')} đ</p>
          </>
        ) : (
          <h2 className="text-4xl font-bold mb-6 tracking-tight" style={{ color }}>
            {price}
          </h2>
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
              placeholder={t('pricing.promoPlaceholder', 'Enter promo code')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
            />
            <button
              onClick={handleApplyPromo}
              disabled={applyingPromo || !promoCode.trim()}
              className="px-4 py-2 bg-[#CDAD5A] text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {applyingPromo ? '...' : t('pricing.apply', 'Apply')}
            </button>
          </div>
          {promoError && <p className="text-red-400 text-xs text-left">{promoError}</p>}
          {promoApplied && <p className="text-green-400 text-xs text-left">✓ {t('pricing.codeApplied', 'Code')} "{promoApplied.code}" {t('pricing.applied', 'applied')}</p>}
        </div>
      )}

      <button
        onClick={handleClick}
        className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl"
      >
        {isFree ? t('pricing.useFree', 'USE FREE') : isVip ? t('pricing.upgradeVip', 'UPGRADE VIP') : plan === "STARTER" ? t('pricing.startStarter', 'START WITH STARTER') : t('pricing.upgradePro', 'UPGRADE PRO')}
      </button>
    </div>
  );
};

export default function PricingTable({ userEmail }: PricingTableProps) {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const [isYearly, setIsYearly] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSelectedYearly, setIsSelectedYearly] = useState(false);

  const loggedInEmail = session?.user?.email || userEmail || "";
  const [customerEmail, setCustomerEmail] = useState(loggedInEmail);

  const BANK_INFO = {
    BANK_ID: "BIDV",
    ACCOUNT_NO: "8837301927",
    ACCOUNT_NAME: "Pham Van Tung",
  };

  // Translated features
  const featuresMap = {
    FREE: [
      t('pricing.features.free1', '✅ High CPM Niche Finder (1x/day)'),
      t('pricing.features.free2', '⚠️ Scriptwriter (preview only)'),
      t('pricing.features.free3', '⚠️ SEO Tool (preview only)'),
      t('pricing.features.free4', '✅ Niche Library (first 5 niches)'),
      t('pricing.features.free5', '✅ YouTube Teacher (Day 1-5)'),
    ],
    STARTER: [
      t('pricing.features.starter1', 'All FREE features (unlimited)'),
      t('pricing.features.starter2', '✅ Scriptwriter (full + copy)'),
      t('pricing.features.starter3', '✅ SEO Tool (full + copy)'),
      t('pricing.features.starter4', '✅ Competitor Analysis'),
      t('pricing.features.starter5', '✅ YouTube Teacher (Day 6-20)'),
      t('pricing.features.starter6', '✅ 10 AI Dubbing credits'),
      t('pricing.features.starter7', 'Email support'),
    ],
    PRO: [
      t('pricing.features.pro1', 'All STARTER features'),
      t('pricing.features.pro2', '✅ Blue Ocean Niche Finder'),
      t('pricing.features.pro3', '✅ Story/History Generator'),
      t('pricing.features.pro4', '✅ Script Refiner & Upgrader'),
      t('pricing.features.pro5', '✅ AI Thumbnail Designer'),
      t('pricing.features.pro6', '✅ OpenAI TTS (500k chars)'),
      t('pricing.features.pro7', '✅ Niche Library (20+ niches)'),
      t('pricing.features.pro8', '✅ 30 AI Dubbing credits'),
      t('pricing.features.pro9', 'Priority support'),
    ],
    VIP: [
      t('pricing.features.vip1', 'All PRO features'),
      t('pricing.features.vip2', '✅ AI Dubbing Studio (100 credits)'),
      t('pricing.features.vip3', '✅ AI Video Generator (Velocity)'),
      t('pricing.features.vip4', '✅ Virtual MC Creator'),
      t('pricing.features.vip5', '✅ YouTube Teacher (Day 21-30)'),
      t('pricing.features.vip6', '✅ Unlimited Text-to-Speech'),
      t('pricing.features.vip7', '1-on-1 Zalo Support (Fast track)'),
    ],
  };

  const handleUpgrade = (plan: string, amount: number, role: string, yearly: boolean) => {
    setSelectedPlan(plan);
    setSelectedAmount(amount);
    setSelectedRole(role);
    setIsSelectedYearly(yearly);
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
          amount: selectedAmount,
          plan: selectedPlan,
          role: selectedRole,
          note: `${selectedPlan} - ${isSelectedYearly ? t('pricing.yearly', 'Yearly') : t('pricing.monthly', 'Monthly')}`,
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
    <>
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex justify-center mb-10">
          <div className="bg-gray-800 rounded-full p-1 flex items-center">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full transition ${!isYearly ? "bg-yellow-500 text-black font-bold" : "text-gray-400"}`}
            >
              {t('pricing.monthly', 'Monthly')}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full transition ${isYearly ? "bg-yellow-500 text-black font-bold" : "text-gray-400"}`}
            >
              {t('pricing.yearly', 'Yearly')} ({t('pricing.save2months', 'Save ~2 months')})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[90rem] mx-auto">
          <PricingCard
            plan="FREE"
            priceMonthly="0 đ"
            priceYearly="0 đ"
            features={featuresMap.FREE}
            color="#AAAAAA"
            glow="0 0 20px rgba(170,170,170,0.5)"
            isFree
            isYearly={isYearly}
            onUpgrade={handleUpgrade}
            t={t}
          />
          <PricingCard
            plan="STARTER"
            priceMonthly="149.000 đ"
            priceYearly="1.490.000 đ"
            features={featuresMap.STARTER}
            color="#CDAD5A"
            glow="0 0 30px rgba(205,173,90,0.6)"
            isFeatured
            isYearly={isYearly}
            onUpgrade={handleUpgrade}
            t={t}
          />
          <PricingCard
            plan="PRO"
            priceMonthly="399.000 đ"
            priceYearly="3.990.000 đ"
            features={featuresMap.PRO}
            color="#A855F7"
            glow="0 0 40px rgba(168,85,247,0.8)"
            isYearly={isYearly}
            onUpgrade={handleUpgrade}
            t={t}
          />
          <PricingCard
            plan="VIP"
            priceMonthly="549.000 đ"
            priceYearly="5.490.000 đ"
            features={featuresMap.VIP}
            color="#FF00FF"
            glow="0 0 50px rgba(255,0,255,0.8)"
            isVip
            isYearly={isYearly}
            onUpgrade={handleUpgrade}
            t={t}
          />
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            {t('pricing.needSupport', 'Need 1-on-1 support or coaching?')}{" "}
            <Link href="/coaching" className="text-[#CDAD5A] font-bold hover:underline">
              {t('pricing.viewCoaching', 'View 1-on-1 Coaching Program')}
            </Link>
          </p>
        </div>

        {showQR && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowQR(false)}>
            <div
              className="bg-white p-6 md:p-8 rounded-3xl text-center max-w-md w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl">
                ✕
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('pricing.payForPlan', 'Pay for')} {selectedPlan}</h2>
              <p className="text-lg font-bold text-green-600 mb-6">{selectedAmount.toLocaleString("vi-VN")} đ</p>

              <div className="text-left bg-gray-50 p-4 rounded-xl text-sm mb-6 border border-gray-200">
                <p className="font-bold text-gray-800 mb-2">{t('pricing.activationEmail', 'Email for activation')}:</p>
                <input
                  type="email"
                  placeholder={t('pricing.enterEmail', 'Enter your email')}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-3 border border-blue-500 rounded-lg text-base text-gray-900"
                  disabled={!!loggedInEmail}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t('pricing.autoActivate', 'After payment, your plan will be activated instantly!')}
                </p>
              </div>

              <button
                onClick={handlePayOSPayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? t('pricing.creatingLink', 'Creating link...') : t('pricing.payNow', '💳 PAY NOW')}
              </button>
              <p className="mt-4 text-xs text-gray-500 text-center">
                {t('pricing.redirectNote', 'You will be redirected to the payment page. After successful payment, your plan will be')} <b>{t('pricing.autoActivated', 'auto-activated')}</b> {t('pricing.instantly', 'instantly!')} ✨
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}