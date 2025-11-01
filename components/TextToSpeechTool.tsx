// File: components/TextToSpeechTool.tsx (Hoàn Chỉnh - Đã sửa gọi Backend và thêm 11 ngôn ngữ)

import React, { useState, useRef, useEffect, useCallback } from 'react';
// Xóa: import { GoogleGenAI, Modality } from "@google/genai"; // - Không cần nữa
import { MicrophoneIcon } from './AnimatedIcons'; // - Giả sử bạn có file này

interface TextToSpeechToolProps {
  onBack: () => void; //
}

// --- Giữ nguyên tất cả các hằng số và kiểu dữ liệu ---
type Voice = { //
    name: string;
    apiName: string;
    language: string;
    gender: string;
};

// *** DANH SÁCH 11 NGÔN NGỮ ĐẦY ĐỦ ***
const voices: Voice[] = [ //
    // Vietnamese
    { name: "Tiếng Việt - Nữ (Kore, Rõ ràng)", apiName: "Kore", language: "Tiếng Việt", gender: "Nữ" },
    { name: "Tiếng Việt - Nữ (Zephyr, Ấm áp)", apiName: "Zephyr", language: "Tiếng Việt", gender: "Nữ" },
    { name: "Tiếng Việt - Nam (Puck, Năng động)", apiName: "Puck", language: "Tiếng Việt", gender: "Nam" },
    { name: "Tiếng Việt - Nam (Charon, Trầm ấm)", apiName: "Charon", language: "Tiếng Việt", gender: "Nam" },
    { name: "Tiếng Việt - Nam (Fenrir, Kể chuyện)", apiName: "Fenrir", language: "Tiếng Việt", gender: "Nam" },
    // English (US)
    { name: "English (US) - Female (Zephyr)", apiName: "Zephyr", language: "English (US)", gender: "Nữ" },
    { name: "English (US) - Male (Puck)", apiName: "Puck", language: "English (US)", gender: "Nam" },
    // Spanish
    { name: "Español - Femenino (Kore)", apiName: "Kore", language: "Español", gender: "Nữ" },
    { name: "Español - Masculino (Charon)", apiName: "Charon", language: "Español", gender: "Nam" },
    // French
    { name: "Français - Féminin (Kore)", apiName: "Kore", language: "Français", gender: "Nữ" },
    { name: "Français - Masculin (Puck)", apiName: "Puck", language: "Français", gender: "Nam" },
    // German
    { name: "Deutsch - Weiblich (Kore)", apiName: "Kore", language: "Deutsch", gender: "Nữ" },
    { name: "Deutsch - Männlich (Puck)", apiName: "Puck", language: "Deutsch", gender: "Nam" },
    // Japanese
    { name: "日本語 - 女性 (Kore)", apiName: "Kore", language: "日本語", gender: "Nữ" },
    { name: "日本語 - 男性 (Puck)", apiName: "Puck", language: "日本語", gender: "Nam" },
    // Korean
    { name: "한국어 - 여성 (Kore)", apiName: "Kore", language: "한국어", gender: "Nữ" },
    { name: "한국어 - 남성 (Puck)", apiName: "Puck", language: "한국어", gender: "Nam" },
    // Portuguese (Brazil)
    { name: "Português (BR) - Feminino (Kore)", apiName: "Kore", language: "Português (BR)", gender: "Nữ" },
    { name: "Português (BR) - Masculino (Puck)", apiName: "Puck", language: "Português (BR)", gender: "Nam" },
    // Russian
    { name: "Русский - Женский (Kore)", apiName: "Kore", language: "Русский", gender: "Nữ" },
    { name: "Русский - Мужской (Charon)", apiName: "Charon", language: "Русский", gender: "Nam" },
    // Chinese (Mandarin)
    { name: "中文 (普通话) - 女 (Kore)", apiName: "Kore", language: "中文 (普通话)", gender: "Nữ" },
    { name: "中文 (普通话) - 男 (Puck)", apiName: "Puck", language: "中文 (普通话)", gender: "Nam" },
     // Italian
    { name: "Italiano - Femminile (Kore)", apiName: "Kore", language: "Italiano", gender: "Nữ" },
    { name: "Italiano - Maschile (Puck)", apiName: "Puck", language: "Italiano", gender: "Nam" }, //
];

// Tự động tạo danh sách ngôn ngữ từ 'voices'
const languages = [...new Set(voices.map(v => v.language))]; //


// --- Giữ nguyên tất cả các hàm xử lý âm thanh phía Client ---
const decode = (base64: string) => { //
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}; //

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => { //
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}; //

const bufferToWav = (buffer: AudioBuffer): Blob => { //
    // ... (toàn bộ nội dung hàm bufferToWav) ...
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
}; //


// Giữ nguyên Loader
const Loader: React.FC = () => ( //
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 text-[#CDAD5A]">
            {/* Sử dụng MicrophoneIcon nếu có */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="40" y="20" width="20" height="40" rx="10" fill="currentColor" />
                <path d="M50 60 V 80 H 45 V 90 H 55 V 80 H 50" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
        </div>
        <p className="mt-4 text-sm font-semibold text-[#008080] tracking-widest animate-pulse">ĐANG TỔNG HỢP ÂM THANH...</p>
    </div>
); //


// Bắt đầu Component
const TextToSpeechTool: React.FC<TextToSpeechToolProps> = ({ onBack }) => { //
    // --- Các state giữ nguyên ---
    const [scriptText, setScriptText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt'); //
    const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
    const [selectedVoiceApiName, setSelectedVoiceApiName] = useState('');
    
    const [speed, setSpeed] = useState(1); //
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null); //
    const [isPlaying, setIsPlaying] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const scriptTextAreaRef = useRef<HTMLTextAreaElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null); //

    // --- Các useEffect, useCallback giữ nguyên ---
    useEffect(() => { //
        // Đảm bảo AudioContext được tạo ở 24000Hz
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        return () => {
             audioContextRef.current?.close();
             if (audioSourceRef.current) {
                audioSourceRef.current.stop();
             }
        };
    }, []);

    useEffect(() => { //
        const newAvailableVoices = voices.filter(v => v.language === selectedLanguage);
        setAvailableVoices(newAvailableVoices);
        if (newAvailableVoices.length > 0) {
            setSelectedVoiceApiName(newAvailableVoices[0].apiName);
        } else {
            setSelectedVoiceApiName('');
        }
    }, [selectedLanguage]); //

    const playAudio = useCallback(() => { //
        if (!audioBuffer || !audioContextRef.current) return;
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = speed;
        source.connect(audioContextRef.current.destination);
        source.start();
        source.onended = () => setIsPlaying(false);
        audioSourceRef.current = source;
        setIsPlaying(true);
    }, [audioBuffer, speed]); //
    
    const stopAudio = useCallback(() => { //
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        setIsPlaying(false);
    }, []); //
    
    const insertTag = (tagStart: string, tagEnd: string = '') => { //
        const textarea = scriptTextAreaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = scriptText.substring(start, end);
        const newText = `${scriptText.substring(0, start)}${tagStart}${selectedText}${tagEnd}${scriptText.substring(end)}`;
        setScriptText(newText);
        textarea.focus();
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + tagStart.length + selectedText.length;
        }, 0);
    }; //

    // --- HÀM handleGenerateSpeech MỚI (Gọi Backend /api/text-to-speech) ---
    const handleGenerateSpeech = async () => { //
        if (!scriptText || !selectedVoiceApiName) {
            setError("Vui lòng nhập kịch bản và chọn một giọng nói.");
            return; //
        }
        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);
        
        setIsLoading(true);
        setError('');
        setAudioBuffer(null);
        stopAudio(); //

        // Xóa logic prompt và gọi AI
        // const prompt = ...
        // const ai = new GoogleGenAI(...)

        try {
            // Gọi backend /api/text-to-speech
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scriptText: scriptText, // Gửi text gốc (backend sẽ xử lý tag)
                    selectedVoiceApiName: selectedVoiceApiName,
                }),
            });

            const result: any = await response.json(); // Backend trả { audioBase64: "..." }

            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${response.status}`);
            }

            const base64Audio = result.audioBase64;
            if (base64Audio && audioContextRef.current) {
                const decodedBytes = decode(base64Audio); // Dùng lại hàm decode
                // Dùng lại hàm decodeAudioData
                // Cần đảm bảo sampleRate là 24000
                const buffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1); 
                setAudioBuffer(buffer);
            } else {
                throw new Error("API không trả về dữ liệu âm thanh."); //
            }
        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể tổng hợp âm thanh."}`); //
        } finally {
            setIsLoading(false); //
        }
    };
    
    // --- Hàm handleDownload giữ nguyên ---
    const handleDownload = () => { //
        if (!audioBuffer) return;
        const wavBlob = bufferToWav(audioBuffer); // Dùng lại hàm bufferToWav
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'seenvt-voiceover.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }; //
    

    // --- Phần JSX return giữ nguyên ---
    // (Giống hệt file gốc)
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-2 tts-bg relative">
             <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-r from-[#CDAD5A]/50 via-[#006666]/50 to-[#CDAD5A]/50 text-center text-xs font-bold text-black backdrop-blur-sm z-20">
              SẢN XUẤT CHUYÊN NGHIỆP YÊU CẦU GÓI MAGISTRATE VÀ TOÀN TRI.
            </div>
            <div className="flex justify-between items-center pt-6">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#E0E0E0] tracking-wider">X. LỒNG TIẾNG TỰ ĐỘNG (VOICE STUDIO)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2 z-10">&times; Trở Về</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                <div className="lg:col-span-4 flex flex-col space-y-3 pr-2 overflow-y-auto">
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">TÀI LIỆU LỒNG TIẾNG</label>
                        <textarea ref={scriptTextAreaRef} value={scriptText} onChange={e => setScriptText(e.target.value)} placeholder="Dán văn bản hoặc Kéo thả file..." className="w-full h-32 obsidian-textarea focus:border-[#CDAD5A] bronze"></textarea>
                        <button onClick={() => alert("Chức năng đang phát triển")} className="text-xs mt-1 text-gray-300 hover:text-white">NHẬP TỪ CÔNG CỤ VIẾT KỊCH BẢN</button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#008080] font-playfair">LỌC CHÂN DUNG GIỌNG NÓI</label>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                             <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="w-full obsidian-select">
                                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                             </select>
                             <select value={selectedVoiceApiName} onChange={e => setSelectedVoiceApiName(e.target.value)} className="w-full obsidian-select">
                                {availableVoices.length > 0 ? (
                                    availableVoices.map(voice => <option key={voice.apiName} value={voice.apiName}>{voice.name}</option>)
                                 ) : (
                                    <option value="">-- Chọn ngôn ngữ --</option>
                                 )}
                             </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">ĐIỀU CHỈNH TINH VI</label>
                        <div>
                           <label className="text-xs text-gray-300">Tốc độ Đọc: {speed.toFixed(2)}x</label>
                           <input type="range" min="0.75" max="1.25" step="0.01" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full obsidian-slider tts-slider" />
                        </div>
                    </div>
                     <button ref={buttonRef} onClick={handleGenerateSpeech} disabled={isLoading || !selectedVoiceApiName} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow-strong disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? "ĐANG TỔNG HỢP..." : "TỔNG HỢP ÂM THANH"}
                    </button>
                </div>

                <div className="lg:col-span-6 flex flex-col space-y-3 min-h-0">
                    <div className="h-48 flex items-center justify-center bg-black/30 border border-gray-700/50 rounded-sm overflow-hidden">
                        <div className="w-32 h-32 text-[#CDAD5A] relative">
                            {/* Thay thế SVG Icon nếu cần */}
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                <rect x="40" y="20" width="20" height="40" rx="10" fill="currentColor" className="transition-all" style={{ filter: `drop-shadow(0 0 ${isPlaying ? '15px' : '5px'} #CDAD5A)`}} />
                                <path d="M50 60 V 80 H 45 V 90 H 55 V 80 H 50" stroke="currentColor" strokeWidth="2" fill="none" />
                                {isPlaying && (
                                    <>
                                    <circle cx="50" cy="40" r="10" stroke="#008080" strokeWidth="2" fill="none" className="animate-sound-wave" style={{ animationDelay: '0s' }} />
                                    <circle cx="50" cy="40" r="10" stroke="#008080" strokeWidth="1.5" fill="none" className="animate-sound-wave" style={{ animationDelay: '0.5s' }} />
                                    <circle cx="50" cy="40" r="10" stroke="#008080" strokeWidth="1" fill="none" className="animate-sound-wave" style={{ animationDelay: '1s' }} />
                                    </>
                                )}
                            </svg>
                        </div>
                    </div>
                    {isLoading && <Loader />}
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}

                    {audioBuffer && (
                        <div className="p-2 bg-black/30 border border-gray-700/50 rounded-sm flex items-center gap-4">
                           <button onClick={isPlaying ? stopAudio : playAudio} className="text-3xl text-[#008080] hover:text-[#00ffc8]">
                               {isPlaying ? '■' : '▶'}
                           </button>
                           <p className="text-xs text-gray-300">Độ dài: {audioBuffer.duration.toFixed(2)}s</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#008080] font-playfair">HIỆU CHỈNH TRỌNG ÂM</label>
                        <div className="flex gap-2">
                            <button onClick={() => insertTag('[pause=500ms]')} className="text-xs flex-1 p-2 bg-black/50 border border-gray-700 hover:border-[#CDAD5A] transition-colors rounded-sm">Chèn Ngắt quãng</button>
                            <button onClick={() => insertTag('<emphasis>', '</emphasis>')} className="text-xs flex-1 p-2 bg-black/50 border border-gray-700 hover:border-[#CDAD5A] transition-colors rounded-sm">Chèn Nhấn mạnh</button>
                        </div>
                    </div>

                    <div className="flex-grow"></div>

                    <div className="flex items-center gap-4 pt-2">
                        <button onClick={handleDownload} disabled={!audioBuffer} className="flex-grow bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all hover:bg-transparent hover:text-[#008080] disabled:opacity-50">TẢI XUỐNG (WAV)</button>
                        <button onClick={() => alert("Chức năng đang phát triển")} disabled={!audioBuffer} className="flex-grow bg-transparent text-[#CDAD5A] font-bold py-3 px-5 border-2 border-[#CDAD5A] rounded-sm transition-all hover:bg-[#CDAD5A] hover:text-black disabled:opacity-50">LƯU VÀO ARCHIVE LOG</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextToSpeechTool;