import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

export default function WorkflowSection() {
    const router = useRouter();
    const { t } = useTranslation('common');

    const STEPS = [
        {
            step: 1,
            title: t('workflow.step1.title', 'Chọn đúng video nên làm'),
            desc: t('workflow.step1.desc', 'Hệ thống phân tích thị trường và đối thủ để chỉ ra video dễ làm, ít cạnh tranh và có người xem.'),
            toolId: "micro-niche-miner",
            toolName: "Micro Niche Miner",
            icon: "🎯",
            color: "from-blue-500 to-cyan-400",
            cta: t('workflow.step1.cta', 'Chỉ tôi nên làm video gì →')
        },
        {
            step: 2,
            title: t('workflow.step2.title', 'Có sẵn kịch bản để làm theo'),
            desc: t('workflow.step2.desc', 'Cung cấp sẵn hook, kịch bản và nội dung từng đoạn. Không cần nghĩ – chỉ cần làm theo.'),
            toolId: "scriptwriter",
            toolName: "Scriptwriter",
            icon: "✍️",
            color: "from-purple-500 to-pink-500",
            cta: t('workflow.step2.cta', 'Lấy kịch bản video →')
        },
        {
            step: 3,
            title: t('workflow.step3.title', 'Đăng đúng cách để có cơ hội lên view'),
            desc: t('workflow.step3.desc', 'Gợi ý tiêu đề, mô tả, tag và hướng thumbnail để video không đăng đại, không đoán mò.'),
            toolId: "seo",
            toolName: "SEO Tool + Thumbnail",
            icon: "🚀",
            color: "from-amber-400 to-orange-500",
            cta: t('workflow.step3.cta', 'Chuẩn bị đăng video →')
        },
    ];

    const handleOpenTool = (toolId: string) => {
        router.push(
            { pathname: router.pathname, query: { ...router.query, tool: toolId } },
            undefined,
            { shallow: true }
        );
    };

    return (
        <section id="workflow-section" className="py-20 bg-black relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                        {t('workflow.title', 'Quy Trình')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-cyan-400">{t('workflow.title_highlight', '3 Bước Để Làm Video Lên Top View')}</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t('workflow.subtitle', 'Hệ thống dẫn bạn đi từ "chưa biết làm gì" → "có video sẵn để đăng".')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop only) */}
                    <div className="hidden md:block absolute top-[28%] left-[16%] right-[16%] h-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-orange-500/30 -z-10" />

                    {STEPS.map((item) => (
                        <div
                            key={item.step}
                            className="relative group bg-gray-900/50 border border-gray-800 hover:border-gray-600 p-8 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center"
                        >
                            {/* Step Badge */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl mb-6 shadow-lg shadow-purple-900/50`}>
                                {item.icon}
                            </div>

                            <div className="absolute top-4 right-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {t('workflow.step', 'Bước')} {item.step}
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-gray-400 mb-8 min-h-[48px]">{item.desc}</p>

                            <button
                                onClick={() => handleOpenTool(item.toolId)}
                                className="mt-auto w-full py-3 px-6 rounded-xl bg-gray-800 hover:bg-white text-white hover:text-black font-bold transition-all duration-300 border border-gray-700 hover:border-white"
                            >
                                {item.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
