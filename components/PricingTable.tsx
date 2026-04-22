import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Zap, ShieldCheck, Crown, Video, BookOpen, Send } from "lucide-react";
import CheckoutModal from './dashboard/CheckoutModal';

export default function PricingTable() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Prices
  const getPrice = (monthlyPrice: number) => {
    return isYearly ? Math.round(monthlyPrice * 0.7) : monthlyPrice; // 30% off for yearly
  };

  const formatPrice = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <section className="relative py-20 overflow-hidden font-sans" id="pricing">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/90 z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#CDAD5A]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 max-w-7xl">
        {/* Header with Integrated Toggle */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Lựa Chọn Gói AI Tối Ưu Cho Bạn
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
            BẢNG GIÁ HỆ SINH THÁI 3 TRỤ CỘT
          </h2>
          <p className="text-gray-400 text-lg mb-8 font-light">
            Mua lẻ để giải quyết vấn đề. Hoạt động trên Web hoặc cài đặt App Desktop (.exe).
          </p>

          {/* COMPACT TOGGLE SWITCH */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-900/80 backdrop-blur-md p-1 rounded-full border border-gray-700 flex items-center shadow-2xl">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${!isYearly ? 'bg-gray-700 text-white shadow-inner' : 'text-gray-400 hover:text-white'}`}
              >
                Tháng
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`relative px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isYearly ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Năm (Save 30%)
                <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm animate-bounce">
                  HOT
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* 1. WEBSPACE */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 flex flex-col hover:border-blue-500/50 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Webspace</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6 min-h-[40px]">Hệ thống lập kế hoạch, tối ưu chuẩn SEO đa nền tảng.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-black text-white">{formatPrice(getPrice(199))}k</span>
              <span className="text-gray-500"> /tháng</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-gray-500 mt-0.5" /> Công cụ phân tích Ngách & Đối thủ</li>
              <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-gray-500 mt-0.5" /> Lên Kịch bản Viral nội dung</li>
              <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-gray-500 mt-0.5" /> Quản lý chiến lược kênh</li>
            </ul>

            <button onClick={() => setSelectedPlan('WEBSPACE')} className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white text-center font-bold rounded-xl transition flex items-center justify-center gap-2">
              <Zap size={16} /> Thanh toán qua thẻ
            </button>
          </div>

          {/* 2. KODA STUDIO (VIDEO) */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 flex flex-col hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Video size={24} />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Koda Studio</h3>
            </div>
            <p className="text-purple-200/60 text-sm mb-6 min-h-[40px]">Chuyên làm video dài, ngắn tự động bằng Lõi Veo3 mạnh mẽ.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-black text-white">{formatPrice(getPrice(459))}k</span>
              <span className="text-gray-500"> /tháng</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-purple-100/80"><CheckCircle2 size={16} className="text-purple-400 mt-0.5" /> Render Video YouTube / Tiktok</li>
              <li className="flex items-start gap-2 text-sm text-purple-100/80"><CheckCircle2 size={16} className="text-purple-400 mt-0.5" /> Tích hợp sức mạnh Veo3 cao cấp</li>
              <li className="flex items-start gap-2 text-sm text-purple-100/80"><CheckCircle2 size={16} className="text-purple-400 mt-0.5" /> Tặng kèm hệ thống Voice TTS xịn</li>
              <li className="flex items-start gap-2 text-sm text-purple-100/80"><CheckCircle2 size={16} className="text-purple-400 mt-0.5" /> Tải phần mềm Desktop tối ưu VGA</li>
            </ul>

            <button onClick={() => setSelectedPlan('STUDIO')} className="w-full py-3 px-4 bg-[#0A66C2] hover:bg-[#084e96] text-white text-center font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40">
              <Zap size={16} /> Thanh toán qua thẻ
            </button>
          </div>

          {/* 3. KODA NOVEL */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 flex flex-col hover:border-emerald-500/50 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Koda Novel</h3>
            </div>
            <p className="text-emerald-200/60 text-sm mb-6 min-h-[40px]">Chuyển thể nguyên quyển truyện/tiểu thuyết thành Phim bằng Veo3.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-black text-white">{formatPrice(getPrice(559))}k</span>
              <span className="text-gray-500"> /tháng</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-emerald-100/80"><CheckCircle2 size={16} className="text-emerald-400 mt-0.5" /> Auto làm phim từ chữ siêu tốc</li>
              <li className="flex items-start gap-2 text-sm text-emerald-100/80"><CheckCircle2 size={16} className="text-emerald-400 mt-0.5" /> Quản lý dữ liệu nhân vật, diễn tiến</li>
              <li className="flex items-start gap-2 text-sm text-emerald-100/80"><CheckCircle2 size={16} className="text-emerald-400 mt-0.5" /> Động cơ Veo3 kết hợp Voice TTS riêng biệt</li>
            </ul>

            <button onClick={() => setSelectedPlan('NOVEL')} className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40">
              <Zap size={16} /> Thanh toán qua thẻ
            </button>
          </div>

          {/* 4. COMBO ALL-IN-ONE (DECOY & BEST VALUE) */}
          <div className="relative bg-gradient-to-br from-[#CDAD5A]/20 to-black backdrop-blur-md border-2 border-[#CDAD5A] rounded-3xl p-6 flex flex-col transform md:-translate-y-4 hover:-translate-y-6 transition-all shadow-2xl shadow-[#CDAD5A]/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap animate-pulse">
              KHUYÊN DÙNG NHẤT
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="p-2 bg-[#CDAD5A]/20 rounded-lg text-[#CDAD5A]">
                <Crown size={24} />
              </div>
              <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-[#F2E5BC] uppercase tracking-wider">Combo Vip</h3>
            </div>
            <p className="text-[#F2E5BC]/80 text-sm mb-6 min-h-[40px]">Trọn bộ Siêu công cụ. Sự kết hợp sát thủ của cả 3 Workflows.</p>
            
            <div className="mb-6 relative">
              <div className="line-through text-gray-500 text-sm font-bold absolute -top-4 left-0">{formatPrice(getPrice(199) + getPrice(459) + getPrice(559))}k</div>
              <span className="text-5xl font-black text-white tracking-tighter">{formatPrice(getPrice(790))}k</span>
              <span className="text-gray-400 font-medium"> /tháng</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1 font-medium">
              <li className="flex items-start gap-2 text-sm text-white"><CheckCircle2 size={16} className="text-[#CDAD5A] mt-0.5" /> Bão Nội Dung của Koda Studio</li>
              <li className="flex items-start gap-2 text-sm text-white"><CheckCircle2 size={16} className="text-[#CDAD5A] mt-0.5" /> Ma Thuật Điện Ảnh Koda Novel</li>
              <li className="flex items-start gap-2 text-sm text-white"><CheckCircle2 size={16} className="text-[#CDAD5A] mt-0.5" /> SEO Không Lối Thoát Webspace</li>
            </ul>

            <button onClick={() => setSelectedPlan('COMBO')} className="relative group w-full py-4 px-4 bg-gradient-to-r from-[#CDAD5A] to-[#A88532] text-black text-center font-black text-lg rounded-xl transition flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(205,173,90,0.5)]">
              <span className="absolute inset-0 w-full h-full -ml-16 bg-white opacity-20 transform skew-x-[30deg] translate-x-full transition-transform duration-700 ease-out group-hover:-translate-x-full"></span>
              <Zap size={20} className="animate-pulse" /> THANH TOÁN TỰ ĐỘNG
            </button>
          </div>

        </div>

        <div className="text-center mt-12 pb-12">
          <p className="mt-4 text-gray-400 text-sm text-center max-w-2xl mx-auto bg-gray-900/50 p-4 rounded-xl border border-gray-800 inline-block">
            🔔 Sau thanh toán tự động, bạn sẽ được tự động kích hoạt tài khoản hệ thống và Cấp Mã Download App Desktop.
          </p>
        </div>

        {selectedPlan && (
            <CheckoutModal
                isOpen={true}
                onClose={() => setSelectedPlan(null)}
                requiredPlan={selectedPlan}
                forceYearly={isYearly}
            />
        )}
      </div>
    </section>
  );
}