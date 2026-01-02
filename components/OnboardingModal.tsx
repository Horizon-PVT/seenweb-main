"use client";

import React, { useState, useEffect } from "react";

const ONBOARDING_KEY = "seenyt_onboarding_completed";

interface OnboardingModalProps {
    onComplete: () => void;
}

const GOALS = [
    { id: "faceless", icon: "🎭", label: "Video Faceless" },
    { id: "story", icon: "📖", label: "Kể chuyện / Story" },
    { id: "shorts", icon: "⚡", label: "Shorts" },
    { id: "review", icon: "🔎", label: "Review / Thông tin" },
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check localStorage only on client side
        const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
        if (!hasCompleted) {
            // Small delay for smooth entrance
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSelect = (goalId: string) => {
        localStorage.setItem(ONBOARDING_KEY, "true");
        setIsOpen(false);
        onComplete();

        // Smooth scroll to workflow section
        setTimeout(() => {
            const element = document.getElementById('workflow-section');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300">
                <div className="p-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Chào YouTuber mới! 👋
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Bạn muốn làm YouTube theo hướng nào?
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {GOALS.map((goal) => (
                            <button
                                key={goal.id}
                                onClick={() => handleSelect(goal.id)}
                                className="group flex flex-col items-center justify-center p-6 rounded-xl bg-gray-800 hover:bg-gray-700 border border-transparent hover:border-[#A855F7] transition-all duration-300"
                            >
                                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                    {goal.icon}
                                </span>
                                <span className="font-semibold text-gray-200 group-hover:text-white">
                                    {goal.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
