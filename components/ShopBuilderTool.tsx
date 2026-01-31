
import React from 'react';
import { ChevronLeft, ShoppingBag, Hammer } from 'lucide-react';

interface ShopBuilderToolProps {
    onBack?: () => void;
}

export default function ShopBuilderTool({ onBack }: ShopBuilderToolProps) {
    return (
        <div className="h-full flex flex-col bg-black text-white p-8">
            <header className="flex items-center gap-4 mb-8">
                {onBack && (
                    <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShoppingBag className="text-orange-500" /> Shop Builder
                </h1>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <Hammer size={64} className="mb-4 text-gray-500" />
                <h2 className="text-xl font-bold mb-2">Building Your Store</h2>
                <p className="max-w-md text-gray-400">
                    E-commerce integration tools are under heavy development. We are laying the bricks for your empire.
                </p>
            </div>
        </div>
    );
}
