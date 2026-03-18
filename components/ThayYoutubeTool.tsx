import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Landing from "@/components/tools/ThayYoutube/Landing";
import DayDetail from "@/components/tools/ThayYoutube/DayDetail";
import { RoadmapDay } from "@/lib/teacher-roadmap-data";

interface DayStatus {
    status: "LOCKED" | "OPEN" | "COMPLETED" | "SKIPPED";
    lockedByTier: boolean;
    content: RoadmapDay | null;
}

interface ThayYoutubeToolProps {
    onBack?: () => void;
    onToolSelect?: (id: string) => void;
}

export default function ThayYoutubeTool({ onBack }: ThayYoutubeToolProps) {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [roadmap, setRoadmap] = useState<any>(null);
    const [days, setDays] = useState<Record<number, DayStatus>>({});
    const [selectedDay, setSelectedDay] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showLockAlert, setShowLockAlert] = useState(false);
    const [lockAlertMessage, setLockAlertMessage] = useState("");

    // Handler for clicking on a locked day
    const handleDayClick = (dayIdx: number) => {
        const dayInfo = days[dayIdx];
        const dayStatus = dayInfo?.status || "LOCKED";

        if (dayStatus === "LOCKED") {
            const lastOpenDay = Object.entries(days)
                .filter(([_, val]: any) => val.status === 'OPEN' || val.status === 'COMPLETED')
                .map(([d]) => parseInt(d))
                .pop() || 0;

            setLockAlertMessage(`Hoàn thành Ngày ${lastOpenDay} trước để mở khóa Ngày ${dayIdx}`);
            setShowLockAlert(true);
            setTimeout(() => setShowLockAlert(false), 3000);
            return;
        }
        setSelectedDay(dayIdx);
    };

    const fetchRoadmap = async () => {
        try {
            const res = await fetch("/api/tools/thay-youtube/roadmap");
            if (res.ok) {
                const data = await res.json();
                setRoadmap(data.roadmap);
                setDays(data.days);

                const latestOpen = Object.entries(data.days)
                    .filter(([_, val]: any) => val.status === 'OPEN' || val.status === 'COMPLETED')
                    .map(([d]) => parseInt(d))
                    .pop();

                if (latestOpen !== undefined) {
                    setSelectedDay(latestOpen);
                }
            } else if (res.status === 404) {
                setRoadmap(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchRoadmap();
        } else {
            setLoading(false);
        }
    }, [status]);

    const handleUpdateProgress = async (day: number, action: 'COMPLETE' | 'SKIP') => {
        setIsUpdating(true);
        try {
            const res = await fetch("/api/tools/thay-youtube/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ day, action })
            });

            if (res.ok) {
                const data = await res.json();
                await fetchRoadmap();
                if (data.nextDay <= 30) {
                    setSelectedDay(data.nextDay);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center text-white">Loading...</div>;
    }

    // LANDING VIEW
    if (!roadmap) {
        return (
            <div className="h-full overflow-y-auto bg-[#1F291D]">
                <div className="flex justify-end p-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white bg-black/20 px-3 py-1 rounded">Quay Lại Dashboard</button>
                </div>
                <Landing onComplete={fetchRoadmap} />
            </div>
        );
    }

    // Calculate Overall Progress
    const totalDays = 31;
    const completedDays = Object.values(days).filter((d: any) => d.status === 'COMPLETED').length;
    const progressPercent = Math.round((completedDays / totalDays) * 100);

    // MAIN VIEW - SPLIT PANES
    return (
        <div className="h-full bg-[#0A0A0B] text-gray-300 font-sans flex flex-col overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#581C87]/10 blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#CDAD5A]/5 blur-[120px] pointer-events-none z-0"></div>

            {/* HEADER TOOL */}
            <div className="flex justify-between items-center px-6 py-4 bg-[#09090b] border-b border-white/10 shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-tr from-yellow-900/50 to-amber-600/30 rounded-lg shadow-lg">
                        <span className="text-xl">🎓</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide">Thầy YouTube <span className="text-[#CDAD5A] italic font-serif">Masterclass</span></h2>
                    </div>
                </div>
                <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors px-4 py-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-sm font-medium">
                    ← Quay lại Dashboard
                </button>
            </div>

            {/* Lock Alert */}
            {showLockAlert && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-sm border border-red-400/50">
                        🔒 {lockAlertMessage}
                    </div>
                </div>
            )}

            <div className="flex flex-1 min-h-0 overflow-hidden relative z-10">
                {/* SIDEBAR (Day List) */}
                <div className="w-72 bg-[#09090b] border-r border-white/10 overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-white/10 flex flex-col">
                    <div className="p-6 border-b border-white/10 flex items-center gap-4 shrink-0">
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            {/* Progress Ring SVG */}
                            <svg className="w-12 h-12 transform -rotate-90">
                                <circle cx="24" cy="24" r="20" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="3"></circle>
                                <circle 
                                    cx="24" cy="24" r="20" fill="transparent" stroke="#CDAD5A" strokeWidth="3" 
                                    strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * progressPercent) / 100} strokeLinecap="round"
                                    className="drop-shadow-[0_0_8px_rgba(205,173,90,0.5)] transition-all duration-1000"
                                ></circle>
                            </svg>
                            <span className="absolute text-[10px] font-bold text-[#CDAD5A]">{completedDays}/31</span>
                        </div>
                        <div>
                            <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Lộ trình</h2>
                            <h1 className="text-sm font-bold text-white uppercase">30 NGÀY MASTER</h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-1">
                        {Array.from({ length: 31 }, (_, i) => i).map((dayIdx) => {
                            const dayInfo = days[dayIdx];
                            const status = dayInfo?.status || "LOCKED";
                            const isSelected = selectedDay === dayIdx;
                            const isTierLocked = dayInfo?.lockedByTier;
                            const title = dayInfo?.content?.title || `Ngày ${dayIdx}`;

                            if (isSelected) {
                                return (
                                    <button onClick={() => handleDayClick(dayIdx)} key={dayIdx} className="w-full relative flex items-center gap-4 px-6 py-4 bg-white/5 group transition-all text-left">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CDAD5A] shadow-[2px_0_10px_rgba(205,173,90,0.5)]"></div>
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#CDAD5A] flex items-center justify-center text-xs font-bold text-[#CDAD5A]">
                                            {dayIdx.toString().padStart(2, '0')}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs text-[#CDAD5A] font-medium">Đang học</span>
                                            <span className="text-sm font-semibold text-white truncate">{title}</span>
                                        </div>
                                    </button>
                                );
                            }

                            if (status === 'COMPLETED') {
                                return (
                                    <button onClick={() => handleDayClick(dayIdx)} key={dayIdx} className="w-full flex items-center gap-4 px-6 py-4 opacity-60 hover:opacity-100 transition-all text-left">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs text-zinc-500 line-through">Ngày {dayIdx} - Hoàn thành</span>
                                            <span className="text-sm font-medium text-zinc-400 line-through truncate">{title}</span>
                                        </div>
                                    </button>
                                );
                            }

                            if (isTierLocked) {
                                return (
                                    <button onClick={() => handleDayClick(dayIdx)} key={dayIdx} className="w-full flex items-center gap-4 px-6 py-4 opacity-50 group relative overflow-hidden text-left hover:bg-white/5 transition-colors">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#581C87]/50 flex items-center justify-center bg-[#581C87]/20">
                                            <svg className="w-4 h-4 text-[#c084fc]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="11" rx="2" ry="2" width="18" x="3" y="11"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-500">Ngày {dayIdx}</span>
                                                <span className="text-[9px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">🔒 VVIP</span>
                                            </div>
                                            <span className="text-sm font-medium text-zinc-400 truncate">{title}</span>
                                        </div>
                                    </button>
                                );
                            }

                            // Default Locked Future Days
                            if (status === 'LOCKED') {
                                return (
                                    <button onClick={() => handleDayClick(dayIdx)} key={dayIdx} className="w-full flex items-center gap-4 px-6 py-4 opacity-40 cursor-not-allowed text-left">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs text-zinc-500">
                                            {dayIdx.toString().padStart(2, '0')}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs text-zinc-500">Ngày {dayIdx} - Cần hoàn thành ngày trước</span>
                                            <span className="text-sm font-medium text-zinc-400 truncate">{title}</span>
                                        </div>
                                    </button>
                                );
                            }

                            // Open but not selected (rare if it automatically selects, but handled here)
                            return (
                                <button onClick={() => handleDayClick(dayIdx)} key={dayIdx} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all text-left">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full border border-yellow-500/50 flex items-center justify-center text-xs font-bold text-yellow-500">
                                        {dayIdx.toString().padStart(2, '0')}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-xs text-yellow-500 font-medium">Sẵn sàng</span>
                                        <span className="text-sm font-medium text-zinc-300 truncate">{title}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* MAIN CONTENT Area */}
                <div className="flex-1 overflow-y-auto bg-transparent relative p-6 lg:p-12 custom-scrollbar">
                    <div className="max-w-6xl mx-auto pb-32">
                        <DayDetail
                            dayIndex={selectedDay}
                            dayData={days[selectedDay]?.content}
                            status={days[selectedDay]?.status}
                            lockedByTier={days[selectedDay]?.lockedByTier}
                            onComplete={() => handleUpdateProgress(selectedDay, 'COMPLETE')}
                            onSkip={() => handleUpdateProgress(selectedDay, 'SKIP')}
                            isUpdating={isUpdating}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
