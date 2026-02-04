import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tool } from '../ToolsGrid';

export type ViewMode = 'grid' | 'list';

interface GlassCardProps {
    tool: Tool;
    isLocked: boolean;
    onOpen: () => void;
    index: number;
    showExclusiveBadge?: boolean;
    t: any;
    viewMode?: ViewMode;
}

const GlassCard: React.FC<GlassCardProps> = ({ tool, isLocked, onOpen, index, showExclusiveBadge = false, t, viewMode = 'grid' }) => {
    const Icon = tool.icon;
    const [isHovered, setIsHovered] = useState(false);

    // Get translated content
    const toolName = t(`tools.${tool.id}.name`, tool.name);
    const toolShortDesc = t(`tools.${tool.id}.short`, tool.shortDescription);

    const handleClick = () => {
        if (tool.isComingSoon) return;
        onOpen();
    };

    // Determine glow color based on tool state
    const glowColor = tool.isHot ? 'rgba(239, 68, 68, 0.5)' : // Red
        tool.isExclusive ? 'rgba(217, 70, 239, 0.5)' : // Fuchsia
            tool.isNew ? 'rgba(59, 130, 246, 0.5)' : // Blue
                'rgba(6, 182, 212, 0.5)'; // Cyan (Default)

    // LIST VIEW - Horizontal compact layout
    if (viewMode === 'list') {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`group relative flex items-center h-[72px] rounded-xl overflow-hidden cursor-pointer backdrop-blur-md transition-all duration-300 ${tool.isComingSoon ? 'opacity-60 grayscale pointer-events-none' : ''}`}
                style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: isHovered ? `0 0 15px -5px ${glowColor}` : 'none',
                    transform: isHovered ? 'translateX(4px)' : 'none'
                }}
            >
                {/* Left: Small Thumbnail */}
                <div className="relative w-20 h-full shrink-0 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.thumbColor || 'from-gray-700 to-gray-900'} opacity-80`}></div>
                    {tool.imageSrc ? (
                        <img src={tool.imageSrc} alt={toolName} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white/60" />
                        </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-1 left-1 flex gap-0.5">
                        {tool.isHot && <span className="text-[8px] font-black bg-red-600/90 text-white px-1.5 py-0.5 rounded">HOT</span>}
                        {tool.isExclusive && <span className="text-[8px] font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded">VIP</span>}
                    </div>
                    {/* Lock */}
                    {isLocked && !tool.isComingSoon && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                    )}
                </div>

                {/* Center: Info */}
                <div className="flex-1 px-4 py-2 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                        {toolName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{toolShortDesc}</p>
                </div>

                {/* Right: Arrow */}
                <div className={`pr-4 text-gray-600 group-hover:text-cyan-400 transition-all ${isHovered ? 'translate-x-1' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </motion.div>
        );
    }

    // GRID VIEW - Compact cards (NEW: 180px height instead of 280px)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative flex flex-col h-[180px] rounded-xl overflow-hidden cursor-pointer backdrop-blur-md transition-all duration-300 ${tool.isComingSoon ? 'opacity-60 grayscale pointer-events-none' : ''}`}
            style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: isHovered ? `0 0 20px -5px ${glowColor}, inset 0 0 8px rgba(255,255,255,0.05)` : '0 8px 20px -8px rgba(0,0,0,0.4)',
                transform: isHovered ? 'translateY(-3px) scale(1.01)' : 'none'
            }}
        >
            {/* TOP: COMPACT VISUAL AREA (80px instead of 128px) */}
            <div className="relative h-20 w-full overflow-hidden shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.thumbColor || 'from-gray-700 to-gray-900'} opacity-80 mix-blend-overlay`}></div>

                {tool.imageSrc ? (
                    <img
                        src={tool.imageSrc}
                        alt={toolName}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white/50 group-hover:text-white transition-colors duration-300" />
                    </div>
                )}

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 pointer-events-none"></div>

                {/* Badges - Compact */}
                <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                    {tool.isHot && <span className="text-[9px] font-black bg-red-600/90 text-white px-1.5 py-0.5 rounded backdrop-blur-md shadow border border-red-400/30">HOT</span>}
                    {tool.isExclusive && <span className="text-[9px] font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded backdrop-blur-md shadow border border-purple-400/30">VIP</span>}
                    {tool.isComingSoon && <span className="text-[9px] font-black bg-amber-600/90 text-black px-1.5 py-0.5 rounded backdrop-blur-md shadow border border-amber-400/30">BETA</span>}
                </div>

                {/* Lock Overlay */}
                {isLocked && !tool.isComingSoon && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity group-hover:bg-black/40">
                        <div className="bg-black/50 p-1.5 rounded-full border border-white/20 shadow">
                            <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                    </div>
                )}

                {/* Coming Soon Overlay */}
                {tool.isComingSoon && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
                        <span className="text-[10px] font-bold text-yellow-500 border border-yellow-500/50 px-1.5 py-0.5 rounded bg-black/50 uppercase tracking-wide">Beta</span>
                    </div>
                )}
            </div>

            {/* BOTTOM: COMPACT INFO AREA */}
            <div className="flex-1 p-3 flex flex-col justify-between relative bg-gradient-to-b from-transparent to-black/30">
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white mb-0.5 leading-tight group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {toolName}
                    </h3>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-snug">
                        {toolShortDesc}
                    </p>
                </div>

                {/* Action Hint - Smaller */}
                <div className={`flex items-center text-[9px] font-mono uppercase tracking-wide transition-all duration-300 ${isHovered ? 'text-cyan-400 translate-x-0.5' : 'text-gray-600'}`}>
                    {isLocked ? 'Unlock →' : 'Launch →'}
                </div>
            </div>

            {/* Hover Border */}
            <div className={`absolute inset-0 rounded-xl border border-transparent transition-all duration-300 pointer-events-none ${isHovered ? 'border-cyan-500/30' : ''}`}></div>
        </motion.div>
    );
};

export default GlassCard;
