
import React from 'react';
import { ChevronLeft, Film, Construction } from 'lucide-react';

interface AutoShortToolProps {
    onBack?: () => void;
}

export default function AutoShortTool({ onBack }: AutoShortToolProps) {
    return (
        <div className="h-full flex flex-col bg-black text-white p-8">
            <header className="flex items-center gap-4 mb-8">
                {onBack && (
                    <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Film className="text-purple-500" /> Auto Short
                </h1>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <Construction size={64} className="mb-4 text-gray-500" />
                <h2 className="text-xl font-bold mb-2">Under Construction</h2>
                <p className="max-w-md text-gray-400">
                    The automated Shorts generator is currently being optimized for maximum viral potential. Check back soon.
                </p>
            </div>
        </div>
    );
}
