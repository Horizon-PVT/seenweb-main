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

    // MAIN VIEW - SPLIT PANES
    return (
        <div className="h-full bg-[#1F291D] font-sans flex flex-col overflow-hidden">
            {/* HEADER TOOL */}
            <div className="flex justify-between items-center px-6 py-4 bg-[#111] border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-900/30 rounded-lg">
                        <span className="text-xl">🎓</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Thầy YouTube (30 Day Roadmap)</h2>
                    </div>
                </div>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm">
                    Quay lại
                </button>
            </div>

            {/* Lock Alert */}
            {showLockAlert && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 text-sm">
                        🔒 {lockAlertMessage}
                    </div>
                </div>
            )}

            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* SIDEBAR (Day List) */}
                <div className="w-64 bg-black/20 border-r border-white/10 overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-gray-700">
                    <div className="p-4 border-b border-white/10 bg-[#161b14]">
                        <h2 className="text-[#F3EFE0] font-bold uppercase text-xs tracking-wider mb-1">LỘ TRÌNH</h2>
                        <p className="text-yellow-500 font-bold text-sm">30 NGÀY MASTER</p>
                    </div>

                    <div className="flex flex-col pb-10">
                        {Array.from({ length: 31 }, (_, i) => i).map((dayIdx) => {
                            const dayInfo = days[dayIdx];
                            const status = dayInfo?.status || "LOCKED";
                            const isSelected = selectedDay === dayIdx;
                            const isTierLocked = dayInfo?.lockedByTier;
                            const isLocked = status === 'LOCKED';

                            return (
                                <button
                                    key={dayIdx}
                                    onClick={() => handleDayClick(dayIdx)}
                                    className={`
                                    flex items-center gap-3 p-3 text-left transition-colors border-l-4
                                    ${isSelected
                                            ? 'bg-white/10 border-yellow-500 text-white'
                                            : isLocked
                                                ? 'border-transparent text-gray-600 cursor-not-allowed opacity-50'
                                                : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                                `}
                                >
                                    <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]
                                    ${status === 'COMPLETED' ? 'bg-green-900 text-green-400' :
                                            status === 'OPEN' ? 'bg-yellow-900 text-yellow-400' :
                                                'bg-gray-800 text-gray-500'}
                                `}>
                                        {status === 'COMPLETED' ? '✓' : dayIdx}
                                    </div>
                                    <div className="truncate">
                                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                            Ngày {dayIdx}
                                        </p>
                                        <p className="text-[10px] uppercase text-gray-600">
                                            {isTierLocked ? '🔒 VVIP' : status}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* MAIN CONTENT Area */}
                <div className="flex-1 overflow-y-auto bg-[#1F291D] relative p-6">
                    <div className="max-w-4xl mx-auto pb-32">
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
