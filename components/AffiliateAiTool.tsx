
import React from 'react';
import { ChevronLeft, Link as LinkIcon, DollarSign } from 'lucide-react';

interface AffiliateAiToolProps {
    onBack?: () => void;
}

export default function AffiliateAiTool({ onBack }: AffiliateAiToolProps) {
    return (
        <div className="h-full flex flex-col bg-black text-white p-8">
            <header className="flex items-center gap-4 mb-8">
                {onBack && (
                    <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <LinkIcon className="text-blue-400" /> Affiliate AI
                </h1>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <DollarSign size={64} className="mb-4 text-gray-500" />
                <h2 className="text-xl font-bold mb-2">Revenue Optimization</h2>
                <p className="max-w-md text-gray-400">
                    AI-powered affiliate marketing strategies are being calculated. Maximize your earnings soon.
                </p>
            </div>
        </div>
    );
}
