import React, { useState } from "react";
import { useSession } from "next-auth/react";

interface PricingTableProps {
  setSelectedPlan?: (plan: string) => void;
  userEmail?: string;
}

const featuresMap = {
  FREE: [
    "Chỉ sử dụng 2 công cụ: Viết kịch bản + SEO YouTube",
    "Giới hạn: 2 lần sử dụng công cụ",
    "Không được sử dụng các công cụ khác",
  ],
  CREATIVE: [
    "Gói FREE + Mở tools phân tích đối thủ (độc quyền)",
    "Không giới hạn lượt sử dụng",
    "Hỗ trợ qua email",
    "Truy cập Chatbot AI full quyền",
  ],
  SUPER: [
    "MỞ KHÓA TOÀN BỘ  CÔNG CỤ:",
    "Phân tích đối thủ • Tìm kênh ẩn • Tìm Micro Niches (độc quyền)",
    "Narrative Studio (độc quyền) – kiếm tiền KDP Amazon",
    "Viết kịch bản nâng cao • Tạo Thumbnail AI • Text-to-Speech",
    "Tối ưu SEO & nội dung • Rival Scanner • Velocity Tool",
    "Tham gia khóa học online, Zoom, tài liệu độc quyền",
  ],
  VIP: [
    "Hỗ trợ chuyên sâu trực tiếp từ chuyên gia",
    "Được cấp tài khoản sử dụng SeenYT max riêng",
    "Zoom riêng + đào tạo 1VS1 đến khi kiếm tiền YouTube/Affiliate",
    "Hướng dẫn kiếm tiền trên KDP Amazon",
    "Liên hệ: https://zalo.me/0789284078",
  ],
};

const planToRole: Record<string, string> = {
  "SÁNG TẠO": "CREATIVE",
  "TOÀN TRI": "SUPER",
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
  const handleClick = () => {
    if (isFree) return;
    if (isVip) {
      window.open("https://zalo.me/0789284078", "_blank");
      return;
    }

    const amount = isYearly
      ? plan === "SÁNG TẠO" ? 3500000 : 6500000
      : plan === "SÁNG TẠO" ? 349000 : 649000;

    const role = planToRole[plan] || "CREATIVE";

    onUpgrade(plan, amount, role, isYearly);
  };

  const price = isYearly ? priceYearly : priceMonthly;

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
      <h2 className="text-4xl font-bold mb-6 tracking-tight" style={{ color }}>
        {price}
      </h2>
      <ul className="space-y-3 text-left text-gray-300 text-base flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex items-start">
            <span className="text-green-400 text-lg mr-2 mt-0.5">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleClick}
        className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl"
      >
        {isFree ? "BẮT ĐẦU NGAY" : isVip ? "LIÊN HỆ NGAY" : "NÂNG CẤP NGAY"}
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
              Năm (Tiết kiệm 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          <PricingCard
            plan="SÁNG TẠO"
            priceMonthly="349.000 đ"
            priceYearly="3.500.000 đ"
            features={featuresMap.CREATIVE}
            color="#CDAD5A"
            glow="0 0 30px rgba(205,173,90,0.8)"
            isYearly={isYearly}
            onUpgrade={handleUpgrade}
          />
          <PricingCard
            plan="TOÀN TRI"
            priceMonthly="649.000 đ"
            priceYearly="6.500.000 đ"
            features={featuresMap.SUPER}
            color="#00FFFF"
            glow="0 0 40px rgba(0,255,255,0.8)"
            isFeatured
            isYearly={isYearly}
            onUpgrade={handleUpgrade}
          />
          <PricingCard
            plan="VIP"
            priceMonthly="Liên hệ"
            priceYearly="Liên hệ"
            features={featuresMap.VIP}
            color="#FF00FF"
            glow="0 0 40px rgba(255,0,255,0.8)"
            isVip
            isYearly={isYearly}
            onUpgrade={handleUpgrade}
          />
        </div>
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

          
            <p className="text-sm text-gray-500 mb-6">Quét QR hoặc chuyển khoản theo thông tin bên dưới</p>

            <div className="bg-gray-100 p-4 rounded-xl mb-6 inline-block">
              <img src={generateQRUrl()} alt="QR Transfer" className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-lg" />
            </div>

            <div className="text-left bg-gray-50 p-4 rounded-xl text-sm mb-6 space-y-2 border border-gray-200">
              <p><span className="font-bold text-gray-800">Ngân hàng:</span> {BANK_INFO.BANK_ID}</p>
              <p><span className="font-bold text-gray-800">Số TK:</span> <span className="font-mono text-lg font-bold text-blue-600">{BANK_INFO.ACCOUNT_NO}</span></p>
              <p><span className="font-bold text-gray-800">Chủ TK:</span> {BANK_INFO.ACCOUNT_NAME}</p>
              <p><span className="font-bold text-gray-800">Số tiền:</span> <span className="font-bold text-green-700">{selectedAmount.toLocaleString("vi-VN")} đ</span></p>
              <p>
                <span className="font-bold text-gray-800">Nội dung CK (bắt buộc):</span>
                <span
                  className="block mt-1 bg-yellow-100 p-2 rounded border border-yellow-300 font-mono font-bold text-red-600 text-center select-all cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(generateQRUrl().includes('addInfo') ? decodeURIComponent(generateQRUrl().split('addInfo=')[1].split('&')[0]) : '')}
                >
                  {decodeURIComponent(generateQRUrl().split('addInfo=')[1]?.split('&')[0] || 'SEENWEB ...')}
                </span>
              </p>

              <p className="font-bold text-gray-800 pt-3">Email nhận kích hoạt:</p>
              <input
                type="email"
                placeholder="nhập email của bạn"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-2 border border-blue-500 rounded-md text-base text-gray-900"
                disabled={!!loggedInEmail}
              />
            </div>

            <button
              onClick={handleConfirmPaid}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "TÔI ĐÃ CHUYỂN KHOẢN XONG"}
            </button>

            {message && <p className="mt-4 text-center font-bold">{message}</p>}

            <p className="mt-4 text-xs text-gray-400">
              Sau khi chuyển xong, bấm nút:"TÔI ĐÃ CHUYỂN KHOẢN XONG"ở trên để thông báo Admin kiểm tra nhé!Tiếp Tục bấm f5 để reload lại . Liên hệ: <b>0789284078</b>
            </p>
          </div>
        </div>
      )}
    </>
  );
}