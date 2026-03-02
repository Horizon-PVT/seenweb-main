import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Calendar, Clock, Video, ChevronRight, User, Phone, Mail, Send, Target, EyeOff, XCircle, Rocket, Play, CheckCircle2, Users, Key, MonitorPlay, Infinity, Frown, ShieldAlert, XOctagon, X } from 'lucide-react';

const DUMMY_NAMES = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D', 'Vũ Đức E', 'Bùi Ngọc F'];

function useFomoPopup() {
    const [popup, setPopup] = useState<{ id: number, message: string } | null>(null);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const triggerPopup = () => {
            const isVip = Math.random() > 0.5;
            const name = DUMMY_NAMES[Math.floor(Math.random() * DUMMY_NAMES.length)];
            const message = isVip
                ? `⚡ Chỉ còn ${Math.floor(Math.random() * 3) + 1} suất VIP cuối cùng giá 499k!`
                : `🎉 ${name} vừa đăng ký thành công vé Zoom!`;

            setPopup({ id: Date.now(), message });

            // Hide after 4 seconds
            setTimeout(() => setPopup(null), 4000);

            // Schedule next popup (between 8 to 20 seconds)
            timeout = setTimeout(triggerPopup, Math.random() * 12000 + 8000);
        };

        timeout = setTimeout(triggerPopup, 3000); // Initial delay
        return () => clearTimeout(timeout);
    }, []);

    return popup;
}

export default function ZoomLandingPage() {
    const router = useRouter();
    const popup = useFomoPopup();
    const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const [formData, setFormData] = useState({
        name: '',
        zalo: '',
        email: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set the target date: Thursday, March 5, 2026 at 20:00 (8:00 PM)
    useEffect(() => {
        const targetDate = new Date('2026-03-05T20:00:00+07:00');

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/academy/register-zoom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                // Redirect to VIP upgrade page
                router.push('/academy/zoom-3-days/vip-upgrade');
            } else {
                const data = await res.json();
                alert(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>[FREE ZOOM] Làm chủ YouTube AI 2026 - SeenYT</title>
                <meta name="description" content="Sự kiện Zoom 3 ngày MIỄN PHÍ 100% hướng dẫn xây kênh YouTube AI." />
                <meta name="robots" content="index, follow" />
            </Head>

            {/* FOMO Popup */}
            {popup && (
                <div
                    key={popup.id}
                    className="fixed bottom-4 left-4 z-50 animate-fade-in-up bg-[#111]/90 backdrop-blur-md border border-red-500/30 shadow-[0_4px_20px_rgba(220,38,38,0.3)] rounded-lg px-4 py-3 flex items-center gap-3 max-w-sm"
                >
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex flex-shrink-0 items-center justify-center">
                        <Users className="w-4 h-4 text-red-400" />
                    </div>
                    <p className="text-sm font-semibold text-white leading-tight">{popup.message}</p>
                </div>
            )}

            <main className="bg-[#0a0a0a] min-h-screen font-sans text-gray-200 relative overflow-hidden py-8 md:py-12 px-4 flex flex-col items-center">
                {/* Background Ambient Lighting */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-[1300px] w-full mx-auto relative z-10 box-border">

                    {/* Landing Page Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 font-bold text-sm tracking-wide uppercase mb-4 animate-pulse">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            [FREE ZOOM] 100 Vé Độc Quyền
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
                            Làm Chủ YouTube AI 2026
                        </h1>
                        <h2 className="text-xl md:text-2xl font-bold text-amber-500 mb-6 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                            Làm Ít Hơn, Kiếm Nhiều Hơn Nhờ Tự Động Hóa
                        </h2>
                        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10">
                            Chương trình Zoom 3 ngày trị giá <span className="line-through decoration-red-500">2.990.000đ</span> nay hoàn toàn <strong className="text-green-400">MIỄN PHÍ 100%</strong> cho Newbie muốn xây kênh tự động hóa không cần lộ mặt.
                        </p>
                    </div>

                    {/* --- HERO VIDEO & HOOK (2 COLUMNS) --- */}
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center mt-12 mb-24">

                        {/* Left Column: Video */}
                        <div className="flex justify-center md:justify-end">
                            <div
                                className="w-full max-w-[280px] relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] aspect-[9/16] bg-black group cursor-pointer border-2 border-red-500/50 hover:border-red-500 transition-colors"
                                onClick={() => setIsVideoPopupOpen(true)}
                            >
                                {/* Glowing Background Effect */}
                                <div className="absolute inset-0 bg-red-500/10 blur-[50px] mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                                {/* Hover Video Preview (Muted/Autoplay loop) vs Static Image */}
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover opacity-90 scale-105 group-hover:scale-100 transition-transform duration-1000"
                                    src="/images/shorts-preview.mp4" // Ideally a silent 3s snippet
                                    poster="https://i.ytimg.com/vi/I-YfmS04HKM/maxresdefault.jpg" // Fallback thumbnail
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                                {/* Play Button Overlay (Visible before hover or always center) */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-16 h-16 bg-red-600/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.8)] group-hover:scale-110 transition-transform duration-300">
                                        <Play className="w-8 h-8 text-white ml-1" />
                                    </div>
                                </div>

                                <div className="absolute bottom-6 left-0 right-0 px-4 text-center pointer-events-none">
                                    <h3 className="text-white font-black text-lg drop-shadow-lg mb-2">Bấm Xem Thu Nhập</h3>
                                    <div className="inline-flex px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold tracking-widest text-[10px] uppercase items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                                        Hệ Thống AI
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Hook (Nỗi Đau) */}
                        <div className="text-left mt-8 md:mt-0 px-4 md:px-0">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                                Tại sao bạn vẫn chưa có thu nhập từ YouTube?
                            </h2>
                            <p className="text-lg text-gray-400 font-semibold mb-8">
                                Bạn có đang loay hoay như 90% Newbie khác?
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-950/20 rounded-full flex items-center justify-center shrink-0 border border-red-500/30">
                                        <Frown className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Bỏ Hàng Giờ Edit...</h3>
                                        <p className="text-gray-400 text-sm">Cắt ghép video cả đêm nhưng đăng lên view vẫn lẹt đẹt.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-amber-950/20 rounded-full flex items-center justify-center shrink-0 border border-amber-500/30">
                                        <ShieldAlert className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Không Biết Chọn Ngách</h3>
                                        <p className="text-gray-400 text-sm">Làm chủ đề quá rộng thì khó cạnh tranh, làm ngách nhỏ thì nghèo.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-orange-950/20 rounded-full flex items-center justify-center shrink-0 border border-orange-500/30">
                                        <XOctagon className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Sợ Kỹ Thuật Phức Tạp</h3>
                                        <p className="text-gray-400 text-sm">Ngại lộ mặt, tiếng Anh kém, và sợ hãi trước phần mềm rắc rối.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 inline-block px-6 py-2.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm animate-fade-in-up">
                                Đã đến lúc để Hệ Thống AI làm thay bạn!
                            </div>
                        </div>
                    </div>

                    {/* --- VIDEO POPUP OVERLAY --- */}
                    {isVideoPopupOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in">
                            <button
                                onClick={() => setIsVideoPopupOpen(false)}
                                className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-50"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>

                            <div className="w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.4)] border border-white/10 relative">
                                <iframe
                                    src="https://www.youtube.com/embed/I-YfmS04HKM?autoplay=1&mute=0&controls=1&loop=1&playlist=I-YfmS04HKM"
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    className="w-full h-full absolute inset-0"
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {/* --- NEW SECTION 2: AUTHORITY (CHUYÊN GIA) --- */}
                    <div className="mb-24 max-w-5xl mx-auto bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="grid md:grid-cols-2">
                            <div className="relative h-72 md:h-auto min-h-[400px] overflow-hidden flex items-center justify-center bg-black/20">
                                <Image
                                    src="/images/mrseen/mrseen-suit.jpg"
                                    alt="Mr Seen Suit"
                                    fill
                                    className="object-contain object-center opacity-100 drop-shadow-xl pointer-events-none p-4 md:p-8"
                                />
                            </div>

                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-xs uppercase mb-4 w-max">
                                    <Target className="w-3 h-3" />
                                    Chuyên Gia Dẫn Đường
                                </div>
                                <h2 className="text-3xl font-black text-white mb-4">
                                    Tùng Phạm & SEEN<span className="text-red-500">YT</span>
                                </h2>
                                <h3 className="text-xl font-semibold text-gray-300 mb-6 italic border-l-4 border-red-500 pl-4 leading-relaxed">
                                    "Với tôi trí tuệ chỉ thực sự có giá trị khi được chia sẻ ! Chúng ta ở đây là để đồng hành và giúp đỡ nhau bằng tất cả sự tâm huyết và tử tế !"
                                </h3>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-4 h-4 text-red-500" />
                                        </div>
                                        <p className="text-gray-300"><strong className="text-white">Hơn 10 năm kinh nghiệm</strong> thực chiến MMO, Digital Marketing và xây dựng hệ thống tự động.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-4 h-4 text-red-500" />
                                        </div>
                                        <p className="text-gray-300"><strong className="text-white">Kinh nghiệm phát triển YouTube:</strong> Xây dựng hàng loạt kênh Global mang về nút Bạc, nút Vàng và hàng triệu view.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-4 h-4 text-red-500" />
                                        </div>
                                        <p className="text-gray-300">Nhà sáng lập, CEO & Developer của hệ sinh thái phần mềm AI <strong className="text-red-500">SeenYT</strong></p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-4 h-4 text-red-500" />
                                        </div>
                                        <p className="text-gray-300"><strong className="text-white">7.000+ các bạn đồng hành</strong> trong và ngoài nước đã được thay đổi tư duy và chạm tới thu nhập bền vững.</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* --- NEW SECTION: SUCCESS STORIES CAROUSEL --- */}
                    <div className="mb-24 w-full overflow-hidden relative">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @keyframes marquee {
                                0% { transform: translateX(0%); }
                                100% { transform: translateX(-50%); }
                            }
                            .animate-marquee {
                                animation: marquee 30s linear infinite;
                            }
                            .animate-marquee:hover {
                                animation-play-state: paused;
                            }
                        `}} />

                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">Sự thành công của các bạn trong cộng đồng SeenYT</h3>
                            <p className="text-gray-400">Hàng ngàn kênh Youtube bứt phá hàng triệu view và chạm tới thu nhập bền vững.</p>
                        </div>

                        {/* Fading Edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>

                        {/* Scrolling Container (Width 200% to allow smooth endless loop) */}
                        <div className="flex w-[200%] animate-marquee space-x-6 py-4 px-4 items-center">
                            {/* Original Set (10 items) */}
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-1.jpg" alt="Student Success 1" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-2.jpg" alt="Student Success 2" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-3.png" alt="Student Success 3" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-4.png" alt="Student Success 4" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-5.jpg" alt="Student Success 5" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-6.jpg" alt="Student Success 6" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-7.jpg" alt="Student Success 7" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-8.png" alt="Student Success 8" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-9.jpg" alt="Student Success 9" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-10.jpg" alt="Student Success 10" fill className="object-cover opacity-90" />
                            </div>

                            {/* Duplicated Set (For Infinite Loop) */}
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-1.jpg" alt="Student Success 1" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-2.jpg" alt="Student Success 2" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-3.png" alt="Student Success 3" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-4.png" alt="Student Success 4" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-5.jpg" alt="Student Success 5" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-6.jpg" alt="Student Success 6" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-7.jpg" alt="Student Success 7" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-8.png" alt="Student Success 8" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-9.jpg" alt="Student Success 9" fill className="object-cover opacity-90" />
                            </div>
                            <div className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                                <Image src="/images/testimonials/shorts-10.jpg" alt="Student Success 10" fill className="object-cover opacity-90" />
                            </div>
                        </div>
                    </div>

                    {/* 2-Column Landing Section (Roadmap) */}
                    <div className="grid lg:grid-cols-2 gap-8 items-stretch pt-6 border-t border-white/5">

                        {/* Left Column: Roadmap/Value Prop */}
                        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden relative group shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[80px] rounded-full group-hover:bg-red-500/10 transition-colors duration-700" />

                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Video className="w-8 h-8 text-red-500" />
                                    Lộ Trình Đột Phá 3 Ngày
                                </h2>

                                <div className="space-y-4">
                                    {/* Day 1 */}
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30 font-black text-red-500 text-xl shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                            1
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">Cách chọn ngách Global "in tiền" USD</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-3">
                                                <strong className="text-red-400">Không cần lộ mặt</strong> - Khám phá tư duy chọn ngách thông minh để làm ít hơn, kiếm nhiều hơn nhờ hệ thống tự động hóa hoàn toàn.
                                            </p>
                                            <div className="inline-flex py-1 px-3 bg-red-500/10 border border-red-500/30 rounded-md text-xs font-bold text-red-400">
                                                🎁 Quà tặng: List 50 ngách "Vàng" dành riêng cho Newbie
                                            </div>
                                        </div>
                                    </div>

                                    {/* Day 2 */}
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30 font-black text-orange-400 text-xl shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                                            2
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">Quy trình dùng AI tạo 10 video/ngày</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-3">
                                                <strong className="text-orange-400">Demo thực tế công cụ SeenYT:</strong> Từ viết kịch bản, lồng tiếng cảm xúc đến edit hoàn chỉnh, sản xuất nội dung công nghiệp trong nháy mắt.
                                            </p>
                                            <div className="inline-flex py-1 px-3 bg-orange-500/10 border border-orange-500/30 rounded-md text-xs font-bold text-orange-400">
                                                🎁 Quà tặng: Bộ Prompt AI "Thần chú" SeenYT độc quyền
                                            </div>
                                        </div>
                                    </div>

                                    {/* Day 3 */}
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30 font-black text-green-400 text-xl shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                            3
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">Công thức biến View thành tiền</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-3">
                                                <strong className="text-green-400">Lộ trình 1.000$ đầu tiên:</strong> Tối ưu đa dạng nguồn thu nhập từ YouTube Adsense, Affiliate thương mại điện tử quốc tế đến việc nhận Booking quảng cáo.
                                            </p>
                                            <div className="inline-flex py-1 px-3 bg-green-500/10 border border-green-500/30 rounded-md text-xs font-bold text-green-400">
                                                🔥 Offer: Cơ hội đồng hành 1-1 cùng đội ngũ SeenYT để về đích nhanh nhất
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Who is this for Section */}
                            <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                                <h3 className="text-[15px] font-bold text-white mb-4 uppercase tracking-wider text-center text-gray-400">Khóa học này dành cho ai?</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
                                        <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-300"><strong className="text-white block mb-0.5">Người bận rộn</strong> Làm công sở, có 1-2 tiếng mỗi ngày.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
                                        <EyeOff className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-300"><strong className="text-white block mb-0.5">Người ngại lộ mặt</strong> Không muốn đứng trước máy quay.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-300"><strong className="text-white block mb-0.5">Từng thất bại</strong> Đã làm YouTube nhưng kênh lẹt đẹt.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
                                        <Rocket className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-300"><strong className="text-white block mb-0.5">Newbie "Số 0"</strong> Nắm bắt trend AI sớm để dẫn đầu.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex -space-x-3">
                                    <img className="w-8 h-8 rounded-full border-2 border-[#111]" src="https://i.pravatar.cc/100?img=1" alt="Avatar" />
                                    <img className="w-8 h-8 rounded-full border-2 border-[#111]" src="https://i.pravatar.cc/100?img=2" alt="Avatar" />
                                    <img className="w-8 h-8 rounded-full border-2 border-[#111]" src="https://i.pravatar.cc/100?img=3" alt="Avatar" />
                                    <div className="w-8 h-8 rounded-full border-2 border-[#111] bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white">+5K</div>
                                </div>
                                <p className="text-sm font-medium text-gray-300">Đã đăng ký tham gia</p>
                            </div>
                        </div>

                        {/* Right Column: Countdown + Form */}
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/40 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden flex flex-col justify-center">

                            {/* Countdown Timer */}
                            <div className="mb-8 text-center">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Cổng đăng ký sẽ đóng sau</h3>
                                <div className="flex justify-center gap-2 sm:gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#151515] border border-white/10 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-inner mb-2">
                                            {timeLeft.days.toString().padStart(2, '0')}
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase">Ngày</span>
                                    </div>
                                    <div className="text-2xl font-black text-gray-600 mt-2 md:mt-3">:</div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#151515] border border-white/10 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-inner mb-2">
                                            {timeLeft.hours.toString().padStart(2, '0')}
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase">Giờ</span>
                                    </div>
                                    <div className="text-2xl font-black text-gray-600 mt-2 md:mt-3">:</div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#151515] border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-red-500 shadow-inner mb-2">
                                            {timeLeft.minutes.toString().padStart(2, '0')}
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-red-500 font-bold uppercase">Phút</span>
                                    </div>
                                    <div className="text-2xl font-black text-gray-600 mt-2 md:mt-3">:</div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#151515] border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-red-500 shadow-inner mb-2">
                                            {timeLeft.seconds.toString().padStart(2, '0')}
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-red-500 font-bold uppercase">Giây</span>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-300 ml-1">Họ và Tên</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black border border-gray-800 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder-gray-600"
                                            placeholder="Nhập tên của bạn..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-300 ml-1">Số Zalo (Để add group)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.zalo}
                                            onChange={(e) => setFormData({ ...formData, zalo: e.target.value })}
                                            className="w-full bg-black border border-gray-800 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder-gray-600"
                                            placeholder="09xx xxx xxx"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-300 ml-1">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-black border border-gray-800 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder-gray-600"
                                            placeholder="example@gmail.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white font-black text-lg py-4 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] animate-pulse hover:animate-none transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <span>Đang giữ chỗ...</span>
                                    ) : (
                                        <>
                                            <span className="relative flex h-3 w-3 mr-1">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                            </span>
                                            Đăng Ký Khóa Học <Send className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" /> Số lượng có hạn, ưu tiên 100 người đăng ký đầu tiên.
                                </p>
                            </form>
                        </div>

                    </div>

                    {/* --- NEW SECTION 3: THE OFFER STACK (BỘ 20 QUÀ TẶNG) --- */}
                    <div className="mt-24 mb-24 max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-sm tracking-wide mb-4">
                                <span className="text-xl">🎁</span> Tặng Kèm 20 Món Bảo Bối Miễn Phí
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                                Đăng Ký Hôm Nay - Nhận Ngay Bộ Quà Tặng Trị Giá <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">5.000.000đ</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Cột 1: Tài Liệu */}
                            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                                        <MonitorPlay className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">Gói Tài Liệu Ngách (5 Món)</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                                            <span>Top 20 ngách YouTube Global có RPM cao nhất 2026.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                                            <span>Danh sách 50 chủ đề "YouTube Shorts" nhanh lên xu hướng.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                                            <span>Bảng phân tích đối thủ trong 10 ngách hot nhất.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                                            <span>File PDF: "Công thức chọn ngách không bao giờ lỗi thời".</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                                            <span>Map lộ trình 90 ngày xây kênh từ 0 đến 100.000 Subs.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Cột 2: Công cụ AI */}
                            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:border-amber-500/60 transition-colors transform md:-translate-y-4">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full group-hover:bg-amber-500/20 transition-colors" />
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-600" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6">
                                        <Key className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">Gói Công Cụ & Prompt (7)</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                            <span>Bộ "Thần chú" Prompt viết kịch bản triệu view (EN/VN).</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                            <span>Mẫu Prompt tạo ảnh Thumbnail Midjourney cực cuốn.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                            <span>Danh sách 10 công cụ AI miễn phí tốt nhất để edit.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                            <span>Kho 100+ Hiệu ứng âm thanh (SFX) chuyên dụng.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                            <span>Template kịch bản Shorts giữ chân đến giây cuối.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                            <span>Hướng dẫn cài bot trợ lý chuẩn SEO mô tả video.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                            <span>Bảng tính toán lợi nhuận tự động hóa.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Cột 3: Đặc quyền */}
                            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[40px] rounded-full group-hover:bg-green-500/20 transition-colors" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6">
                                        <Infinity className="w-6 h-6 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">Gói Đặc Quyền SeenYT (8)</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                                            <span><strong>[VIP]</strong> 01 buổi Audit kênh trực tiếp.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                                            <span><strong>[VIP]</strong> Video Record trọn đời 3 buổi Zoom.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                                            <span>Vé mời nhóm Zalo "Kín" hỗ trợ trọn đời.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                                            <span>Mã giảm 30% khi setup kênh trọn gói.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                                            <span>Ebook: "10 Bí mật thành công YouTube 2026".</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                                            <span>Checklist 20 bước kiểm tra kênh bật kiếm tiền.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                                            <span>Hướng dẫn rút tiền AdSense an toàn nhất.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                                            <span>Update luật chơi YouTube mới nhất 2026.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- NEW SECTION 4: TRUST & FAQ --- */}
                    <div className="max-w-4xl mx-auto mb-20 bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[100px] rounded-full pointer-events-none" />

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-white mb-2">Câu Hỏi Thường Gặp</h2>
                            <p className="text-gray-400">Những thắc mắc 99% Newbie đều gặp phải trước khi bắt đầu.</p>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {[
                                {
                                    q: "Tôi không biết tiếng Anh có làm kênh Global được không?",
                                    a: "Hoàn toàn được! Hệ thống AI của SeenYT được thiết kế để xử lý 100% rào cản ngôn ngữ. Bạn chỉ cần nhập tiếng Việt, AI sẽ viết kịch bản, dịch, và đọc thành tiếng Anh (hoặc 50 ngôn ngữ khác) chuẩn bản xứ."
                                },
                                {
                                    q: "Tôi chỉ có điện thoại có học và làm được không?",
                                    a: "Được bạn nhé. Bạn có thể follow theo khóa học bằng điện thoại và dùng các công cụ edit video trên mobile. Dĩ nhiên nếu có Laptop/PC thì tốc độ thao tác sẽ nhanh hơn."
                                },
                                {
                                    q: "Khóa học Zoom này có thực sự Miễn Phí?",
                                    a: "100% Miễn Phí! Bạn không phải trả bất kỳ chi phí nào để tham gia 3 buổi học trực tiếp. Tuy nhiên thời lượng có hạn nên ưu tiên sự cam kết và nghiêm túc."
                                },
                                {
                                    q: "Làm YouTube AI mất bao lâu để có tiền?",
                                    a: "Không có công thức chung, nhanh hay chậm tùy thuộc vào độ kiên trì áp dụng kiến thức. Trong Zoom, chúng tôi sẽ show case study các kênh bật kiếm tiền chỉ sau 3-4 tuần nhờ chọn đúng ngách."
                                },
                                {
                                    q: "Tôi sợ làm kênh xong dính bản quyền (Reup)?",
                                    a: "SeenYT không hướng dẫn làm Reup. Chúng tôi dạy bạn sản xuất nội dung BÁN TỰ ĐỘNG (Faceless) 100% tuân thủ luật bản quyền (Fair Use) của nền tảng."
                                }
                            ].map((faq, index) => (
                                <div key={index} className="border border-white/10 rounded-xl bg-black/50 overflow-hidden text-left">
                                    <button
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none"
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <span className="font-bold text-gray-200 text-lg">{faq.q}</span>
                                        <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${activeFaq === index ? 'rotate-90 text-red-500' : ''}`} />
                                    </button>
                                    <div
                                        className={`transition-all duration-500 ease-in-out ${activeFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                                    >
                                        <div className="px-6 pb-5 pt-2 text-gray-400 text-base leading-relaxed border-t border-white/5 mx-4">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 bg-red-950/30 border border-red-500/20 rounded-2xl p-6 text-center">
                            <h3 className="text-xl font-bold text-red-500 mb-2">🎁 Ưu đãi đặc biệt: 100% Guarantee</h3>
                            <p className="text-gray-300">Dù khoá học hoàn toàn Miễn Phí, chúng tôi vẫn đảm bảo chất lượng bằng danh dự. Nếu bạn thấy 3 buổi học không mang lại kiến thức thực tế nào, đội ngũ SeenYT xin bồi thường 1 cốc cà phê coi như lời tạ lỗi vì làm mất thời gian của bạn!</p>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}
