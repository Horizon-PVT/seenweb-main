import React, { useState, useMemo } from 'react';

interface Voice {
    id: string;
    name: string;
    gender: string;
    type?: 'preset' | 'custom';
    region?: string; // e.g., 'Vietnamese', 'English'
}

interface VoiceGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (voiceId: string) => void;
    currentVoiceId: string;
    presetVoices: Voice[];
    customVoices: Voice[];
    onDeleteCustomVoice?: (id: string) => void;
}

const VoiceGalleryModal: React.FC<VoiceGalleryModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentVoiceId,
    presetVoices,
    customVoices,
    onDeleteCustomVoice
}) => {
    const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
    const [search, setSearch] = useState('');
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const filteredVoices = useMemo(() => {
        const source = activeTab === 'preset' ? presetVoices : customVoices;
        return source.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
    }, [activeTab, presetVoices, customVoices, search]);

    const handlePlayPreview = (voiceId: string) => {
        // Mock preview for now, or use a real URL if available. 
        // Ideally we need a preview URL for each voice.
        // For custom voices, we might need a dedicated preview endpoint or just play their source file if tracking.
        // For now, simple alert or placeholder logic
        if (playingAudio === voiceId) {
            audioRef.current?.pause();
            setPlayingAudio(null);
        } else {
            // Stop previous
            if (audioRef.current) audioRef.current.pause();

            // Start new (Simulator)
            // In real app, we would have preview URLs. 
            // Here just simulating the UI state change for "Playing"
            setPlayingAudio(voiceId);
            // setTimeout(() => setPlayingAudio(null), 3000); 
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#1e1e24] w-full max-w-5xl h-[80vh] rounded-xl flex flex-col shadow-2xl border border-gray-700 text-white overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#25252b]">
                    <h2 className="text-xl font-bold text-white">Chọn một giọng nói</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300">✕</button>
                </div>

                {/* Tabs & Filters */}
                <div className="p-4 border-b border-gray-700 bg-[#2b2b36]">
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setActiveTab('preset')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'preset' ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 text-white/70'}`}
                        >
                            Thư viện chung ({presetVoices.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('custom')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'custom' ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 text-white/70'}`}
                        >
                            Voice của tôi ({customVoices.length})
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                className="w-full bg-[#1e1e24] border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-purple-500 outline-none text-white placeholder-gray-500 transition focus:ring-1 focus:ring-purple-500"
                                placeholder="Tìm theo tên Voice..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {/* Filters placeholders */}
                        <select className="bg-[#1e1e24] border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none text-gray-300">
                            <option>Tất cả giới tính</option>
                            <option>Nam</option>
                            <option>Nữ</option>
                        </select>
                        <select className="bg-[#1e1e24] border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none text-gray-300">
                            <option>Sắp xếp: Mới nhất</option>
                        </select>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#18181d]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredVoices.map(voice => (
                            <div key={voice.id} className={`bg-[#25252b] rounded-xl p-4 border transition hover:border-purple-500 hover:shadow-purple-500/20 ${currentVoiceId === voice.id ? 'border-purple-500 ring-1 ring-purple-500 shadow-purple-500/30' : 'border-gray-700'}`}>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${voice.gender === 'Male' ? 'bg-blue-900/50 text-blue-400' : 'bg-pink-900/50 text-pink-400'}`}>
                                        {voice.gender === 'Male' ? '👨' : '👩'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-gray-100 truncate w-32" title={voice.name}>{voice.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 border border-gray-600">
                                                {voice.gender === 'Female' ? 'Nữ' : 'Nam'}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 border border-gray-600">
                                                {voice.id.includes('VN') ? 'Vietnam' : 'Global'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {voice.type === 'custom' && (
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">Giọng clone cá nhân</p>
                                )}

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <button
                                        onClick={() => handlePlayPreview(voice.id)}
                                        className="py-1.5 rounded-lg bg-[#3a3a45] hover:bg-[#4a4a55] text-xs font-bold text-gray-300 flex items-center justify-center gap-1"
                                    >
                                        {playingAudio === voice.id ? '⏸ Dừng' : '▶ Nghe thử'}
                                    </button>
                                    <button
                                        onClick={() => { onSelect(voice.id); onClose(); }}
                                        className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${currentVoiceId === voice.id ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-purple-600 to-rose-600 hover:shadow-lg hover:scale-105 text-white transition'}`}
                                    >
                                        {currentVoiceId === voice.id ? '✓ Đang chọn' : '✔ Chọn'}
                                    </button>
                                </div>

                                {activeTab === 'custom' && onDeleteCustomVoice && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteCustomVoice(voice.id); }}
                                        className="w-full mt-2 py-1 text-[10px] text-red-500 hover:text-red-400 text-center hover:underline"
                                    >
                                        🗑 Xóa giọng này
                                    </button>
                                )}
                            </div>
                        ))}

                        {filteredVoices.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">
                                Không tìm thấy giọng nào phù hợp
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceGalleryModal;
