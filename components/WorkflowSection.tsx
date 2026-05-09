import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Link from "next/link";

export default function WorkflowSection() {
    const router = useRouter();
    const { t } = useTranslation('common');

    const CORE_STEPS = [
        {
            step: 1,
            title: t('workflow.step1.title', 'Chọn đúng video nên làm'),
            desc: t('workflow.step1.desc', 'Hệ thống phân tích thị trường và đối thủ để chỉ ra video dễ làm, ít cạnh tranh và có người xem.'),
            toolId: "micro-niche-miner",
            toolName: "Micro Niche Miner",
            icon: "🎯",
            color: "from-blue-500 to-cyan-400",
            bgColor: "bg-blue-500/10",
            borderColor: "hover:border-blue-500/60",
            cta: t('workflow.step1.cta', 'Chỉ tôi nên làm video gì →'),
            tag: undefined as string | undefined,
            tagColor: undefined as string | undefined
        },
        {
            step: 2,
            title: t('workflow.step2.title', 'Có sẵn kịch bản để làm theo'),
            desc: t('workflow.step2.desc', 'Cung cấp sẵn hook, kịch bản và nội dung từng đoạn. Không cần nghĩ – chỉ cần làm theo.'),
            toolId: "scriptwriter",
            toolName: "Scriptwriter",
            icon: "✍️",
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-500/10",
            borderColor: "hover:border-purple-500/60",
            cta: t('workflow.step2.cta', 'Lấy kịch bản video →'),
            tag: undefined as string | undefined,
            tagColor: undefined as string | undefined
        },
        {
            step: 3,
            title: t('workflow.step3.title', 'Đăng đúng cách để có cơ hội lên view'),
            desc: t('workflow.step3.desc', 'Gợi ý tiêu đề, mô tả, tag và hướng thumbnail để video không đăng đại, không đoán mò.'),
            toolId: "seo",
            toolName: "SEO Tool + Thumbnail",
            icon: "🚀",
            color: "from-amber-400 to-orange-500",
            bgColor: "bg-amber-500/10",
            borderColor: "hover:border-amber-500/60",
            cta: t('workflow.step3.cta', 'Chuẩn bị đăng video →'),
            tag: undefined as string | undefined,
            tagColor: undefined as string | undefined
        },
    ];

    const ADVANCED_WORKFLOWS = [
        {
            step: 4,
            title: 'Video Automation Pipeline',
            desc: 'AI generates complete video production: Script, Visual Prompts, Voiceover, Thumbnail & SEO — all in one click.',
            toolId: "video-pipeline",
            toolName: "Video Pipeline",
            icon: "🎬",
            color: "from-indigo-500 to-purple-500",
            bgColor: "bg-indigo-500/10",
            borderColor: "hover:border-indigo-500/60",
            tag: "NEW",
            tagColor: "bg-indigo-500/20 text-indigo-400"
        },
        {
            step: 5,
            title: 'Content Intelligence Hub',
            desc: 'Micro Niche + Rival Scanner + Hidden Channels + SEO Analysis — unified into one AI-powered research engine.',
            toolId: "intelligence-hub",
            toolName: "Intelligence Hub",
            icon: "🧠",
            color: "from-cyan-500 to-blue-500",
            bgColor: "bg-cyan-500/10",
            borderColor: "hover:border-cyan-500/60",
            tag: "NEW",
            tagColor: "bg-cyan-500/20 text-cyan-400"
        },
        {
            step: 6,
            title: 'Multilingual Studio',
            desc: 'Translate scripts, localize titles, optimize descriptions for English, Spanish, French & more markets.',
            toolId: "multilingual-studio",
            toolName: "Multilingual Studio",
            icon: "🌐",
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-500/10",
            borderColor: "hover:border-emerald-500/60",
            tag: "NEW",
            tagColor: "bg-emerald-500/20 text-emerald-400"
        },
        {
            step: 7,
            title: 'Creator Dashboard',
            desc: 'AI-powered channel analytics: health score, video performance, SWOT analysis & actionable recommendations.',
            toolId: "creator-dashboard",
            toolName: "Creator Dashboard",
            icon: "📊",
            color: "from-rose-500 to-pink-500",
            bgColor: "bg-rose-500/10",
            borderColor: "hover:border-rose-500/60",
            tag: "NEW",
            tagColor: "bg-rose-500/20 text-rose-400"
        },
    ];

    const handleOpenTool = (toolId: string) => {
        router.push('/tools/' + toolId);
    };

    return (
        <>
            {/* === CORE 3-STEP WORKFLOW === */}
            <section id="workflow-section" className="py-20 bg-black relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
                            <span className="text-purple-400 text-xs font-bold tracking-wider uppercase">Core Workflow</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                            {t('workflow.title', 'Quy Trình')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-cyan-400">{t('workflow.title_highlight', '3 Bước Để Làm Video Lên Top View')}</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            {t('workflow.subtitle', 'Hệ thống dẫn bạn đi từ "chưa biết làm gì" → "có video sẵn để đăng".')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-[28%] left-[16%] right-[16%] h-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-amber-500/30 -z-10" />

                        {CORE_STEPS.map((item) => (
                            <div
                                key={item.step}
                                className={`relative group ${item.bgColor} border border-gray-800 ${item.borderColor} hover:bg-opacity-20 p-8 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center`}
                            >
                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                    {item.tag && (
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${item.tagColor}`}>
                                            {item.tag}
                                        </span>
                                    )}
                                </div>

                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl mb-6 shadow-lg`}>
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

            {/* === ADVANCED WORKFLOWS (4 NEW) === */}
            <section className="py-20 bg-gradient-to-b from-black to-[#0a0a14] relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(139,92,246,.5px, transparent .5px), linear-gradient(90deg, rgba(139,92,246,.5px, transparent .5px))',
                    backgroundSize: '40px 40px'
                }}></div>
                <div className="absolute top-1/3 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px] -z-10"></div>
                <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] -z-10"></div>

                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
                            <span className="text-indigo-400 text-xs font-bold tracking-wider uppercase">Advanced Workflows</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                            4 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Power Tools</span> For Serious Creators
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Ai-powered workflows that combine multiple tools into single powerful pipelines. From concept to global distribution.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ADVANCED_WORKFLOWS.map((item) => (
                            <div
                                key={item.step}
                                className={`relative group ${item.bgColor} border border-gray-800 ${item.borderColor} p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col`}
                            >
                                {item.tag && (
                                    <div className="absolute top-3 right-3">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${item.tagColor}`}>
                                            {item.tag}
                                        </span>
                                    </div>
                                )}

                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                                    {item.icon}
                                </div>

                                <div className="absolute top-3 left-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                    WF{item.step}
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 pr-12">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed flex-grow mb-6">{item.desc}</p>

                                <button
                                    onClick={() => handleOpenTool(item.toolId)}
                                    className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${item.color} text-white font-bold text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg`}
                                >
                                    Open Tool →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
