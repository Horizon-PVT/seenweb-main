import React from 'react';
import { 
    Search, 
    FileText, 
    Video, 
    Sparkles, 
    TrendingUp,
    Home
} from 'lucide-react';

interface MobileNavProps {
    activeTool?: string | null;
    onToolSelect: (toolId: string | null) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTool, onToolSelect }) => {
    const navItems = [
        { id: null, label: 'Home', icon: Home },
        { id: 'niche-radar', label: 'Niche', icon: Search },
        { id: 'script-studio', label: 'Script', icon: FileText },
        { id: 'video-pipeline', label: 'Video', icon: Video },
        { id: 'intelligence-hub', label: 'Intel', icon: Sparkles },
        { id: 'seo-tool', label: 'SEO', icon: TrendingUp },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D10]/95 backdrop-blur-lg border-t border-gray-800 pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = activeTool === item.id;
                    const Icon = item.icon;
                    
                    return (
                        <button
                            key={item.id || 'home'}
                            onClick={() => onToolSelect(item.id)}
                            className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${
                                isActive ? 'text-[#CDAD5A]' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${
                                isActive ? 'bg-[#CDAD5A]/10 shadow-[0_0_15px_rgba(205,173,90,0.2)]' : ''
                            }`}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileNav;
