// components/dashboard/Tab1StartYouTube.tsx
// 3-step flow for beginners
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { hasMinRole } from '../../lib/tab-access';
import LockedFeatureModal from './LockedFeatureModal';

interface Tab1Props {
    onOpenTool: (toolId: string) => void;
}

const STEPS = [
    {
        step: 1,
        title: 'Chọn đúng video nên làm',
        description: 'Hệ thống phân tích thị trường và đối thủ để chỉ ra video dễ làm, ít cạnh tranh và có người xem.',
        toolId: 'micro-niche-miner',
        icon: '🎯',
        color: 'from-blue-500 to-cyan-400',
        cta: 'Chỉ tôi nên làm video gì →',
        freeAccess: true, // FREE: 1/day
    },
    {
        step: 2,
        title: 'Có sẵn kịch bản để làm theo',
        description: 'Cung cấp sẵn hook, kịch bản và nội dung từng đoạn. Không cần nghĩ – chỉ cần làm theo.',
        toolId: 'scriptwriter',
        icon: '✍️',
        color: 'from-purple-500 to-pink-500',
        cta: 'Lấy kịch bản video →',
        freeAccess: false, // FREE: preview only
    },
    {
        step: 3,
        title: 'Đăng đúng cách để có cơ hội lên view',
        description: 'Gợi ý tiêu đề, mô tả, tag và hướng thumbnail để video không đăng đại, không đoán mò.',
        toolId: 'seo',
        icon: '🚀',
        color: 'from-amber-400 to-orange-500',
        cta: 'Chuẩn bị đăng video →',
        freeAccess: false, // FREE: preview only
    },
];

export default function Tab1StartYouTube({ onOpenTool }: Tab1Props) {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || 'FREE';
    const isFreeUser = !hasMinRole(userRole, 'CREATIVE');

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleStepClick = (step: typeof STEPS[0]) => {
        // FREE users can only use Step 1
        if (isFreeUser && !step.freeAccess) {
            setModalMessage(
                step.step === 2
                    ? 'Bạn đã có hướng đi. Nâng cấp để nhận kịch bản đầy đủ và làm video chuyên nghiệp hơn.'
                    : 'Nâng cấp để nhận SEO tối ưu, giúp video có cơ hội lên view tốt hơn.'
            );
            setShowModal(true);
            return;
        }
        onOpenTool(step.toolId);
    };

    return (
        <div className="space-y-6">


            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STEPS.map((step) => {
                    const isLocked = isFreeUser && !step.freeAccess;

                    return (
                        <div
                            key={step.step}
                            className={`
                relative p-6 rounded-2xl border transition-all duration-300
                ${isLocked
                                    ? 'bg-gray-900/30 border-gray-700/50 opacity-80'
                                    : 'bg-gray-900/50 border-gray-700 hover:border-purple-500/50 hover:-translate-y-1'
                                }
              `}
                        >
                            {/* Step Badge */}
                            <div className="absolute top-4 right-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Bước {step.step}
                            </div>

                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                                {step.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-gray-400 text-sm mb-6 min-h-[48px]">{step.description}</p>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleStepClick(step)}
                                className={`
                  w-full py-3 px-4 rounded-xl font-medium transition-all duration-300
                  ${isLocked
                                        ? 'bg-gray-800 text-gray-400 flex items-center justify-center gap-2'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                                    }
                `}
                            >
                                {isLocked && <span>🔒</span>}
                                {step.cta}
                            </button>

                            {/* FREE indicator */}
                            {step.freeAccess && isFreeUser && (
                                <p className="text-xs text-green-400 text-center mt-2">
                                    ✓ Miễn phí 1 lượt/ngày
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress hint for FREE users */}
            {isFreeUser && (
                <div className="text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                    <p className="text-purple-300 text-sm">
                        💡 <strong>Mẹo:</strong> Hoàn thành Bước 1 để khám phá ý tưởng video phù hợp với bạn!
                    </p>
                </div>
            )}

            {/* Upsell Modal */}
            <LockedFeatureModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Mở khóa để làm tiếp"
                message={modalMessage}
            />
        </div>
    );
}
