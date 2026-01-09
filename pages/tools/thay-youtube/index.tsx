import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import Header from "../../../components/Header";
import Landing from "../../../components/tools/ThayYoutube/Landing";
import DayDetail from "../../../components/tools/ThayYoutube/DayDetail";
import { RoadmapDay } from "../../../lib/teacher-roadmap-data";
import { useRouter } from "next/router";

interface DayStatus {
    status: "LOCKED" | "OPEN" | "COMPLETED" | "SKIPPED";
    lockedByTier: boolean;
    content: RoadmapDay | null;
}

export default function ThayYoutubePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

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
            // Find the last completed/open day
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

    // Fetch roadmap data
    const fetchRoadmap = async () => {
        try {
            const res = await fetch("/api/tools/thay-youtube/roadmap");
            if (res.ok) {
                const data = await res.json();
                setRoadmap(data.roadmap);
                setDays(data.days);

                // Find latest open day to select by default
                const latestOpen = Object.entries(data.days)
                    .filter(([_, val]: any) => val.status === 'OPEN' || val.status === 'COMPLETED')
                    .map(([d]) => parseInt(d))
                    .pop();

                if (latestOpen !== undefined) {
                    // Only switch if we are at 0 (initial load)
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
        } else if (status === "unauthenticated") {
            // Just show Landing (which has CTA to login/start)
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
                // Re-fetch roadmap to update locks
                await fetchRoadmap();
                // Auto advance
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
        return <div className="min-h-screen bg-[#1F291D] flex items-center justify-center text-white">Loading...</div>;
    }

    // Not logged in or No roadmap -> Show Landing
    if (!roadmap) {
        return (
            <>
                <Head>
                    <title>Thầy YouTube - Giáo Án 30 Ngày</title>
                </Head>
                <Header />
                <Landing onComplete={fetchRoadmap} />
            </>
        );
    }

    // Dashboard View
    return (
        <div className="min-h-screen bg-[#1F291D] font-sans flex flex-col">
            <Head>
                <title>Thầy YouTube - Giáo Án 30 Ngày</title>
            </Head>
            <Header />

            {/* Lock Alert Toast */}
            {showLockAlert && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2">
                        🔒 {lockAlertMessage}
                    </div>
                </div>
            )}

            <div className="flex flex-1 pt-[72px] h-[calc(100vh-72px)] overflow-hidden">

                {/* SIDEBAR (Day List) */}
                <div className="w-20 md:w-64 bg-black/40 border-r border-white/10 overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-gray-700">
                    <div className="p-4 border-b border-white/10 hidden md:block">
                        <h2 className="text-[#F3EFE0] font-bold uppercase text-xs tracking-wider mb-1">LỘ TRÌNH</h2>
                        <p className="text-yellow-500 font-bold">30 NGÀY MASTER</p>
                    </div>

                    <div className="flex flex-col">
                        {/* We assume 0-30 days */}
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
                                    flex items-center gap-3 p-4 text-left transition-colors border-l-4
                                    ${isSelected
                                            ? 'bg-white/10 border-yellow-500 text-white'
                                            : isLocked
                                                ? 'border-transparent text-gray-600 cursor-not-allowed opacity-50'
                                                : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                                `}
                                >
                                    <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs
                                    ${status === 'COMPLETED' ? 'bg-green-900 text-green-400' :
                                            status === 'OPEN' ? 'bg-yellow-900 text-yellow-400' :
                                                'bg-gray-800 text-gray-500'}
                                `}>
                                        {status === 'COMPLETED' ? '✓' : dayIdx}
                                    </div>
                                    <div className="hidden md:block truncate">
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
                <div className="flex-1 overflow-y-auto bg-[#1F291D] relative">
                    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32">
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
