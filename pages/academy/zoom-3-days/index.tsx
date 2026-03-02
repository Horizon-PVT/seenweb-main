import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Calendar, Clock, Video, ChevronRight, User, Phone, Mail, Send, Target, EyeOff, XCircle, Rocket } from 'lucide-react';

export default function ZoomLandingPage() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

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

            <main className="bg-[#0a0a0a] min-h-screen font-sans text-gray-200 relative overflow-hidden py-8 md:py-12 px-4 flex items-center justify-center">
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
                        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                            Chương trình Zoom 3 ngày trị giá <span className="line-through decoration-red-500">2.990.000đ</span> nay hoàn toàn <strong className="text-green-400">MIỄN PHÍ 100%</strong> cho Newbie muốn xây kênh tự động hóa không cần lộ mặt.
                        </p>
                    </div>

                    {/* 2-Column Landing Section */}
                    <div className="grid lg:grid-cols-2 gap-8 items-stretch">

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
                </div>
            </main>
        </>
    );
}
