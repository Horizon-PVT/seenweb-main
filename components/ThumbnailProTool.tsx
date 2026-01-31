
import React from 'react';
import { ChevronLeft, Image as ImageIcon, Paintbrush } from 'lucide-react';

interface ThumbnailProToolProps {
    onBack?: () => void;
}

export default function ThumbnailProTool({ onBack }: ThumbnailProToolProps) {
    return (
        <div className="h-full flex flex-col bg-black text-white p-8">
            <header className="flex items-center gap-4 mb-8">
                {onBack && (
                    <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ImageIcon className="text-green-500" /> Thumbnail Pro
                </h1>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <Paintbrush size={64} className="mb-4 text-gray-500" />
                <h2 className="text-xl font-bold mb-2">Design Studio Loading...</h2>
                <p className="max-w-md text-gray-400">
                    High-CTR thumbnail generation tools are being forged. Prepare for click-through rate explosions.
                </p>
            </div>
        </div>
    );
}
