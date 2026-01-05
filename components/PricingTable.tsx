import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface PricingTableProps {
  setSelectedPlan?: (plan: string) => void;
  userEmail?: string;
}

const featuresMap = {
  FREE: [
    "Trải nghiệm workflow 3 bước (Niche, Script, SEO)",
    "Dùng 3 công cụ cốt lõi cho người mới",
    "Giới hạn: 3 lần sử dụng / ngày (reset mỗi ngày)",
  ],
  STARTER: [
    "Mở khóa giới hạn sử dụng các tool cơ bản",
    "Làm video đều đặn hàng ngày",
    "Phù hợp người mới bắt đầu nghiêm túc",
    "Hỗ trợ qua email",
  ],
  PRO: [
    "MỞ KHÓA TOÀN BỘ CÔNG CỤ (bao gồm Kênh ẩn, Spy đối thủ)",
    "Phân tích nâng cao & chiến lược ngách",
    "Narrative Studio & Velocity Tool",
    "Phù hợp creator muốn tăng tốc & kiếm tiền nhanh",
    "Ưu tiên hỗ trợ",
  ],
};

const planToRole: Record<string, string> = {
  "STARTER": "CREATIVE",
  "PRO": "SUPER",
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
      ? plan === "STARTER" ? 1490000 : 3990000
      : plan === "STARTER" ? 149000 : 399000;

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
        setPromoError(data.error || 'Mã không hợp lệ');
      }
    } catch (error) {
      setPromoError('Lỗi kết nối');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleClick = () => {
    if (isFree) return;
    if (isVip) {
      window.open("https://zalo.me/0789284078", "_blank");
      return;
    }

    const baseAmount = isYearly
      ? plan === "STARTER" ? 1490000 : 3990000
      : plan === "STARTER" ? 149000 : 399000;

    const amount = promoApplied ? promoApplied.finalAmount : baseAmount;
    const role = planToRole[plan] || "CREATIVE";

    onUpgrade(plan, amount, role, isYearly);
  };

  const price = isYearly ? priceYearly : priceMonthly;
  const baseAmount = isYearly
    ? plan === "STARTER" ? 1490000 : plan === "PRO" ? 3990000 : 0
    : plan === "STARTER" ? 149000 : plan === "PRO" ? 399000 : 0;
  const finalAmount = promoApplied ? promoApplied.finalAmount : baseAmount;

  return (
    <div
      className="relative rounded-2xl bg-black/90 border border-gray-800 p-6 flex flex-col text-center transition-all hover:scale-105 shadow-2xl"
      style={{ boxShadow: glow }}
    >
      {isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-600 text-black font-black text-sm px-6 py-2 rounded-full shadow-xl z-10 whitespace-nowrap">
          PHỔ BIẾN NHẤT
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
            <p className="text-sm text-yellow-400 font-semibold mb-4">🎉 Giảm {promoApplied.discount.toLocaleString('vi-VN')} đ</p>
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
              placeholder="Nhập mã khuyến mại"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
            />
            <button
              onClick={handleApplyPromo}
              disabled={applyingPromo || !promoCode.trim()}
              className="px-4 py-2 bg-[#CDAD5A] text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {applyingPromo ? '...' : 'Áp dụng'}
            </button>
          </div>
          {promoError && <p className="text-red-400 text-xs text-left">{promoError}</p>}
          {promoApplied && <p className="text-green-400 text-xs text-left">✓ Mã "{promoApplied.code}" đã được áp dụng</p>}
        </div>
      )}

      <button
        onClick={handleClick}
        className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl"
      >
        {isFree ? "DÙNG MIỄN PHÍ" : isVip ? "LIÊN HỆ NGAY" : plan === "STARTER" ? "BẮT ĐẦU VỚI STARTER" : "NÂNG CẤP PRO"}
      </button>
    </div>
  );
};

export default function PricingTable({ userEmail }: PricingTableProps) {
  const { data: session } = useSession();
  const [isYearly, setIsYearly] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSelectedYearly, setIsSelectedYearly] = useState(false);
  // PayOS automatic payment only

  const loggedInEmail = session?.user?.email || userEmail || "";
  const [customerEmail, setCustomerEmail] = useState(loggedInEmail);

  // Bank info (anh chỉnh ở đây hoặc .env nếu muốn)
  const BANK_INFO = {
    BANK_ID: "BIDV", // Mã ngân hàng (BIDV, MB, VCB, TPB, v.v.)
    ACCOUNT_NO: "8837301927",
    ACCOUNT_NAME: "Pham Van Tung", // Tên chủ TK (URL encode tự động)
  };

  const handleUpgrade = (plan: string, amount: number, role: string, yearly: boolean) => {
    setSelectedPlan(plan);
    setSelectedAmount(amount);
    setSelectedRole(role);
    setIsSelectedYearly(yearly);
    setCustomerEmail(loggedInEmail || customerEmail);
    setShowQR(true); // Chỉ mở QR, không gửi Telegram
  };

  const handleConfirmPaid = async () => {
    if (!customerEmail || !customerEmail.includes("@")) {
      setMessage("⚠️ Vui lòng nhập email hợp lệ!");
      return;
    }

    setLoading(true);
    setMessage("");

    // Tạo nội dung CK unique với ngày hiện tại để tránh trùng
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const baseContent = `${customerEmail.split("@")[0].toUpperCase()}`;
    const orderCode = `SEENWEB ${selectedPlan} ${baseContent} ${today} ${isSelectedYearly ? "12M" : "1M"}`;

    try {
      const res = await fetch("/api/notify/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail,
          plan: selectedPlan,
          role: selectedRole,
          amount: selectedAmount,
          orderCode: orderCode, // Unique nhờ có ngày
          note: "Khách báo đã chuyển khoản xong (thủ công)",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Đã gửi thông báo thành công! Hệ thống sẽ tự động kích hoạt .");
      } else {
        setMessage("❌ Lỗi: " + (data.error || "Không xác định"));
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối server.");
    }
    setLoading(false);
  };

  // Handle PayOS automatic payment
  const handlePayOSPayment = async () => {
    if (!customerEmail || !customerEmail.includes("@")) {
      setMessage("⚠️ Vui lòng nhập email hợp lệ!");
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
          note: `${selectedPlan} - ${isSelectedYearly ? "Năm" : "Tháng"}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.data.paymentUrl) {
        // Redirect to PayOS payment page
        window.location.href = data.data.paymentUrl;
      } else {
        setMessage("❌ Lỗi: " + (data.error || "Không thể tạo link thanh toán"));
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối server.");
    }
    setLoading(false);
  };

  // Sinh QR động từ VietQR
  const generateQRUrl = () => {
    if (!customerEmail || !customerEmail.includes("@")) return "";

    const username = customerEmail.split("@")[0].toUpperCase();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const addInfo = `SEENWEB ${selectedPlan} ${username} ${today} ${isSelectedYearly ? "12M" : "1M"}`;

    const encodedName = encodeURIComponent(BANK_INFO.ACCOUNT_NAME);
    const encodedInfo = encodeURIComponent(addInfo);

    return `https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${BANK_INFO.ACCOUNT_NO}-compact2.png?amount=${selectedAmount}&addInfo=${encodedInfo}&accountName=${encodedName}`;
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
              Tháng
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full transition ${isYearly ? "bg-yellow-500 text-black font-bold" : "text-gray-400"}`}
            >
              Năm (Tiết kiệm ~2 tháng)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
          />
          {/* STARTER - Popular */}
          <PricingCard
            plan="STARTER"
            priceMonthly="149.000 đ"
            priceYearly="1.490.000 đ"
            features={featuresMap.STARTER}
            color="#00FFFF" // Changed from Creative Gold to Cyan/Blueish for Starter? Or keep Gold? Prompt says STARTER is HIGHLIGHT. Let's make STARTER Gold (#CDAD5A) and PRO Purple/Red? Check prompt.
            // Prompt: STARTER (HIGHLIGHT). PRO (Red/Pink?). 
            // Old: Creative (Gold), Super (Cyan), VIP (Magenta).
            // Let's make STARTER #CDAD5A (Gold) and PRO #A855F7 (Purple) to match Hero? Or keeping PRO as premium.
            // Let's use Gold for STARTER as it's "Highlights".
            glow="0 0 30px rgba(205,173,90,0.6)"
            isFeatured
            isYearly={isYearly}
            onUpgrade={handleUpgrade}
          />
          {/* PRO */}
          <PricingCard
            plan="PRO"
            priceMonthly="399.000 đ"
            priceYearly="3.990.000 đ"
            features={featuresMap.PRO}
            color="#A855F7" // Purple
            glow="0 0 40px rgba(168,85,247,0.8)"
            isYearly={isYearly}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Text VIP Only */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Cần hỗ trợ 1–1 hoặc coaching?{" "}
            <Link href="/coaching" className="text-[#CDAD5A] font-bold hover:underline">
              Xem chương trình Coaching 1-1
            </Link>
          </p>
        </div>

        {/* Modal QR */}
        {showQR && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowQR(false)}>
            <div
              className="bg-white p-6 md:p-8 rounded-3xl text-center max-w-md w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl">
                ✕
              </button>


              <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán gói {selectedPlan}</h2>
              <p className="text-lg font-bold text-green-600 mb-6">{selectedAmount.toLocaleString("vi-VN")} đ</p>

              <div className="text-left bg-gray-50 p-4 rounded-xl text-sm mb-6 border border-gray-200">
                <p className="font-bold text-gray-800 mb-2">Email nhận kích hoạt:</p>
                <input
                  type="email"
                  placeholder="nhập email của bạn"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-3 border border-blue-500 rounded-lg text-base text-gray-900"
                  disabled={!!loggedInEmail}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Sau khi thanh toán, gói sẽ được kích hoạt tự động ngay lập tức!
                </p>
              </div>

              {/* PayOS Automatic Payment */}
              <button
                onClick={handlePayOSPayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Đang tạo link..." : "💳 THANH TOÁN NGAY"}
              </button>
              <p className="mt-4 text-xs text-gray-500 text-center">
                Bạn sẽ được chuyển tới trang thanh toán. Sau khi thanh toán thành công, gói sẽ <b>tự động được kích hoạt</b> ngay lập tức! ✨
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}