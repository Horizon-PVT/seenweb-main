// components/PricingTable.tsx - BẢN FIX QR URL TRỰC TIẾP + DEBUG (12/2025)
import React, { useState } from "react";

interface PricingTableProps {
  setSelectedPlan?: (plan: string) => void;
}

const featuresMap = {
  FREE: [
    "Chỉ sử dụng 2 công cụ: Viết kịch bản + SEO YouTube",
    "Giới hạn: 2 lần/ngày",
    "Không được sử dụng các công cụ khác",
  ],
  CREATIVE: [
    "Gói FREE + Mở tools phân tích đối thủ (độc quyền)",
    "Không giới hạn lượt sử dụng",
    "Hỗ trợ qua email",
    "Truy cập Chatbot AI full quyền",
  ],
  SUPER: [
    "MỞ KHÓA TOÀN BỘ 10 CÔNG CỤ:",
    "Phân tích đối thủ • Tìm kênh ẩn • Tìm Micro Niches (độc quyền)",
    "Narrative Studio (độc quyền) – kiếm tiền KDP Amazon",
    "Viết kịch bản nâng cao • Tạo Thumbnail AI • Text-to-Speech",
    "Tối ưu SEO & nội dung • Rival Scanner • Velocity Tool",
    "Tham gia khóa học online, Zoom, tài liệu độc quyền",
  ],
  VIP: [
    "Hỗ trợ chuyên sâu trực tiếp từ chuyên gia",
    "Zoom riêng + đào tạo 1VS1 đến khi kiếm tiền YouTube/Affiliate",
    "Hướng dẫn kiếm tiền trên KDP Amazon",
    "Liên hệ: https://zalo.me/0789284078",
  ],
};

const PricingCard = ({ 
  plan, price, features, color, glow, isFeatured, isVip, isFree, isYearly, onUpgrade 
}: { 
  plan: string; price: string; features: string[]; color: string; glow: string; 
  isFeatured?: boolean; isVip?: boolean; isFree?: boolean; isYearly: boolean; 
  onUpgrade: (plan: string, amount: number, yearly: boolean) => void;
}) => {
  const handleClick = () => {
    if (isFree) return;
    if (isVip) {
      window.open("https://zalo.me/0789284078", "_blank");
      return;
    }

    const amount = isYearly 
      ? (plan === "SÁNG TẠO" ? 3500000 : 6500000) 
      : (plan === "SÁNG TẠO" ? 349000 : 649000);

    onUpgrade(plan, amount, isYearly);
  };

  return (
    <div className="relative rounded-2xl bg-black/90 border border-gray-800 p-6 flex flex-col text-center transition-all hover:scale-105 shadow-2xl" style={{ boxShadow: glow }}>
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

export default function PricingTable({ setSelectedPlan }: PricingTableProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<{ qrCode: string; checkoutUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan: string, amount: number, yearly: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/payos/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          plan: plan === "SÁNG TẠO" ? "creative" : "super",
          isYearly: yearly,
        }),
      });

      const data = await res.json();
      console.log('DEBUG QR DATA:', data); // ← DEBUG: Mở F12 → Console xem qrCode có giá trị gì (URL or base64?)
      
      if (data.qrCode && data.checkoutUrl) {
        setQrData({ qrCode: data.qrCode, checkoutUrl: data.checkoutUrl });
        setShowQR(true);
      } else {
        alert("Lỗi tạo thanh toán: " + (data.error || "Vui lòng thử lại"));
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="py-16 bg-gradient-to-b from-black via-[#0a0e17] to-black">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-black text-center mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-600 bg-clip-text text-transparent tracking-widest">
            BẢNG GIÁ SEENYT
          </h1>
          <p className="text-lg md:text-xl text-center font-bold text-yellow-400 mb-3">
            Nền tảng công nghệ hỗ trợ YouTube/Youtuber tốt nhất 2025 theo bình chọn của cộng đồng sáng tạo số Châu Á
          </p>

          <div className="flex justify-center items-center gap-5 mb-10">
            <span className="text-lg text-gray-300">Thanh toán theo</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isYearly} onChange={() => setIsYearly(!isYearly)} className="sr-only peer" />
              <div className="w-20 h-10 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600"></div>
              <span className="absolute left-3 text-white font-bold text-sm peer-checked:left-2 peer-checked:text-black">
                {isYearly ? "NĂM" : "THÁNG"}
              </span>
            </label>
            <span className="text-lg font-bold text-green-400 animate-pulse">
              Tiết kiệm 20% khi dùng gói 12 tháng!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <PricingCard plan="KHÁM PHÁ" price="FREE" features={featuresMap.FREE} color="#00D4FF" glow="0 0 25px #00D4FF" isFree isYearly={isYearly} onUpgrade={handleUpgrade} />
            <PricingCard plan="SÁNG TẠO" price={isYearly ? "3.500.000đ" : "349.000đ"} features={featuresMap.CREATIVE} color="#22C55E" glow="0 0 35px #22C55E" isYearly={isYearly} onUpgrade={handleUpgrade} />
            <PricingCard plan="VƯỢT TRỢI" price={isYearly ? "6.500.000đ" : "649.000đ"} features={featuresMap.SUPER} color="#FBBF24" glow="0 0 50px #FBBF24" isFeatured isYearly={isYearly} onUpgrade={handleUpgrade} />
            <PricingCard plan="CHUYÊN SÂU 1VS1" price="LIÊN HỆ" features={featuresMap.VIP} color="#A855F7" glow="0 0 40px #A855F7" isVip isYearly={isYearly} onUpgrade={handleUpgrade} />
          </div>
        </div>
      </section>

      {/* MODAL QR FIX BROKEN IMAGE – HIỆN ĐẸP TO ĐÙNG, FALLBACK NẾU BROKEN */}
      {showQR && qrData && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setShowQR(false)}>
          <div className="bg-white p-10 rounded-3xl text-center max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-3xl font-black mb-6 text-gray-800">Quét QR để nâng cấp ngay!</h3>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(qrData.qrCode)}`}
              alt="QR PayOS" 
              className="mx-auto w-80 h-80 border-8 border-gray-200 rounded-2xl" 
              onError={(e) => {
                e.currentTarget.style.display = 'none'; // Ẩn img nếu broken
                e.currentTarget.nextSibling.style.display = 'block'; // Hiện fallback
              }}
            />
            <div style={{ display: 'none' }} className="mx-auto w-80 h-80 border-8 border-gray-200 rounded-2xl flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">QR không tải được, bấm link bên dưới!</p>
            </div>
            <p className="mt-6 text-lg text-gray-700">
              Hoặc mở link thanh toán:{" "}
              <a href={qrData.checkoutUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">
                Click tại đây
              </a>
            </p>
            <button onClick={() => setShowQR(false)} className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-xl text-xl transition">
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}