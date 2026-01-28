import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tool } from '../ToolsGrid';

interface GlassCardProps {
    tool: Tool;
    isLocked: boolean;
    onOpen: () => void;
    index: number;
    showExclusiveBadge?: boolean;
    t: any;
}

const GlassCard: React.FC<GlassCardProps> = ({ tool, isLocked, onOpen, index, showExclusiveBadge = false, t }) => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative flex flex-col h-[280px] rounded-2xl overflow-hidden cursor-pointer backdrop-blur-md transition-all duration-300 ${tool.isComingSoon ? 'opacity-60 grayscale pointer-events-none' : ''
                }`}
            style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: isHovered ? `0 0 25px -5px ${glowColor}, inset 0 0 10px rgba(255,255,255,0.1)` : '0 10px 30px -10px rgba(0,0,0,0.5)',
                transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'none'
            }}
        >
            {/* TOP: VISUAL AREA */}
            <div className="relative h-32 w-full overflow-hidden">
                {/* Background Gradient/Image */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.thumbColor || 'from-gray-700 to-gray-900'} opacity-80 mix-blend-overlay`}></div>

                {tool.imageSrc ? (
                    <img
                        src={tool.imageSrc}
                        alt={toolName}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-12 h-12 text-white/50 group-hover:text-white transition-colors duration-300" />
                    </div>
                )}

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {tool.isHot && <span className="text-[10px] font-black bg-red-600/90 text-white px-2 py-0.5 rounded backdrop-blur-md shadow-lg border border-red-400/30">HOT</span>}
                    {tool.isNew && <span className="text-[10px] font-black bg-blue-600/90 text-white px-2 py-0.5 rounded backdrop-blur-md shadow-lg border border-blue-400/30">NEW</span>}
                    {tool.isExclusive && <span className="text-[10px] font-black bg-purple-600/90 text-white px-2 py-0.5 rounded backdrop-blur-md shadow-lg border border-purple-400/30">VIP</span>}
                </div>

                {/* Lock Overlay */}
                {isLocked && !tool.isComingSoon && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity group-hover:bg-black/40">
                        <div className="bg-black/50 p-2 rounded-full border border-white/20 shadow-xl">
                            <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                    </div>
                )}

                {/* Coming Soon Overlay */}
                {tool.isComingSoon && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
                        <span className="text-xs font-bold text-yellow-500 border border-yellow-500/50 px-2 py-1 rounded bg-black/50 uppercase tracking-widest">Dev Mode</span>
                    </div>
                )}
            </div>

            {/* BOTTOM: INFO AREA */}
            <div className="flex-1 p-4 flex flex-col justify-between relative bg-gradient-to-b from-transparent to-black/40">
                <div>
                    <h3 className="text-base font-bold text-white mb-1 leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {toolName}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                        {toolShortDesc}
                    </p>
                </div>

                {/* Action Hint */}
                <div className={`mt-3 flex items-center text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${isHovered ? 'text-cyan-400 translate-x-1' : 'text-gray-600'}`}>
                    {isLocked ? 'Unlock Access ->' : 'Launch Tool ->'}
                </div>
            </div>

            {/* Hover Border Gradient */}
            <div className={`absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 pointer-events-none ${isHovered ? 'border-cyan-500/30' : ''}`}></div>
        </motion.div>
    );
};

export default GlassCard;
