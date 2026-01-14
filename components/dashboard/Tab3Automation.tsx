// components/dashboard/Tab3Automation.tsx
// Production/Automation tools - PRO partial, VIP full
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { TAB3_TOOLS, canAccessTab3Tool } from '../../lib/tab-access';
import LockedFeatureModal from './LockedFeatureModal';

interface Tab3Props {
    onOpenTool: (toolId: string) => void;
}

const TOOL_DETAILS = {
    'text-to-speech': {
        icon: '🎙️',
        description: 'Đọc kịch bản với giọng AI tự nhiên, hỗ trợ nhiều ngôn ngữ.',
    },
    'ai-dubbing-studio': {
        icon: '🎤',
        description: 'Lồng tiếng với AI, clone giọng nói theo phong cách riêng.',
    },
    'velocity': {
        icon: '🎬',
        description: 'Tự động render video từ kịch bản và hình ảnh.',
    },
    'virtual-mc': {
        icon: '👤',
        description: 'Tạo MC ảo lip-sync với giọng đọc của bạn.',
    },
};

export default function Tab3Automation({ onOpenTool }: Tab3Props) {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || 'FREE';

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleToolClick = (toolId: string) => {
        if (canAccessTab3Tool(userRole, toolId)) {
            onOpenTool(toolId);
        } else {
            // Show upsell based on required tier
            const tool = TAB3_TOOLS[toolId as keyof typeof TAB3_TOOLS];
            if (tool.minRole === 'VIP') {
                setModalMessage('Tạo Video AI và MC Ảo là tính năng VIP. Nâng cấp để sử dụng.');
            } else if (tool.minRole === 'SUPER') {
                setModalMessage('Text-to-Speech là tính năng PRO. Nâng cấp để sử dụng.');
            } else {
                setModalMessage('Nâng cấp để mở khóa tính năng này.');
            }
            setShowModal(true);
        }
    };

    const tools = Object.entries(TAB3_TOOLS).map(([id, config]) => ({
        id,
        label: config.label,
        ...TOOL_DETAILS[id as keyof typeof TOOL_DETAILS],
        isAccessible: canAccessTab3Tool(userRole, id),
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Làm nhanh & tự động
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Tự động hóa quy trình sản xuất video với AI tiên tiến.
                </p>
            </div>

            {/* Tool Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                    <div
                        key={tool.id}
                        onClick={() => handleToolClick(tool.id)}
                        className={`
              p-6 rounded-2xl border transition-all duration-300 cursor-pointer
              ${tool.isAccessible
                                ? 'bg-gray-900/50 border-gray-700 hover:border-purple-500/50 hover:-translate-y-1'
                                : 'bg-gray-900/30 border-gray-700/50 opacity-70'
                            }
            `}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg
                ${tool.isAccessible
                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                    : 'bg-gray-700'
                                }
              `}>
                                {tool.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className={`
                  text-lg font-bold mb-1 flex items-center gap-2
                  ${tool.isAccessible ? 'text-white' : 'text-gray-400'}
                `}>
                                    {tool.label}
                                    {!tool.isAccessible && <span className="text-sm">🔒</span>}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {tool.description}
                                </p>
                            </div>
                            {tool.isAccessible && (
                                <div className="text-gray-500 hover:text-purple-400 transition-colors">
                                    →
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tier indicators */}
            <div className="flex flex-wrap gap-3 justify-center">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                    🎤 Dubbing: STARTER+
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    🎙️ TTS: PRO+
                </span>
                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
                    🎬 Video & MC: VIP
                </span>
            </div>

            {/* Upsell Modal */}
            <LockedFeatureModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Nâng cấp để sử dụng"
                message={modalMessage}
            />
        </div>
    );
}
