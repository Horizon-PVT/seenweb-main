import React, { useState, useRef } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
export default function VirtualMCTool() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation('common');
    const isEN = router.locale === 'en';

    const userRole = (session?.user as any)?.role || "FREE";
    const isPro = userRole === 'SUPER' || userRole === 'ADMIN';

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>(''); // starting, processing, succeeded, failed
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
    });

    const handleGenerate = async () => {
        if (!imageFile || !audioFile) {
            alert("Vui lòng chọn đủ Ảnh Idol và File Âm thanh!");
            return;
        }

        setLoading(true);
        setStatus("đang tải file lên...");
        setVideoUrl(null);

        try {
            // 1. Convert files to Base64/DataURI (Replicate accepts this directly for small files)
            const imageData = await fileToDataUri(imageFile);
            const audioData = await fileToDataUri(audioFile);

            setStatus("đang gửi yêu cầu...");

            // 2. Call API Create
            const res = await fetch('/api/virtual-mc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: imageData,
                    audioUrl: audioData
                })
            });

            // Track Tool Start
            // We can fire and forget
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'tool_start',
                    anonId: document.cookie.split('; ').find(row => row.startsWith('seen_anon_id='))?.split('=')[1], // Simple parse or just let backend handle if authenticated
                    properties: { tool: 'VirtualMC' }
                })
            }).catch(() => { });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Lỗi khởi tạo");

            const predictionId = data.id;
            setStatus("đang xử lý AI...");

            // 3. Poll for status
            const interval = setInterval(async () => {
                const checkRes = await fetch(`/api/virtual-mc?id=${predictionId}`);
                const checkData = await checkRes.json();

                if (checkData.status === "succeeded") {
                    clearInterval(interval);
                    setVideoUrl(checkData.output);
                    setLoading(false);
                    setStatus("hoàn tất");
                } else if (checkData.status === "failed" || checkData.status === "canceled") {
                    clearInterval(interval);
                    setLoading(false);
                    const errorMsg = checkData.error || (checkData.logs ? "Lỗi từ Replicate: " + checkData.logs.slice(-200) : "Không xác định");
                    setStatus(`Thất bại: ${checkData.status}`);
                    alert(`Tạo video thất bại! ${errorMsg}`);
                    console.error("Full Logs:", checkData.logs);
                } else {
                    setStatus(`đang xử lý... (${checkData.status})`);
                }
            }, 3000); // Check every 3s

        } catch (error: any) {
            console.error(error);
            alert(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="relative bg-black/40 backdrop-blur-md border border-[#008080]/30 rounded-lg p-6 max-w-4xl mx-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-[#CDAD5A] font-playfair mb-6 text-center tracking-widest uppercase border-b border-[#008080]/30 pb-4">
                {isEN ? 'AI Virtual Idol' : 'Siêu Tiên Nữ - Virtual Idol'}
            </h2>

            {/* PRO LOCK OVERLAY */}
            {!isPro && (
                <div className="absolute inset-0 z-50 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center rounded-lg p-6 text-center">
                    <div className="bg-black/80 border border-[#CDAD5A] p-8 rounded-2xl shadow-[0_0_50px_rgba(205,173,90,0.4)] max-w-md">
                        <div className="text-6xl mb-4">💎</div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase">Tính năng PRO</h3>
                        <p className="text-gray-400 mb-6">
                            Công nghệ tạo Idol AI sống động chỉ dành riêng cho thành viên gói
                            <span className="text-[#CDAD5A] font-bold"> SUPER (PRO)</span>.
                        </p>
                        <Link href="/pricing" className="block w-full bg-gradient-to-r from-[#CDAD5A] to-yellow-600 text-black font-black text-lg py-4 rounded-xl hover:scale-105 transition-transform">
                            🚀 NÂNG CẤP NGAY
                        </Link>
                        <p className="text-xs text-gray-500 mt-4">
                            Mở khóa không giới hạn Virtual MC + Tất cả tools khác.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT: INPUTS */}
                <div className="space-y-6">
                    {/* Image Upload */}
                    <div className="group relative">
                        <label className="block text-[#008080] font-bold text-xs uppercase mb-2">{isEN ? '1. Idol Portrait (Static Image)' : '1. Chân dung Idol (Ảnh tĩnh)'}</label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:border-[#CDAD5A] transition-all bg-black/20 overflow-hidden relative">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <span className="text-4xl block mb-2">👤</span>
                                    <span className="text-xs">{isEN ? 'Click to select image' : 'Bấm để chọn ảnh'}</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setImageFile(e.target.files[0]);
                                        setImagePreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Audio Upload */}
                    <div>
                        <label className="block text-[#008080] font-bold text-xs uppercase mb-2">{isEN ? '2. Voice (Audio File/TTS)' : '2. Giọng nói (File âm thanh/TTS)'}</label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => e.target.files?.[0] && setAudioFile(e.target.files[0])}
                            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#003333] file:text-[#CDAD5A] hover:file:bg-[#004d4d]"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 italic">{isEN ? '* Tip: Use "Text to Speech" tool to create high-quality audio first.' : '* Mẹo: Dùng tab "Chuyển văn bản thành giọng nói của SeenYt" để tạo file âm thanh tốt, chuẩn nhất trước,sau đó hãy đưa file âm thanh đó vào .'}</p>
                    </div>

                    {/* TIPS BANNER */}
                    <div className="bg-[#CDAD5A]/10 border border-[#CDAD5A]/30 p-4 rounded-lg flex gap-3 shadow-lg animate-pulse-slow">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="text-[#CDAD5A] font-bold text-xs uppercase tracking-wide mb-1">{isEN ? 'OPTIMIZATION TIPS' : 'MẸO TỐI ƯU KẾT QUẢ'}</h3>
                            <ul className="text-[10px] text-gray-300 space-y-1 list-disc list-inside">
                                <li><strong>{isEN ? 'Image:' : 'Ảnh:'}</strong> {isEN ? 'Use close-up portrait, 16:9 or square. Avoid full body.' : 'Nên dùng ảnh chân dung cận mặt (Close-up), tỉ lệ 16:9 hoặc vuông. Hạn chế ảnh toàn thân.'}</li>
                                <li><strong>{isEN ? 'Audio:' : 'Âm thanh:'}</strong> {isEN ? 'Best under 1-2 minutes for fast processing.' : 'Tốt nhất dưới 1-2 phút để xử lý nhanh (tránh lỗi timeout).'}</li>
                                <li><strong>{isEN ? 'Head Motion:' : 'Head Motion:'}</strong> {isEN ? 'AI will animate head movement automatically.' : 'AI sẽ tự động cử động đầu cho tự nhiên hơn (không chỉ nhép môi).'}</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !imageFile || !audioFile}
                        className="w-full bg-gradient-to-r from-[#008080] to-[#005555] text-white font-bold py-4 rounded-sm shadow-[0_0_15px_rgba(0,128,128,0.5)] hover:shadow-[0_0_25px_rgba(205,173,90,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? `🔮 ${status.toUpperCase()}` : "⚡ TẠO VIDEO IDOL NGAY"}
                    </button>
                </div>

                {/* RIGHT: OUTPUT */}
                <div className="flex flex-col items-center justify-center border border-gray-800 rounded-lg bg-black/50 min-h-[400px] relative p-4">
                    {videoUrl ? (
                        <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                            <video
                                key={videoUrl}
                                src={videoUrl}
                                controls
                                autoPlay
                                loop
                                playsInline
                                className="w-full h-auto rounded-lg shadow-2xl border border-[#CDAD5A]/30"
                                style={{ minHeight: '300px' }}
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(videoUrl);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.style.display = 'none';
                                        a.href = url;
                                        a.download = `idol-video-${Date.now()}.mp4`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    } catch (err) {
                                        console.error("Download failed:", err);
                                        window.open(videoUrl, '_blank');
                                    }
                                }}
                                className="block w-full text-center mt-4 bg-[#CDAD5A] text-black py-2 rounded font-bold hover:bg-[#d9b964] transition-colors text-xs uppercase"
                            >
                                ⬇️ TẢI VIDEO VỀ MÁY
                            </button>
                        </div>
                    ) : (
                        <div className="text-gray-600 text-center animate-pulse">
                            <div className="text-6xl mb-4">🎬</div>
                            <p className="text-sm font-mono">KẾT QUẢ SẼ HIỆN Ở ĐÂY</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
