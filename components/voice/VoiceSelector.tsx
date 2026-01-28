import React from 'react';

// Hardcoded flags mapping for demo (can be expanded)
const getFlag = (accent: string) => {
    if (accent?.includes('Vietnamese') || accent?.includes('Vietnam')) return '🇻🇳';
    if (accent?.includes('American') || accent?.includes('US')) return '🇺🇸';
    if (accent?.includes('British') || accent?.includes('UK')) return '🇬🇧';
    if (accent?.includes('Korean')) return '🇰🇷';
    if (accent?.includes('Japanese')) return '🇯🇵';
    return '🏳️';
};

interface Voice {
    id: string;
    name: string;
    gender: string;
    accent: string;
    description: string;
}

interface VoiceSelectorProps {
    voices: Voice[];
    selectedVoiceId: string;
    onSelect: (id: string) => void;
    clonedVoices: { id: string, name: string }[];
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedVoiceId, onSelect, clonedVoices }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                Character Database
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Cloned Voices */}
                {clonedVoices.map(voice => (
                    <button
                        key={voice.id}
                        onClick={() => onSelect(voice.id)}
                        className={`relative group p-3 rounded-xl border text-left transition-all duration-200 ${selectedVoiceId === voice.id
                            ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                AI
                            </div>
                            <div className={`w-2 h-2 rounded-full ${selectedVoiceId === voice.id ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`}></div>
                        </div>

                        <div className={`font-bold text-sm truncate ${selectedVoiceId === voice.id ? 'text-cyan-400' : 'text-gray-200'}`}>
                            {voice.name}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                            <span className="text-purple-400">CLONED</span> • Personal
                        </div>

                        {/* Selection Ring Animation */}
                        {selectedVoiceId === voice.id && (
                            <div className="absolute inset-0 border-2 border-cyan-500 rounded-xl animate-ping-slow opacity-20 pointer-events-none"></div>
                        )}
                    </button>
                ))}

                {/* Preset Voices */}
                {voices.map(voice => {
                    const isSelected = selectedVoiceId === voice.id;
                    const flag = getFlag(voice.accent);

                    return (
                        <button
                            key={voice.id}
                            onClick={() => onSelect(voice.id)}
                            className={`relative group p-3 rounded-xl border text-left transition-all duration-200 ${isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xl filter drop-shadow-md">{flag}</span>
                                {voice.gender === 'male'
                                    ? <span className="text-blue-400 text-xs bg-blue-400/10 px-1.5 py-0.5 rounded">Male</span>
                                    : <span className="text-pink-400 text-xs bg-pink-400/10 px-1.5 py-0.5 rounded">Fem</span>
                                }
                            </div>

                            <div className={`font-bold text-sm truncate ${isSelected ? 'text-emerald-400' : 'text-gray-200'}`}>
                                {voice.name}
                            </div>

                            <div className="text-[10px] text-gray-500 mt-1 truncate">
                                {voice.description || voice.accent}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default VoiceSelector;
