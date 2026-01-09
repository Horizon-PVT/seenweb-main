import React from 'react';

type FlexCardProps = {
    message: {
        id: string;
        content: string;
        user: any;
        metadata: any; // { subCount, viewCount, topic, insight }
        createdAt: string;
    }
};

export default function FlexCard({ message }: FlexCardProps) {
    const { user, metadata, content } = message;
    const isBigWin = (metadata?.subCount > 10000) || (metadata?.viewCount > 100000);

    return (
        <div className={`
        relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1
        ${isBigWin
                ? 'bg-gradient-to-br from-[#2a1b3d] to-[#1a1a2e] border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                : 'bg-[#2f3136] border-white/5 hover:border-white/10 shadow-lg'}
    `}>
            {/* Header User */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg
                ${isBigWin ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' : 'bg-gray-600'}
            `}>
                    {user.name?.[0]}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold">{user.name}</h4>
                        {isBigWin && <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold">LEGEND</span>}
                    </div>
                    <p className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Stats Grid */}
            {metadata && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/20 p-2 rounded-lg text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Subscriber</p>
                        <p className="text-xl font-black text-white">{new Intl.NumberFormat().format(metadata.subCount || 0)}</p>
                    </div>
                    <div className="bg-black/20 p-2 rounded-lg text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">7-Day View</p>
                        <p className="text-xl font-black text-green-400">+{new Intl.NumberFormat().format(metadata.viewCount || 0)}</p>
                    </div>
                </div>
            )}

            {/* Insight / Content */}
            <div className="mb-4">
                <p className="text-[10px] text-gray-500 uppercase mb-1">🔥 Bí kíp / Insight</p>
                <p className="text-gray-300 text-sm leading-relaxed italic">"{content}"</p>
            </div>

            {/* Topic Tag */}
            {metadata?.topic && (
                <div className="inline-block bg-white/5 px-2 py-1 rounded text-xs text-gray-400 border border-white/5">
                    #{metadata.topic}
                </div>
            )}

            {/* Decor */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
        </div>
    );
}
