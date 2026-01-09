import React from 'react';

type Channel = {
    id: string;
    slug: string;
    name: string;
    icon: string;
    isLocked: boolean;
    category: string;
    type: string;
};

interface ChannelSidebarProps {
    channels: Channel[];
    activeChannel: Channel | null;
    onSelect: (channel: Channel) => void;
    userRole: string; // 'FREE', 'PRO', etc.
    // New Props for Admin Toggle
    autoChatEnabled?: boolean;
    toggleAutoChat?: () => void;
}

const CATEGORY_LABELS: any = {
    'GENERAL': 'Sảnh Chính',
    'GROWTH': 'Hành Trình YouTuber',
    'SPECIAL': 'Chuyên Môn & Showcase',
};

export default function ChannelSidebar({
    channels,
    activeChannel,
    onSelect,
    userRole,
    autoChatEnabled,
    toggleAutoChat
}: ChannelSidebarProps) {

    const canAccess = (channel: Channel) => {
        if (!channel.isLocked) return true;
        if (userRole !== 'FREE') return true;
        // Admin always true in parent login logic usually
        return false;
    };

    // Group channels
    const groupedCoords = channels.reduce((acc: any, channel) => {
        const cat = channel.category || 'GENERAL';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(channel);
        return acc;
    }, {});

    const categories = ['GENERAL', 'GROWTH', 'SPECIAL']; // Order

    return (
        <div className="w-80 bg-gradient-to-b from-yellow-950 via-[#422006] to-black flex flex-col h-full border-r border-[#EAB308]/20 font-sans relative z-30 shadow-2xl">
            <div className="p-4 border-b border-[#EAB308]/20 flex items-center justify-between bg-yellow-950/50 backdrop-blur">
                <div>
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200 tracking-wide uppercase italic filter drop-shadow">
                        SEEN HUB
                    </h2>
                    <p className="text-[10px] text-yellow-500/80 mt-1 tracking-[0.2em] uppercase font-mono">Gold Member Area</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {categories.map(cat => {
                    const catChannels = groupedCoords[cat];
                    if (!catChannels?.length) return null;

                    return (
                        <div key={cat} className="mb-6">
                            <h3 className="px-4 text-[10px] font-bold text-yellow-600/80 uppercase tracking-widest mb-3 font-mono border-l-2 border-[#EAB308]/30 pl-3 ml-1">
                                {CATEGORY_LABELS[cat] || cat}
                            </h3>
                            <div className="space-y-1">
                                {catChannels.map((channel: Channel) => {
                                    const isActive = activeChannel?.id === channel.id;
                                    const locked = !canAccess(channel);

                                    return (
                                        <button
                                            key={channel.id}
                                            onClick={() => onSelect(channel)}
                                            // disabled={locked} 
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                                        ${isActive
                                                    ? 'bg-gradient-to-r from-[#EAB308]/20 to-yellow-900/40 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.15)] border border-[#EAB308]/30'
                                                    : 'text-gray-400 hover:bg-black/20 hover:text-yellow-200 border border-transparent'}
                                        ${locked ? 'opacity-60 saturate-0' : ''}
                                    `}
                                        >
                                            <span className={`text-lg transition-transform duration-300 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)] ${isActive ? 'scale-110 text-yellow-400' : 'group-hover:scale-110 text-gray-500 group-hover:text-yellow-500'}`}>
                                                {channel.icon || '#'}
                                            </span>
                                            <div className="flex-1 text-left relative z-10">
                                                <div className="font-bold text-sm flex items-center gap-2">
                                                    {channel.name}
                                                    {channel.type === 'SHOWCASE' && <span className="text-[8px] bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-1 rounded uppercase tracking-wider font-mono">Card</span>}
                                                </div>
                                            </div>
                                            {channel.isLocked && <span className="text-xs">🔒</span>}

                                            {/* Active Indicator */}
                                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308] blur-[2px]"></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 bg-black/40 border-t border-[#EAB308]/20 space-y-3">
                {/* Admin Toggle - Bottom Left */}
                {(userRole === 'ADMIN' || userRole === 'MOD') && toggleAutoChat && (
                    <button
                        onClick={toggleAutoChat}
                        className={`w-full py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2
                            ${autoChatEnabled
                                ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                            }
                        `}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${autoChatEnabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {autoChatEnabled ? 'Auto Bot: ON' : 'Auto Bot: OFF'}
                    </button>
                )}

                <div className="bg-gradient-to-r from-yellow-900/40 to-black rounded-xl p-3 flex items-center gap-3 border border-[#EAB308]/10 hover:border-[#EAB308]/40 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-[#EAB308] flex items-center justify-center text-xs font-black text-black shadow-lg group-hover:shadow-[0_0_15px_#EAB308] transition-all">
                        YOU
                    </div>
                    <div>
                        <p className="text-xs text-yellow-100 font-bold uppercase tracking-wide group-hover:text-[#EAB308] transition-colors">Thành tích của bạn</p>
                        <p className="text-[10px] text-gray-400 font-mono">0 Badges • 0 Streak</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
