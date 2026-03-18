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
            <div className="flex flex-col items-center justify-center p-12 text-center h-full border border-white/5 rounded-3xl bg-black/40 glass-panel">
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
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-[#CDAD5A]/10 border border-[#CDAD5A]/30 text-[#CDAD5A] text-xs font-bold rounded-full tracking-widest">
                        DAY {dayData.day}
                    </span>
                    {dayData.publishPlan?.type && dayData.publishPlan.type !== 'none' && (
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/70 text-xs font-bold rounded-full tracking-widest flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect height="14" rx="2" ry="2" width="15" x="1" y="5"></rect></svg>
                            VIDEO: {dayData.publishPlan.type.toUpperCase()}
                        </span>
                    )}
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight font-serif italic">
                    {dayData.title.split('-')[0] || dayData.title}
                    {dayData.title.includes('-') && (
                        <> - <br /><span className="text-[#CDAD5A] not-italic font-sans">{dayData.title.substring(dayData.title.indexOf('-') + 1)}</span></>
                    )}
                </h1>
            </header>

            {/* MESSAGE FROM MENTOR */}
            <section className="mb-12">
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#CDAD5A]/5 to-transparent opacity-50"></div>
                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        <div className="relative shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-[#CDAD5A] to-[#581C87] rounded-2xl blur-sm opacity-30"></div>
                            <img src="/images/ai-coach.png" alt="Mentor" className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border border-white/20 bg-black/50" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-white font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Lời Nhắn Từ Mentor
                            </h3>
                            <p className="text-zinc-300 italic text-lg font-serif leading-relaxed">
                                "{dayData.teacherMessage}"
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT: CONTENT & CHECKLIST */}
                <div className="lg:col-span-2 space-y-8">

                    {/* CORE LESSON */}
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[#CDAD5A]/20 flex items-center justify-center text-[#CDAD5A]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                            </div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Bài Học Cốt Lõi</h2>
                        </div>
                        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{dayData.coreLesson}</p>
                    </div>

                    {/* STEP BY STEP GUIDE */}
                    {(dayData as any).stepByStepGuide && (
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6">Hướng Dẫn Từng Bước</h2>
                            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{(dayData as any).stepByStepGuide}</p>
                        </div>
                    )}

                    {/* PUBLISH PLAN */}
                    {dayData.publishPlan?.type && dayData.publishPlan.type !== 'none' && (
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6">Kế Hoạch Đăng Bài</h2>
                            <div className="flex items-center justify-between bg-black/50 p-6 rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-zinc-500 text-sm font-medium">Giờ đăng gợi ý</p>
                                    <p className="text-2xl font-bold text-white mt-1">{dayData.publishPlan.publishTimeLocal || "Tùy chọn"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-500 text-sm font-medium">Loại Video</p>
                                    <p className="text-2xl font-bold text-[#CDAD5A] mt-1">{dayData.publishPlan.type.toUpperCase()}</p>
                                </div>
                            </div>
                            <p className="text-sm text-zinc-500 mt-4">Lưu ý: {dayData.publishPlan.notes}</p>
                        </div>
                    )}

                    {/* CHECKLIST */}
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-1 bg-green-500/50 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Nhiệm Vụ Hôm Nay</h2>
                            </div>
                            <span className="text-sm font-bold text-zinc-500">{completedCount}/{totalItems} HOÀN THÀNH</span>
                        </div>
                        <div className="space-y-4">
                            {dayData.checklist.map(item => {
                                const isChecked = checkedItems[item.id];
                                return (
                                    <label
                                        key={item.id}
                                        onClick={(e) => { e.preventDefault(); toggleCheck(item.id); }}
                                        className={`
                                            flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border
                                            ${isChecked
                                                ? 'bg-green-500/10 border-green-500/20'
                                                : 'bg-white/5 border-white/10 hover:border-[#CDAD5A]/50'
                                            }
                                        `}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-green-500 border-green-500 text-black' : 'border-zinc-700 bg-zinc-800'}`}>
                                            {isChecked && <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        <div className="flex-1">
                                            <span className={`block font-medium ${isChecked ? 'text-white/50 line-through' : 'text-white'}`}>
                                                {item.text}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{item.estMinutes} mins</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col items-center gap-4">
                        <button
                            onClick={onComplete}
                            disabled={!canComplete || isUpdating || status === 'COMPLETED'}
                            className={`
                                w-full py-5 rounded-2xl font-black text-lg tracking-widest flex items-center justify-center gap-3 transition-all duration-300
                                ${status === 'COMPLETED'
                                    ? 'bg-green-600 border border-green-500 text-white cursor-default'
                                    : canComplete
                                        ? 'bg-gradient-to-br from-[#CDAD5A] to-[#A68942] text-[#0A0A0B] hover:shadow-[0_0_25px_rgba(205,173,90,0.4)] hover:-translate-y-px'
                                        : 'bg-white/5 border border-white/10 text-zinc-600 cursor-not-allowed'}
                            `}
                        >
                            {status === 'COMPLETED' ? "ĐÃ HOÀN THÀNH" : "HOÀN THÀNH NGÀY HÔM NAY"}
                            {status === 'COMPLETED' ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" x2="19" y1="12" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            )}
                        </button>

                        {status !== 'COMPLETED' && (
                            <button
                                onClick={onSkip}
                                disabled={isUpdating}
                                className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Bỏ qua ngày này
                            </button>
                        )}
                    </div>

                </div>

                {/* RIGHT: TOOLS SIDEBAR */}
                <div className="space-y-6">
                    <div className="bg-white/[0.03] backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl sticky top-0">
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                            <span>🛠️</span> Công Cụ Hỗ Trợ
                        </h3>
                        <div className="space-y-4">
                            {dayData.seenytToolNudges.map((tool, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-[#581C87]/50 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-[#c084fc] tracking-widest uppercase">Gợi ý AI</span>
                                        <span className="w-2 h-2 rounded-full bg-[#581C87] shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                                    </div>
                                    <h4 className="text-white font-bold mb-1">{tool.label}</h4>
                                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{tool.why}</p>
                                    <button
                                        onClick={() => router.push(tool.deepLink)}
                                        className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1 group-hover:text-[#c084fc]"
                                    >
                                        {tool.ctaText} <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" x2="19" y1="12" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </div>
                            ))}
                            {dayData.seenytToolNudges.length === 0 && (
                                <p className="text-zinc-500 text-sm italic">Hôm nay không cần dùng tool, chỉ cần tập trung làm nội dung.</p>
                            )}
                        </div>

                        {/* Promotion / Community Card */}
                        <div className="mt-6 rounded-3xl p-6 bg-gradient-to-br from-[#581C87]/20 to-[#0A0A0B] border border-[#581C87]/30 relative overflow-hidden group cursor-pointer shadow-lg hover:border-[#581C87]/70 transition-colors">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-32 h-32 text-[#581C87]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3 className="text-white font-bold mb-2">Cộng đồng VVIP</h3>
                            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">Thảo luận cùng 2,000+ học viên khác trên Nhóm Zalo Kín.</p>
                            <a href="https://zalo.me/g/kqshmg192" target="_blank" rel="noopener noreferrer" className="text-[#c084fc] text-xs font-black tracking-widest uppercase block mt-2">Tham Gia Ngay →</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayDetail;
