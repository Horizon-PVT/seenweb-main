// components/PricingTable.tsx
import React from "react";
import { useRouter } from "next/router";

interface PricingTableProps {
  setSelectedPlan?: (plan: string) => void;
}

const featuresMap = {
  EXPLORER: [
    "2 Công cụ cốt lõi (Viết kịch bản, SEO YouTube)",
    "Giới hạn: 2 lần tạo/ngày",
    "Truy cập Chatbot AI cơ bản",
    "Không cần thông tin thanh toán",
  ],
  ARCHIVE: [
    "MỞ KHÓA 3 công cụ sáng tạo",
    "Không giới hạn lượt sử dụng",
    "Phân tích đối thủ chuyên sâu",
    "Hỗ trợ qua Email",
  ],
  MAGISTRATE: [
    "MỞ KHÓA 8 CÔNG CỤ (Gần như FULL)",
    "Tạo Ảnh & Text-to-Speech (Google Cloud)",
    "Tìm Micro Niche & Narrative Studio (BYOK)",
    "Tối ưu SEO & nội dung nâng cao",
  ],
  TOANTRI: [
    "MỞ KHÓA TOÀN BỘ 10 CÔNG CỤ",
    "Tạo Video (Velocity Tool) – Dùng Credit",
    "NARRATIVE STUDIO Độc Quyền",
    "Hỗ trợ chuyên gia 24/7",
  ],
};

const PricingCard: React.FC<{
  plan: string;
  price: string;
  features: string[];
  color?: string;
  glow?: string;
  isFeatured?: boolean;
  isOmni?: boolean;
  isFree?: boolean;
  onSelect?: (plan: string) => void;
}> = ({
  plan,
  price,
  features,
  color,
  glow,
  isFeatured,
  isOmni,
  isFree,
  onSelect,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (isFree) return;
    if (onSelect) {
      onSelect(plan);
    } else {
      // Nếu không có modal (ở trang /), tự chuyển hướng về /pricing
      router.push("/pricing");
    }
  };

  const base =
    "p-8 border rounded-xl h-full flex flex-col transition-all duration-300 text-white";
  const normal = "border-gray-700 bg-black/40 hover:border-[#00BFFF]";
  const free = "border-gray-600 bg-black/60 hover:border-[#008080]";
  const featured = "border-2 shadow-xl relative";
  const omni =
    "border-2 bg-gradient-to-br from-[#CDAD5A]/10 to-black animate-pulse";

  let classes = `${base} ${normal}`;
  if (isFree) classes = `${base} ${free}`;
  if (isFeatured) classes = `${base} ${featured}`;
  if (isOmni) classes = `${base} ${omni}`;

  return (
    <div
      className={classes}
      style={
        glow
          ? { boxShadow: glow, borderColor: color || "#00BFFF" }
          : { borderColor: color || "#00BFFF" }
      }
    >
      {isFeatured && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00BFFF] text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          Phổ Biến Nhất
        </span>
      )}
      <h3
        className={`text-3xl font-bold mb-4 text-center ${
          isOmni ? "text-[#CDAD5A]" : ""
        }`}
      >
        {plan}
      </h3>

      <p
  className={`text-5xl font-extrabold mb-6 text-center ${
    isFree ? "text-[#008080]" : ""
  }`}
  style={{ color: !isFree && color ? color : undefined }}
>
  {isFree ? (
    "FREE"
  ) : (
    <>
      <span className="tracking-tight">{price.replace(".", ",")}</span>
      <span className="text-3xl align-super ml-1">k</span>
    </>
  )}
  {!isFree && (
    <span className="block text-base text-gray-400 font-normal">
      / tháng
    </span>
  )}
</p>


      <ul className="space-y-3 text-gray-300 mb-8 flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex items-start">
            <svg
              className={`w-5 h-5 mr-2 flex-shrink-0 ${
                isFeatured ? "text-[#00BFFF]" : "text-[#008080]"
              } mt-0.5`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        className="w-full py-3 font-bold rounded-md border-2 transition-all mt-auto border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-black"
      >
        {isFree ? "BẮT ĐẦU KHÁM PHÁ" : "CHỌN GÓI"}
      </button>
    </div>
  );
};

export default function PricingTable({ setSelectedPlan }: PricingTableProps) {
  return (
    <section id="pricing" className="py-20 bg-black text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl text-center font-playfair text-[#CDAD5A] mb-4">
          BẢNG GIÁ SEENWEB
        </h2>
        <p className="text-xl text-center text-gray-400 mb-4">
          Nền tảng Google Cloud AI – ổn định, nhanh & tối ưu chi phí.
        </p>
        <p className="text-lg text-center text-gray-500 mb-16">
          Chọn gói phù hợp với hành trình sáng tạo YouTube của bạn.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <PricingCard
            plan="KHÁM PHÁ"
            price="0"
            features={featuresMap.EXPLORER}
            color="#008080"
            isFree
            onSelect={setSelectedPlan}
          />
          <PricingCard
            plan="ARCHIVE"
            price="399k"
            features={featuresMap.ARCHIVE}
            color="#00BFFF"
            glow="0 0 10px #00BFFF, 0 0 30px #00BFFF, 0 0 50px #00BFFF"
            onSelect={setSelectedPlan}
          />
          <PricingCard
            plan="MAGISTRATE"
            price="649k"
            features={featuresMap.MAGISTRATE}
            color="#FFD700"
            glow="0 0 20px #FFD700, 0 0 40px #FFD700"
            isFeatured
            onSelect={setSelectedPlan}
          />
          <PricingCard
            plan="TOÀN TRI"
            price="1.299k"
            features={featuresMap.TOANTRI}
            color="#CDAD5A"
            glow="0 0 20px #CDAD5A, 0 0 40px #CDAD5A, 0 0 60px #CDAD5A"
            isOmni
            onSelect={setSelectedPlan}
          />
        </div>
      </div>
    </section>
  );
}
