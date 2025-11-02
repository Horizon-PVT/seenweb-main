// File: components/pricingtable.tsx
import React from 'react';

// --- CẤU HÌNH CỐT LÕI ---
const featuresMap = {
  EXPLORER: [
    "2 Công cụ cốt lõi (Viết kịch bản, SEO YouTube)",
    "Giới hạn: 2 lần tạo/ngày",
    "Truy cập Chatbot AI cơ bản",
    "Không cần thông tin thanh toán"
  ],
  ARCHIVE: [
    "MỞ KHÓA 3 công cụ sáng tạo",
    "Không giới hạn lượt sử dụng",
    "Phân tích đối thủ chuyên sâu",
    "Hỗ trợ qua Email"
  ],
  MAGISTRATE: [
    "MỞ KHÓA 8 CÔNG CỤ (Gần như FULL)",
    "Tạo Ảnh & Text-to-Speech (Google Cloud)",
    "Tìm Micro Niche & Narrative Studio (BYOK)",
    "Tối ưu SEO & nội dung nâng cao"
  ],
  TOANTRI: [
    "MỞ KHÓA TOÀN BỘ 10 CÔNG CỤ",
    "Tạo Video (Velocity Tool) – Dùng Credit",
    "NARRATIVE STUDIO Độc Quyền",
    "Hỗ trợ chuyên gia 24/7"
  ]
};
// --- HẾT CẤU HÌNH CỐT LÕI ---

// --- MÀU CHỦ ĐẠO ---
const MAGISTRATE_COLOR = '#00BFFF'; // Electric Cyan
const MAGISTRATE_GLOW = '0 0 10px #00BFFF, 0 0 30px #00BFFF, 0 0 50px #00BFFF';

const PricingCard: React.FC<{
  plan: string;
  price: string;
  features: string[];
  isFeatured?: boolean;
  isOmni?: boolean;
  isFree?: boolean;
}> = ({ plan, price, features, isFeatured, isOmni, isFree }) => {
  const baseClasses = "p-8 border rounded-lg h-full flex flex-col transition-all duration-300";
  const featuredClasses = `border-[${MAGISTRATE_COLOR}] border-2 relative scale-105 shadow-[${MAGISTRATE_GLOW}]`;
  const omniClasses = "border-[#CDAD5A] border-2 bg-gradient-to-br from-[#CDAD5A]/10 to-black animate-breathe relative animate-metallic-sheen-overlay";
  const freeClasses = "border-gray-800/50 bg-black/50 hover:border-[#008080]";
  const normalClasses = "border-gray-800/50 bg-black/30";

  let cardClasses = `${baseClasses} ${normalClasses}`;
  if (isFree) cardClasses = `${baseClasses} ${freeClasses}`;
  if (isFeatured) cardClasses = `${baseClasses} ${featuredClasses}`;
  if (isOmni) cardClasses = `${baseClasses} ${omniClasses}`;

  const priceTextColor = isFree ? 'text-[#008080]' : isFeatured ? `text-[${MAGISTRATE_COLOR}]` : 'text-[#CDAD5A]';
  const checkmarkColor = isFeatured ? `text-[${MAGISTRATE_COLOR}]` : 'text-[#008080]';

  let buttonClasses = `w-full py-3 font-bold rounded-sm border-2 transition-colors`;
  if (isFree) {
    buttonClasses += ' bg-transparent border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white';
  } else if (isFeatured) {
    buttonClasses += ` bg-[${MAGISTRATE_COLOR}] border-[${MAGISTRATE_COLOR}] text-black hover:bg-transparent hover:text-[${MAGISTRATE_COLOR}]`;
  } else if (isOmni) {
    buttonClasses += ' bg-[#008080] border-[#008080] text-white hover:bg-transparent hover:text-[#008080] emerald-glow';
  } else {
    buttonClasses += ' bg-transparent border-gray-600 text-gray-400 hover:border-[#008080] hover:text-[#008080]';
  }

  return (
    <div className={cardClasses} style={isFeatured ? { boxShadow: MAGISTRATE_GLOW, borderColor: MAGISTRATE_COLOR } : {}}>
      {isFeatured && (
        <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#00BFFF] text-black text-xs font-bold px-3 py-1 rounded-full uppercase z-10">
          Phổ Biến Nhất
        </span>
      )}
      <h3 className={`text-3xl font-playfair ${isOmni ? 'text-[#CDAD5A]' : 'text-white'}`}>{plan}</h3>

      <p className={`text-5xl font-bold my-4 ${priceTextColor}`}>
        {isFree ? 'FREE' : price}
        <span className="text-base font-normal text-gray-400">{isFree ? '' : '/tháng'}</span>
      </p>

      <ul className="space-y-3 text-gray-300 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <svg className={`w-5 h-5 mr-2 flex-shrink-0 ${checkmarkColor} mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className={isFree && feature.includes('Giới hạn') ? 'text-yellow-400 font-bold' : 'text-gray-300'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button className={buttonClasses}>
        {isFree ? 'BẮT ĐẦU KHÁM PHÁ' : 'CHỌN GÓI'}
      </button>
    </div>
  );
};

const PricingTable: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl text-center font-playfair text-[#CDAD5A] mb-4">BẢNG GIÁ SEENYT</h2>
        <p className="text-xl text-center text-gray-400 mb-4">
          Nền tảng Google Cloud AI – ổn định, nhanh & tối ưu chi phí.
        </p>
        <p className="text-lg text-center text-gray-500 mb-16">Chọn gói phù hợp với hành trình sáng tạo YouTube của bạn.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <PricingCard plan="KHÁM PHÁ" price="0" features={featuresMap.EXPLORER} isFree />
          <PricingCard plan="ARCHIVE" price="399k" features={featuresMap.ARCHIVE} />
          <PricingCard plan="MAGISTRATE" price="649k" features={featuresMap.MAGISTRATE} isFeatured />
          <PricingCard plan="TOÀN TRI" price="1299k" features={featuresMap.TOANTRI} isOmni />
        </div>
      </div>
    </section>
  );
};

export default PricingTable;
