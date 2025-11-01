import React from 'react';

// --- CẤU HÌNH CỐT LÕI (Không đổi) ---
const featuresMap = {
    // 2/10 Công cụ (VIẾT KỊCH BẢN, SEO YOUTUBE)
    EXPLORER: [
        "2 Công cụ cốt lõi (Script, SEO)",
        "Giới hạn nghiêm ngặt: 2 lần tạo/ngày", 
        "Truy cập Chatbot AI cơ bản",
        "Không cần thông tin thanh toán"
    ],
    // 3/10 Công cụ (EXPLORER + PHÂN TÍCH ĐỐI THỦ)
    ARCHIVE: [
        "MỞ KHÓA 3 Công cụ cốt lõi",
        "Không giới hạn số lần sử dụng",
        "Phân tích đối thủ chuyên sâu",
        "Hỗ trợ qua Email"
    ],
    // 8/10 Công cụ (ARCHIVE + TÌM KÊNH ẨN, VIẾT LẠI KỊCH BẢN, TẠO ẢNH, TTS, MICRO NICHE)
    MAGISTRATE: [
        "MỞ KHÓA 8 CÔNG CỤ (Gần như FULL)", 
        "Tạo Ảnh (Image Forge) & Text-to-Speech",
        "TÌM MICRO NICHE & NARRATIVE STUDIO (BYOK)", 
        "Video BYOK (Bring Your Own Key)",
    ],
    // 10/10 Công cụ (MAGISTRATE + NARRATIVE STUDIO & TẠO VIDEO (Veo 3) FULL)
    TOANTRI: [
        "MỞ KHÓA TẤT CẢ 10 CÔNG CỤ",
        "Tạo Video (Veocity Tool) - Dùng Credit",
        "NARRATIVE STUDIO Độc Quyền",
        "Hỗ trợ Chuyên gia 24/7"
    ]
};
// --- HẾT CẤU HÌNH CỐT LÕI ---

// --- CẤU HÌNH MÀU SẮC MỚI ---
const MAGISTRATE_COLOR = '#00BFFF'; // Electric Cyan
const MAGISTRATE_GLOW = '0 0 10px #00BFFF, 0 0 30px #00BFFF, 0 0 50px #00BFFF';

const PricingCard: React.FC<{
  plan: string;
  price: string; // Giá đã được format (vd: 649k)
  features: string[];
  isFeatured?: boolean;
  isOmni?: boolean;
  isFree?: boolean;
}> = ({ plan, price, features, isFeatured, isOmni, isFree }) => {
  const baseClasses = "p-8 border rounded-lg h-full flex flex-col transition-all duration-300";
  
  // ÁP DỤNG MÀU XANH ĐIỆN TỬ MỚI VÀO FEATURED CLASS
  const featuredClasses = `border-[${MAGISTRATE_COLOR}] border-2 relative scale-105 shadow-[${MAGISTRATE_GLOW}]`;
  const omniClasses = "border-[#CDAD5A] border-2 bg-gradient-to-br from-[#CDAD5A]/10 to-black animate-breathe relative animate-metallic-sheen-overlay";
  const freeClasses = "border-gray-800/50 bg-black/50 hover:border-[#008080]";
  const normalClasses = "border-gray-800/50 bg-black/30";

  let cardClasses = `${baseClasses} ${normalClasses}`;
  if(isFree) cardClasses = `${baseClasses} ${freeClasses}`;
  if(isFeatured) cardClasses = `${baseClasses} ${featuredClasses}`;
  if(isOmni) cardClasses = `${baseClasses} ${omniClasses}`;

  // Xác định màu chữ của giá
  const priceTextColor = isFree ? 'text-[#008080]' : isFeatured ? `text-[${MAGISTRATE_COLOR}]` : 'text-[#CDAD5A]';
  // Xác định màu chữ của checkmark
  const checkmarkColor = isFeatured ? `text-[${MAGISTRATE_COLOR}]` : 'text-[#008080]';
  
  // Xác định màu và hiệu ứng của nút
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
    <div className={cardClasses} style={isFeatured ? {boxShadow: MAGISTRATE_GLOW, borderColor: MAGISTRATE_COLOR} : {}}>
      {isFeatured && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#CDAD5A] text-black text-xs font-bold px-3 py-1 rounded-full uppercase z-10">Best Value</span>}
      <h3 className={`text-3xl font-playfair ${isOmni ? 'text-[#CDAD5A]' : 'text-white'}`}>{plan}</h3>
      
      {/* HIỂN THỊ GIÁ GỌN GÀNG */}
      <p className={`text-5xl font-bold my-4 ${priceTextColor}`}>{isFree ? 'FREE' : price}
        <span className="text-base font-normal text-gray-400">{isFree ? '' : '/tháng'}</span>
      </p>

      <ul className="space-y-3 text-gray-300 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            {/* SỬ DỤNG MÀU CHECKMARK MỚI */}
            <svg className={`w-5 h-5 mr-2 flex-shrink-0 ${checkmarkColor} mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span className={isFree && feature.includes('Giới hạn') ? 'text-yellow-400 font-bold' : 'text-gray-300'}>{feature}</span>
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
        <h2 className="text-4xl text-center font-playfair text-[#CDAD5A] mb-4">Lời Thề Đầu Tư</h2>
        <p className="text-xl text-center text-gray-400 mb-16">Chọn vũ khí của bạn.</p>
        
        {/* Điều chỉnh grid để chứa 4 cột */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          
          <PricingCard
            plan="KHÁM PHÁ"
            price="0"
            features={featuresMap.EXPLORER}
            isFree
          />

          <PricingCard
            plan="ARCHIVE"
            // GIÁ GỌN GÀNG
            price="399k"
            features={featuresMap.ARCHIVE}
          />
          
          <PricingCard
            plan="MAGISTRATE"
            // GIÁ GỌN GÀNG
            price="649k"
            features={featuresMap.MAGISTRATE}
            isFeatured
          />
          <PricingCard
            plan="TOÀN TRI"
            // GIÁ GỌN GÀNG
            price="1299k"
            features={featuresMap.TOANTRI}
            isOmni
          />
        </div>
      </div>
    </section>
  );
};

export default PricingTable;