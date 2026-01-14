// components/dashboard/Tab4Learning.tsx
// Learning & guidance content
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getNicheEngineLimit, getThayYoutubeAccess } from '../../lib/tab-access';

interface Tab4Props {
    onOpenTool: (toolId: string) => void;
}

export default function Tab4Learning({ onOpenTool }: Tab4Props) {
    const { data: session } = useSession();
    const router = useRouter();
    const userRole = (session?.user as any)?.role || 'FREE';

    const nicheLimit = getNicheEngineLimit(userRole);
    const { maxDay } = getThayYoutubeAccess(userRole);

    const learningItems = [
        {
            id: 'thay-youtube',
            title: 'Thầy YouTube – Roadmap 30 ngày',
            description: 'Lộ trình học từ cơ bản đến nâng cao, được thiết kế riêng cho người Việt.',
            icon: '🎓',
            accessLabel: `Đang mở: Day 1-${maxDay}`,
            onClick: () => router.push('/tools/thay-youtube'),
        },
        {
            id: 'niche-engine',
            title: 'Thư viện Ngách',
            description: 'Bộ sưu tập các ý tưởng ngách đã được phân tích, sẵn sàng để bạn tham khảo.',
            icon: '📚',
            accessLabel: nicheLimit >= 999 ? 'Mở toàn bộ' : `${nicheLimit} ngách đầu`,
            onClick: () => router.push('/studio/niche-engine'),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Học & hướng dẫn
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Kiến thức và tài liệu giúp bạn xây dựng kênh YouTube thành công.
                </p>
            </div>

            {/* Learning Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {learningItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={item.onClick}
                        className="p-6 bg-gray-900/50 border border-gray-700 rounded-2xl hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-2">
                                    {item.description}
                                </p>
                                <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">
                                    ✓ {item.accessLabel}
                                </span>
                            </div>
                            <div className="text-gray-500 group-hover:text-emerald-400 transition-colors text-xl">
                                →
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tips section */}
            <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-2xl">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    💡 Bắt đầu từ đâu?
                </h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>Mới hoàn toàn:</strong> Bắt đầu với Thầy YouTube Day 1</li>
                    <li>• <strong>Đã có kênh:</strong> Xem Thư viện Ngách để tìm hướng đi mới</li>
                    <li>• <strong>Muốn tối ưu:</strong> Quay lại Tab 1 để phân tích và làm video mới</li>
                </ul>
            </div>

            {/* Upgrade hint based on role */}
            {maxDay < 30 && (
                <div className="text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                    <p className="text-purple-300 text-sm">
                        🔓 Nâng cấp gói để mở khóa thêm nội dung học tập và hỗ trợ 1-1.
                    </p>
                </div>
            )}
        </div>
    );
}
