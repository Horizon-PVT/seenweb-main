// components/dashboard/Tab2Optimize.tsx
// PRO+ tools for optimization
import React from 'react';
import { TAB2_TOOLS } from '../../lib/tab-access';

interface Tab2Props {
    onOpenTool: (toolId: string) => void;
}

export default function Tab2Optimize({ onOpenTool }: Tab2Props) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Tăng view & tối ưu kênh
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Công cụ nâng cao giúp bạn phân tích đối thủ, tìm cơ hội và tối ưu nội dung.
                </p>
            </div>

            {/* Tool Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TAB2_TOOLS.map((tool) => (
                    <div
                        key={tool.id}
                        onClick={() => onOpenTool(tool.id)}
                        className="p-6 bg-gray-900/50 border border-gray-700 rounded-2xl hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                                {tool.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                    {tool.label}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {getToolDescription(tool.id)}
                                </p>
                            </div>
                            <div className="text-gray-500 group-hover:text-purple-400 transition-colors">
                                →
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* PRO Badge */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl">
                <p className="text-purple-300 text-sm">
                    ✨ <strong>Gói PRO</strong> – Công cụ nâng cao để tối ưu kênh YouTube của bạn
                </p>
            </div>
        </div>
    );
}

function getToolDescription(toolId: string): string {
    switch (toolId) {
        case 'rival-scanner':
            return 'Phân tích chi tiết kênh đối thủ, xem chiến lược nội dung và điểm mạnh/yếu.';
        case 'hidden-channel-finder':
            return 'Tìm các kênh nhỏ đang tăng trưởng nhanh, cơ hội ngách chưa khai thác.';
        case 'script-refiner':
            return 'Chỉnh sửa, nâng cấp kịch bản hiện có thành phiên bản chuyên nghiệp hơn.';
        case 'image-forge':
            return 'Tạo thumbnail bắt mắt với AI, tăng CTR cho video của bạn.';
        default:
            return '';
    }
}
