import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';

interface UnderConstructionProps {
    title: string;
    onBack?: () => void;
}

const UnderConstructionTool: React.FC<UnderConstructionProps> = ({ title, onBack }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-[#0F0F0F] text-white p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="max-w-md text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping"></div>
                    <div className="relative bg-yellow-900/40 p-5 rounded-full border border-yellow-500/50 flex items-center justify-center w-full h-full">
                        <Construction className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase tracking-wide">
                    {title}
                </h2>

                <p className="text-gray-400 text-lg">
                    Tính năng đang được phát triển và sẽ sớm ra mắt trong phiên bản tới.
                </p>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-500 italic">
                    "Chúng tôi đang nỗ lực tối ưu hóa trải nghiệm AI tốt nhất cho bạn."
                </div>

                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all flex items-center gap-2 mx-auto"
                    >
                        <ArrowLeft className="w-5 h-5" /> Quay Lại
                    </button>
                )}
            </div>
        </div>
    );
};

export default UnderConstructionTool;
