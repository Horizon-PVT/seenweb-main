import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { RoadmapDay } from "../../../lib/teacher-roadmap-data";

interface Props {
    dayData: RoadmapDay | null;
    status: "LOCKED" | "OPEN" | "COMPLETED" | "SKIPPED";
    lockedByTier: boolean;
    dayIndex: number;
    onComplete: () => void;
    onSkip: () => void;
    isUpdating: boolean;
}

const DayDetail: React.FC<Props> = ({
    dayData,
    status,
    lockedByTier,
    dayIndex,
    onComplete,
    onSkip,
    isUpdating
}) => {
    const router = useRouter();
    // Local state for checklist items
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const toggleCheck = (id: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (lockedByTier) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full border border-yellow-500/20 rounded-2xl bg-gradient-to-br from-yellow-900/10 to-black">
                <div className="text-6xl mb-6">🔒</div>
                <h2 className="text-3xl font-bold text-[#F3EFE0] mb-4">Nội dung VVIP</h2>
                <p className="text-gray-400 mb-8 max-w-lg">
                    Ngày {dayIndex} thuộc lộ trình nâng cao (Day 11-30).
                    Nâng cấp gói VVIP để mở khóa chiến lược giữ chân khán giả và kiếm tiền.
                </p>
                <Link href="/pricing" className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-full hover:scale-105 transition-transform">
                    Nâng Cấp Ngay
                </Link>
            </div>
        )
    }

    if (!dayData) { // Regular lock (future days)
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full border border-white/5 rounded-2xl bg-black/40">
                <div className="text-4xl mb-4 text-gray-600">🔒</div>
                <h2 className="text-2xl font-bold text-gray-500 mb-2">Ngày {dayIndex} chưa mở</h2>
                <p className="text-gray-600">Hoàn thành các ngày trước để mở khóa.</p>
            </div>
        )
    }

    // Calculate Progress for Checklist
    const totalItems = dayData.checklist.length;
    const completedCount = dayData.checklist.filter(i => checkedItems[i.id]).length;
    const progress = Math.round((completedCount / totalItems) * 100);
    const canComplete = completedCount === totalItems;

    return (
        <div className="animate-fade-in">
            {/* HEADER */}
            <div className="mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">DAY {dayData.day}</span>
                    {dayData.publishPlan?.type && dayData.publishPlan.type !== 'none' && (
                        <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-500/30">
                            VIDEO: {dayData.publishPlan.type.toUpperCase()}
                        </span>
                    )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#F3EFE0] mb-4">{dayData.title}</h1>

                <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-3xl">👨‍🏫</div>
                    <div>
                        <p className="text-[#CDAD5A] font-bold text-sm mb-1">LỜI NHẮN TỪ THẦY</p>
                        <p className="text-[#F3EFE0]/80 italic">"{dayData.teacherMessage}"</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT: CONTENT & CHECKLIST */}
                <div className="lg:col-span-2 space-y-8">

                    {/* CORE LESSON */}
                    <section>
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            💡 Bài Học Cốt Lõi
                        </h3>
                        <div className="bg-blue-900/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <p className="text-[#F3EFE0]/90 whitespace-pre-wrap">{dayData.coreLesson}</p>
                        </div>
                    </section>

                    {/* STEP BY STEP GUIDE */}
                    {(dayData as any).stepByStepGuide && (
                        <section>
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                📋 Hướng Dẫn Từng Bước
                            </h3>
                            <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl">
                                <p className="text-[#F3EFE0]/90 whitespace-pre-wrap">{(dayData as any).stepByStepGuide}</p>
                            </div>
                        </section>
                    )}

                    {/* PUBLISH PLAN */}
                    {dayData.publishPlan?.type && dayData.publishPlan.type !== 'none' && (
                        <section>
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                📹 Kế Hoạch Đăng Bài
                            </h3>
                            <div className="bg-black/30 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Giờ đăng gợi ý</p>
                                    <p className="text-xl font-bold text-white">{dayData.publishPlan.publishTimeLocal || "Tùy chọn"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm">Loại Video</p>
                                    <p className="text-xl font-bold text-yellow-500">{dayData.publishPlan.type.toUpperCase()}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Note: {dayData.publishPlan.notes}</p>
                        </section>
                    )}

                    {/* CHECKLIST */}
                    <section>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            ✅ Nhiệm Vụ Hôm Nay ({completedCount}/{totalItems})
                        </h3>
                        <div className="space-y-3">
                            {dayData.checklist.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleCheck(item.id)}
                                    className={`
                                    flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                                    ${checkedItems[item.id]
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'}
                                `}
                                >
                                    <div className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                                    ${checkedItems[item.id] ? 'bg-green-500 border-green-500' : 'border-gray-500'}
                                `}>
                                        {checkedItems[item.id] && <span className="text-black font-bold text-xs">✓</span>}
                                    </div>
                                    <div>
                                        <p className={`text-base ${checkedItems[item.id] ? 'text-gray-300 line-through' : 'text-[#F3EFE0]'}`}>
                                            {item.text}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.estMinutes} phút</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="border-t border-white/10 pt-6 flex gap-4">
                        <button
                            onClick={onComplete}
                            disabled={!canComplete || isUpdating || status === 'COMPLETED'}
                            className={`
                            flex-1 py-4 rounded-xl font-bold text-lg transition-all
                            ${status === 'COMPLETED'
                                    ? 'bg-green-600 text-white cursor-default'
                                    : canComplete
                                        ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20'
                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                        `}
                        >
                            {status === 'COMPLETED' ? "ĐÃ HOÀN THÀNH ✓" : "HOÀN THÀNH NGÀY HÔM NAY"}
                        </button>

                        {status !== 'COMPLETED' && (
                            <button
                                onClick={onSkip}
                                disabled={isUpdating}
                                className="bg-transparent border border-white/10 text-gray-500 px-6 rounded-xl hover:text-white hover:border-white/30"
                            >
                                Bỏ qua
                            </button>
                        )}
                    </div>

                </div>

                {/* RIGHT: TOOLS SIDEBAR */}
                <div className="space-y-6">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 sticky top-24">
                        <h3 className="text-lg font-bold text-white mb-4">🛠️ Tools Hỗ Trợ</h3>
                        <div className="space-y-4">
                            {dayData.seenytToolNudges.map((tool, idx) => (
                                <div key={idx} className="bg-black/40 p-4 rounded-xl border border-white/5">
                                    <p className="font-bold text-[#F3EFE0] mb-1">{tool.label}</p>
                                    <p className="text-xs text-gray-400 mb-3">{tool.why}</p>
                                    <button
                                        onClick={() => router.push(tool.deepLink)}
                                        className="block w-full text-center bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-xs font-bold py-2 rounded transition-colors border border-yellow-500/30"
                                    >
                                        {tool.ctaText} →
                                    </button>
                                </div>
                            ))}
                            {dayData.seenytToolNudges.length === 0 && (
                                <p className="text-gray-500 text-sm italic">Hôm nay không cần dùng tool, chỉ cần tập trung làm nội dung.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayDetail;
