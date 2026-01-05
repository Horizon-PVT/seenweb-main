// File: components/TextToSpeechTool.tsx (OpenAI Version)
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TextToSpeechToolProps {
    onBack: () => void;
}

type Voice = {
    name: string;
    apiName: string;
    gender: string;
    description: string;
};

// *** DANH SÁCH GIỌNG ĐỌC OPENAI (Đã phân loại) ***
const voices: Voice[] = [
    // NAM
    { name: "Onyx", apiName: "onyx", gender: "Nam", description: "Trầm ấm, Trưởng thành (Tin tức, Tài liệu)" },
    { name: "Echo", apiName: "echo", gender: "Nam", description: "Vang, Ấm áp (Kể chuyện, Podcast)" },
    { name: "Fable", apiName: "fable", gender: "Nam", description: "Giọng Anh (British), Thanh lịch" },
    // NỮ
    { name: "Alloy", apiName: "alloy", gender: "Nữ", description: "Trung tính, Đa năng (Giọng quốc dân)" },
    { name: "Shimmer", apiName: "shimmer", gender: "Nữ", description: "Rõ ràng, Sắc sảo (Marketing, Sales)" },
    { name: "Nova", apiName: "nova", gender: "Nữ", description: "Năng động, Trẻ trung (Video ngắn, Giải trí)" },
];

// Helper: Decode Audio
const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    // Với WAV header (được backend thêm vào), ta dùng decodeAudioData chuẩn của browser
    // thay vì tự parse Int16Array như PCM raw.
    // Tuy nhiên, nếu backend trả về WAV hợp lệ, ta có thể dùng ctx.decodeAudioData(buffer)
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    return await ctx.decodeAudioData(arrayBuffer as ArrayBuffer);
};

const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));

    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([view], { type: 'audio/wav' });
};

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 text-[#CDAD5A]">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="none" />
                <path d="M50 30 V 70" stroke="currentColor" strokeWidth="4" />
                <path d="M30 50 H 70" stroke="currentColor" strokeWidth="4" />
            </svg>
        </div>
        <p className="mt-4 text-sm font-semibold text-[#008080] tracking-widest animate-pulse">ĐANG TỔNG HỢP (OPENAI)...</p>
    </div>
);

// Helper parseSRT (Giữ nguyên logic)
interface SrtSegment {
    id: string;
    start: string;
    end: string;
    text: string;
}
const parseSRT = (content: string): SrtSegment[] => {
    const segments: SrtSegment[] = [];
    const blocks = content.trim().split(/\n\s*\n/);

    for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length >= 3) {
            const id = lines[0].trim();
            const timeLine = lines[1].trim();
            const text = lines.slice(2).join(' ').trim();

            const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
            if (timeMatch) {
                segments.push({ id, start: timeMatch[1], end: timeMatch[2], text });
            }
        }
    }
    return segments;
};


const TextToSpeechTool: React.FC<TextToSpeechToolProps> = ({ onBack }) => {
    const [mode, setMode] = useState<'text' | 'srt'>('text');
    const [scriptText, setScriptText] = useState('');
    const [srtSegments, setSrtSegments] = useState<SrtSegment[]>([]);

    const [selectedVoiceApiName, setSelectedVoiceApiName] = useState('alloy');
    const [speed, setSpeed] = useState(1);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const scriptTextAreaRef = useRef<HTMLTextAreaElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Init Audio Context
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        return () => {
            audioContextRef.current?.close();
            if (audioSourceRef.current) audioSourceRef.current.stop();
        };
    }, []);

    // File Processing
    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (file.name.endsWith('.srt')) {
                setMode('srt');
                setScriptText(content); // Show raw SRT
                setSrtSegments(parseSRT(content));
            } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                setError("Chưa hỗ trợ file Word. Vui lòng copy nội dung và dán vào ô văn bản.");
            } else {
                setMode('text');
                setScriptText(content);
            }
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
    };

    const handleGenerateSpeech = async () => {
        if (!scriptText || !selectedVoiceApiName) {
            setError("Vui lòng nhập nội dung.");
            return;
        }

        // Re-parse SRT if manually edited
        let finalSegments = srtSegments;
        if (mode === 'srt') {
            finalSegments = parseSRT(scriptText);
        }

        setIsLoading(true);
        setError('');
        setAudioBuffer(null);
        stopAudio();

        try {
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode,
                    scriptText: mode === 'text' ? scriptText : undefined,
                    srtSegments: mode === 'srt' ? finalSegments : undefined,
                    selectedVoiceApiName,
                    speed // Note: Speed này chỉ để client tham khảo, OpenAI API tts-1 cũng có param speed (0.25-4.0), backend có thể implement sau
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            if (result.audioBase64 && audioContextRef.current) {
                const decodedBytes = decode(result.audioBase64);
                // Backend trả về WAV, dùng decodeAudioData chuẩn
                const buffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
                setAudioBuffer(buffer);
            }
        } catch (err: any) {
            setError(`Lỗi: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const playAudio = useCallback(() => {
        if (!audioBuffer || !audioContextRef.current) return;
        if (audioSourceRef.current) audioSourceRef.current.stop();

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = speed;
        source.connect(audioContextRef.current.destination);
        source.start();
        source.onended = () => setIsPlaying(false);
        audioSourceRef.current = source;
        setIsPlaying(true);
    }, [audioBuffer, speed]);

    const stopAudio = useCallback(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const handleDownload = () => {
        if (!audioBuffer) return;
        const wavBlob = bufferToWav(audioBuffer);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seenyt-audio-${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-2 tts-bg relative">
            <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-r from-[#CDAD5A]/50 via-[#006666]/50 to-[#CDAD5A]/50 text-center text-xs font-bold text-black backdrop-blur-sm z-20">
                SỬ DỤNG CÔNG NGHỆ OPENAI TTS (PREMIUM)
            </div>
            <div className="flex justify-between items-center pt-6">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#E0E0E0] tracking-wider">X. LỒNG TIẾNG (OPENAI)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2 z-10">&times; Trở Về</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* LEFT PANEL */}
                <div className="lg:col-span-4 flex flex-col space-y-3 pr-2 overflow-y-auto">

                    {/* --- TRUST BANNER (MỚI) --- */}
                    <div className="bg-[#003333]/80 border border-[#008080]/50 p-3 rounded-sm flex gap-3 items-start shadow-lg backdrop-blur-md">
                        <div className="text-2xl pt-1">🌍</div>
                        <div>
                            <h3 className="text-[#CDAD5A] font-bold text-xs uppercase tracking-wide">Hỗ trợ đa ngôn ngữ tự động</h3>
                            <p className="text-[10px] text-gray-300 leading-tight mt-1">
                                Hệ thống tự động nhận diện và đọc chuẩn giọng bản xứ cho <strong>hơn 50 ngôn ngữ</strong> (Anh, Nhật, Hàn, Pháp...).
                                Chỉ cần nhập văn bản, AI sẽ xử lý ngữ điệu tự nhiên nhất. Tự động xử lý SRT chuẩn xác đến từng giây,từng điểm ngắt nghỉ, từng hơi thở .
                            </p>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex bg-black/30 p-1 rounded-sm border border-gray-700">
                        <button onClick={() => setMode('text')} className={`flex-1 py-2 text-xs font-bold transition-all ${mode === 'text' ? 'bg-[#CDAD5A] text-black' : 'text-gray-400 hover:text-white'}`}>VĂN BẢN (TEXT)</button>
                        <button onClick={() => setMode('srt')} className={`flex-1 py-2 text-xs font-bold transition-all ${mode === 'srt' ? 'bg-[#CDAD5A] text-black' : 'text-gray-400 hover:text-white'}`}>FILE PHỤ ĐỀ (SRT)</button>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair flex justify-between">
                            NỘI DUNG
                            <label className="cursor-pointer text-xs text-[#008080] hover:underline">
                                📂 Dán hoặc Tải file
                                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} accept=".txt,.md,.srt" />
                            </label>
                        </label>
                        <textarea
                            ref={scriptTextAreaRef}
                            value={scriptText}
                            onChange={e => setScriptText(e.target.value)}
                            onDrop={handleDrop}
                            placeholder={mode === 'text' ? "Nhập văn bản (Tiếng Việt, Anh, Nhật... tùy ý)..." : "Nội dung file SRT..."}
                            className="w-full h-48 obsidian-textarea focus:border-[#CDAD5A] bronze font-mono text-xs leading-relaxed"
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#008080] font-playfair">CHỌN CHÂN DUNG GIỌNG NÓI</label>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                            <select value={selectedVoiceApiName} onChange={e => setSelectedVoiceApiName(e.target.value)} className="w-full obsidian-select py-2">
                                <optgroup label="--- GIỌNG NAM (MALE) ---">
                                    {voices.filter(v => v.gender === 'Nam').map(voice => (
                                        <option key={voice.apiName} value={voice.apiName}>
                                            ♂️ {voice.name} - {voice.description}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="--- GIỌNG NỮ (FEMALE) ---">
                                    {voices.filter(v => v.gender === 'Nữ').map(voice => (
                                        <option key={voice.apiName} value={voice.apiName}>
                                            ♀️ {voice.name} - {voice.description}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                        <p className="text-[10px] text-gray-400 italic text-center">* Giọng đọc sẽ tự điều chỉnh theo ngôn ngữ bạn nhập.</p>
                    </div>

                    <button ref={buttonRef} onClick={handleGenerateSpeech} disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow-strong disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? "ĐANG CLIP..." : "TẠO GIỌNG NÓI NGAY"}
                    </button>
                </div>

                {/* RIGHT PANEL (Preview) */}
                <div className="lg:col-span-6 flex flex-col space-y-3 min-h-0">
                    <div className="h-48 flex items-center justify-center bg-black/30 border border-gray-700/50 rounded-sm overflow-hidden relative">
                        {isLoading ? <Loader /> : (
                            <div className="w-32 h-32 text-[#CDAD5A] relative">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    <rect x="40" y="20" width="20" height="40" rx="10" fill="currentColor" className="transition-all" style={{ filter: `drop-shadow(0 0 ${isPlaying ? '15px' : '5px'} #CDAD5A)` }} />
                                    <path d="M50 60 V 80 H 45 V 90 H 55 V 80 H 50" stroke="currentColor" strokeWidth="2" fill="none" />
                                    {isPlaying && (
                                        <>
                                            <circle cx="50" cy="40" r="15" stroke="#008080" strokeWidth="1" fill="none" className="animate-ping" style={{ animationDuration: '2s' }} />
                                        </>
                                    )}
                                </svg>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-center text-xs bg-red-900/20 p-2 rounded">{error}</p>}

                    {audioBuffer && (
                        <div className="p-4 bg-black/40 border border-[#008080]/30 rounded-sm flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <button onClick={isPlaying ? stopAudio : playAudio} className="w-12 h-12 flex items-center justify-center rounded-full bg-[#CDAD5A] text-black hover:scale-105 transition-transform">
                                {isPlaying ? '■' : '▶'}
                            </button>
                            <div className="flex-1">
                                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full bg-[#008080] ${isPlaying ? 'animate-progress' : 'w-0'}`} style={{ animationDuration: `${audioBuffer.duration}s` }}></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>0:00</span>
                                    <span>{audioBuffer.duration.toFixed(1)}s</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-grow"></div>

                    <div className="flex items-center gap-4 pt-2">
                        <button onClick={handleDownload} disabled={!audioBuffer} className="flex-grow bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all hover:bg-transparent hover:text-[#008080] disabled:opacity-50">
                            TẢI XUỐNG (.WAV)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextToSpeechTool;