// components/PremiumComparison.tsx
import React from 'react';
import { Check, X, Star } from 'lucide-react';

interface PremiumComparisonProps {
    toolType: 'script' | 'seo' | 'thumbnail';
    onUpgrade: () => void;
}

export default function PremiumComparison({ toolType, onUpgrade }: PremiumComparisonProps) {

    const comparisonData = {
        script: {
            title: "KỊCH BẢN CỦA BẠN (FREE) vs PREMIUM",
            free: {
                label: "Gói FREE",
                features: [
                    "Kịch bản cơ bản",
                    "Cấu trúc đơn giản",
                    "Thiếu Hook Viral",
                    "Không tối ưu cảm xúc"
                ]
            },
            premium: {
                label: "Gói CREATIVE / SUPER",
                features: [
                    "Cấu trúc Viral 3 bước",
                    "Hook 3 giây đầu cực mạnh",
                    "Tối ưu giữ chân người xem",
                    "Văn phong lôi cuốn, thôi miên"
                ]
            }
        },
        seo: {
            title: "KẾT QUẢ SEO (FREE) vs PREMIUM",
            free: {
                label: "Gói FREE",
                features: [
                    "Từ khóa cơ bản",
                    "Ít gợi ý thẻ tags",
                    "Không phân tích cạnh tranh",
                    "Tiêu đề chung chung"
                ]
            },
            premium: {
                label: "Gói SUPER",
                features: [
                    "Từ khóa độ khó thấp, Vol cao",
                    "Bộ Tags chuẩn thuật toán 2026",
                    "Spy đối thủ chi tiết",
                    "Tiêu đề Clickbait AI tự tạo"
                ]
            }
        },
        thumbnail: {
            title: "THUMBNAIL (FREE) vs PREMIUM",
            free: {
                label: "Gói FREE",
                features: [
                    "Template cơ bản",
                    "Không có Face Lock",
                    "Chất lượng thấp",
                    "Màu sắc nhạt nhòa"
                ]
            },
            premium: {
                label: "Gói SUPER",
                features: [
                    "Phân tích CTR màu sắc",
                    "Ghép mặt Face Lock chuẩn",
                    "Hiệu ứng chiều sâu 3D",
                    "Phong cách MrBeast/Niche"
                ]
            }
        }
    };

    const data = comparisonData[toolType];

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 md:p-6 mt-6 animate-fade-in-up">
            <h3 className="text-[#CDAD5A] font-bold text-center mb-6 uppercase tracking-wider text-sm md:text-base">
                {data.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FREE COLUMN */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 font-bold mb-3 text-center border-b border-gray-700 pb-2">
                        {data.free.label}
                    </div>
                    <ul className="space-y-2">
                        {data.free.features.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="min-w-[4px] h-[4px] bg-gray-500 rounded-full" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* PREMIUM COLUMN */}
                <div className="relative bg-gradient-to-b from-[#CDAD5A]/10 to-transparent rounded-lg p-4 border border-[#CDAD5A]/30 overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-[#CDAD5A] text-black text-[10px] font-bold rounded-bl-lg">
                        RECOMMENDED
                    </div>
                    <div className="text-[#CDAD5A] font-bold mb-3 text-center border-b border-[#CDAD5A]/30 pb-2 flex items-center justify-center gap-2">
                        <Star size={16} fill="currentColor" />
                        {data.premium.label}
                    </div>
                    <ul className="space-y-2">
                        {data.premium.features.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-white font-medium">
                                <Check size={14} className="text-green-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={onUpgrade}
                        className="w-full mt-4 bg-gradient-to-r from-[#CDAD5A] to-orange-500 text-black font-bold py-2 rounded-lg text-xs hover:opacity-90 transition shadow-lg shadow-orange-500/20"
                    >
                        NÂNG CẤP ĐỂ MỞ KHÓA
                    </button>
                </div>
            </div>
        </div>
    );
}
