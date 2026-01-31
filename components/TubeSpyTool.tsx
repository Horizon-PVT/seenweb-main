
import React from 'react';
import { ChevronLeft, Eye, Clock } from 'lucide-react';

interface TubeSpyToolProps {
    onBack?: () => void;
}

export default function TubeSpyTool({ onBack }: TubeSpyToolProps) {
    return (
        <div className="h-full flex flex-col bg-black text-white p-8">
            <header className="flex items-center gap-4 mb-8">
                {onBack && (
                    <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Eye className="text-red-500" /> Tube Spy
                </h1>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <Clock size={64} className="mb-4 text-gray-500" />
                <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                <p className="max-w-md text-gray-400">
                    Advanced YouTube analytics and competitor espionage tools are under development. Stay tuned for data-driven domination.
                </p>
            </div>
        </div>
    );
}
