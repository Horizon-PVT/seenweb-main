import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SocialProofGallery, { defaultSocialProofItems } from '@/components/SocialProofGallery';
import { Download, CheckCircle, Star, Target, Zap, TrendingUp, Users, ShieldCheck, Gift } from 'lucide-react';

export default function CoachingPage() {
    const handleZaloContact = () => {
        window.open('https://zalo.me/0789284078', '_blank');
    };

    const handleDownloadPDF = () => {
        const link = document.createElement('a');
        link.href = '/youtube-master-2026.pdf';
        link.download = 'Lộ_Trình_YouTube_Master_2026.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-[#0b0b0f] text-gray-200 min-h-screen font-sans selection:bg-[#e11d48] selection:text-black">
            <Head>
                <title>Coaching 1-1: Xây Dựng Tài Sản Số | Mr. Seen</title>
                <meta name="description" content="Chương trình Coaching 1-1 độc quyền cùng Mr. Seen. Xây dựng kênh YouTube triệu view và hệ thống Affiliate tự động." />
            </Head>

            <Header />

            <main>
                {/* --- HERO SECTION --- */}
                <section className="relative w-full min-h-[700px] flex items-center justify-center overflow-hidden pt-28 pb-16">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/mrseen/mrseen-stage.jpg"
                            alt="Mr Seen Stage"
                            fill
                            priority
                            className="object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0f] via-[#0b0b0f]/80 to-[#0b0b0f]"></div>
                        <div className="absolute inset-0 bg-[#e11d48]/5 mix-blend-overlay"></div>
                    </div>

                    <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-[#e11d48]/10 border border-[#e11d48]/30 text-[#f43f5e] font-semibold text-sm mb-6 animate-fade-in-up">
                            ⭐ CHƯƠNG TRÌNH KÈM CẶP CHUYÊN SÂU 2026
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white font-playfair tracking-tight mb-6 animate-fade-in-up delay-100 leading-tight">
                            COACHING 1-1: XÂY DỰNG <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e11d48] to-[#fb7185]">
                                TÀI SẢN SỐ YOUTUBE
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 mx-auto mb-10 animate-fade-in-up delay-200 leading-relaxed">
                            Đừng chỉ làm Video, hãy xây dựng một <strong>"Cỗ máy in tiền"</strong> tự động. Mr. Seen trực tiếp đồng hành giúp bạn làm chủ công nghệ AI, chiếm lĩnh ngách triệu view và tạo thu nhập bền vững từ số 0.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                            <button
                                onClick={handleZaloContact}
                                className="px-8 py-4 bg-gradient-to-r from-[#e11d48] to-[#be123c] text-black font-extrabold text-lg rounded-sm hover:scale-105 transition-all shadow-[0_0_30px_rgba(205,173,90,0.4)] flex items-center justify-center gap-2"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21.464 11.666c0-5.755-4.802-10.42-10.732-10.42-5.93 0-10.732 4.665-10.732 10.42 0 3.195 1.493 6.05 3.84 8.014v4.32l4.16-2.22c.866.24 1.78.37 2.732.37 5.93 0 10.732-4.665 10.732-10.42z" />
                                </svg>
                                ĐĂNG KÝ PHỎNG VẤN 1-1
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="px-8 py-4 border border-[#e11d48]/50 bg-black/40 text-[#e11d48] font-bold text-lg rounded-sm hover:bg-[#e11d48]/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Tải Lộ Trình (PDF)
                            </button>
                        </div>
                        <p className="mt-6 text-gray-500 text-sm italic animate-fade-in-up delay-300">
                            *Chỉ nhận tối đa 05 học viên mỗi tháng để đảm bảo chất lượng.
                        </p>
                    </div>
                </section>

                {/* --- AUTHORITY SECTION --- */}
                <section className="py-20 bg-[#111116] relative border-y border-white/5">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2 relative h-[500px] text-center md:text-left">
                            <div className="relative w-full h-full max-w-[400px] mx-auto md:mx-0 border-2 border-[#e11d48]/20 p-2 rounded-sm shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-700 cursor-pointer bg-black/50">
                                <Image
                                    src="/images/mrseen/mrseen-portrait.png"
                                    alt="Mr Seen Portrait"
                                    fill
                                    className="object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-5 md:right-10 w-[180px] h-[260px] shadow-2xl animate-float hidden md:block border border-white/10 rounded-sm bg-black">
                                <Image
                                    src="/images/mrseen/poster-coaching-new.png"
                                    alt="SeenYT Book"
                                    fill
                                    className="object-cover rounded-sm"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl font-bold text-white mb-6 font-playfair border-l-4 border-[#e11d48] pl-6">
                                AI LÀ NGƯỜI DẪN DẮT BẠN?
                            </h2>
                            <div className="prose prose-invert text-gray-300 mb-8 space-y-4 text-lg">
                                <p>
                                    Xin chào, tôi là <strong className="text-[#e11d48]">Mr. Seen</strong> (Phạm Anh Tùng).
                                </p>
                                <p>
                                    Tôi không dạy lý thuyết suông. Tất cả những gì tôi chia sẻ đều đúc kết từ hơn 5 năm lăn lộn với YouTube, Affiliate và thị trường MMO quốc tế, đi từ con số 0 đến những cột mốc doanh thu thực tế.
                                </p>
                                <p>
                                    Chiến lược của tôi tập trung vào <span className="text-[#e11d48] font-semibold">TƯ DUY ĐÚNG</span> kết hợp sức mạnh <span className="text-[#e11d48] font-semibold">CÔNG CỤ AI ĐỘC QUYỀN</span> để tối ưu hóa thời gian và nhân bản hệ thống nhanh nhất.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-5 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-sm hover:border-[#e11d48]/50 transition-colors">
                                    <h4 className="text-3xl font-black text-white mb-1">500K+</h4>
                                    <p className="text-[#e11d48] text-sm font-semibold">Followers hệ thống kênh</p>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-sm hover:border-[#e11d48]/50 transition-colors">
                                    <h4 className="text-3xl font-black text-white mb-1">5+ Năm</h4>
                                    <p className="text-[#e11d48] text-sm font-semibold">Kinh nghiệm thực chiến</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 3-PHASE ROADMAP --- */}
                <section id="roadmap" className="py-24 bg-[#0b0b0f] relative overflow-hidden">
                    {/* Background glows */}
                    <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#e11d48]/5 blur-[150px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold text-white font-playfair mb-6">
                                LỘ TRÌNH 3 GIAI ĐOẠN ĐỘT PHÁ
                            </h2>
                            <p className="text-gray-400 text-lg">Hệ thống 9 bài học chiến lược Master 2026. Đi từ việc định hình tư duy, xây kênh đến lúc tiền tự động chảy về túi.</p>
                        </div>

                        <div className="space-y-8 max-w-5xl mx-auto">

                            {/* PHASE 1 */}
                            <div className="bg-[#16161c] border border-gray-800 rounded-xl overflow-hidden hover:border-[#e11d48]/50 transition-all duration-300 group">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                    <div className="md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-800 pb-6 md:pb-0 md:pr-8">
                                        <div className="text-[#e11d48] font-black text-6xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity">01</div>
                                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                            <Target className="w-6 h-6 text-blue-400" />
                                            Thiết Kế Nền Móng
                                        </h3>
                                        <p className="text-gray-400 text-sm">Tư Duy & Chọn Thị Trường</p>
                                    </div>
                                    <div className="md:w-2/3 space-y-4">
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <strong className="text-white">Bài 1: Tư duy Tài sản số</strong>
                                            <p className="text-gray-400 text-sm mt-1">Tại sao YouTube là kênh trú ẩn an toàn và cách tạo thu nhập thụ động bền vững thời kỳ AI.</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <strong className="text-white">Bài 2: Đào ngách "Vàng" (Niche Research)</strong>
                                            <p className="text-gray-400 text-sm mt-1">Sử dụng Tool AI để tìm ngách CPM cao, ít cạnh tranh nhưng nhu cầu lớn trên toàn cầu.</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <strong className="text-white">Bài 3: Setup Kênh Chuẩn Quốc Tế</strong>
                                            <p className="text-gray-400 text-sm mt-1">Cấu hình kênh chuẩn SEO từ đầu, thu hút thuật toán đề xuất ngay lập tức.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PHASE 2 */}
                            <div className="bg-[#16161c] border border-gray-800 rounded-xl overflow-hidden hover:border-[#e11d48]/50 transition-all duration-300 group">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                    <div className="md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-800 pb-6 md:pb-0 md:pr-8">
                                        <div className="text-[#e11d48] font-black text-6xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity">02</div>
                                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                            <Zap className="w-6 h-6 text-yellow-400" />
                                            Cỗ Máy Nội Dung AI
                                        </h3>
                                        <p className="text-gray-400 text-sm">Tốc độ & Chất lượng</p>
                                    </div>
                                    <div className="md:w-2/3 space-y-4">
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <strong className="text-white">Bài 4: Kịch bản Thôi miên (Scripting)</strong>
                                            <p className="text-gray-400 text-sm mt-1">Công thức viết kịch bản giữ chân người xem (Retention) chuyên sâu bằng AI.</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <strong className="text-white">Bài 5: Sản xuất Video Thần tốc</strong>
                                            <p className="text-gray-400 text-sm mt-1">Làm chủ bộ công cụ SeenYT (MC ảo, giọng đọc AI, edit tự động) để xuất 1 video trong 30-60 phút.</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <strong className="text-white">Bài 6: Thumbnail "Nhìn là Click"</strong>
                                            <p className="text-gray-400 text-sm mt-1">Thiết kế ảnh thu nhỏ đánh thẳng vào tâm lý hành vi, tối ưu CTR cực đại thay vì chỉ đẹp.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PHASE 3 */}
                            <div className="bg-[#16161c] border border-gray-800 rounded-xl overflow-hidden hover:border-[#e11d48]/50 transition-all duration-300 group">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                    <div className="md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-800 pb-6 md:pb-0 md:pr-8">
                                        <div className="text-[#e11d48] font-black text-6xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity">03</div>
                                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                            <TrendingUp className="w-6 h-6 text-green-400" />
                                            Bứt Phá Thu Nhập
                                        </h3>
                                        <p className="text-gray-400 text-sm">Scale Up & Tự Động Hóa</p>
                                    </div>
                                    <div className="md:w-2/3 space-y-4">
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <strong className="text-white">Bài 7: SEO & Chiến lược Viral</strong>
                                            <p className="text-gray-400 text-sm mt-1">Cách "mồi" view chuẩn và mượn lực YouTube Shorts kéo traffic bùng nổ cho video dài.</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <strong className="text-white">Bài 8: Đa dạng hóa Dòng Tiền</strong>
                                            <p className="text-gray-400 text-sm mt-1">Kết hợp linh hoạt YouTube AdSense, High-ticket Affiliate và kinh doanh Sản phẩm số.</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <strong className="text-white">Bài 9: Quản trị & Nhân bản</strong>
                                            <p className="text-gray-400 text-sm mt-1">Quy trình đóng gói thuê ngoài (Outsource) để vận hành cùng lúc 3-5 kênh không mệt sức.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* --- SOCIAL PROOF / TESTIMONIALS --- */}
                <section id="social-proof" className="py-20 px-4 bg-[#0b0b0f] relative border-t border-white/5">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#e11d48]/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="max-w-6xl mx-auto relative z-10">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center space-x-2 bg-white/5 border border-[#e11d48]/20 rounded-full px-4 py-2 mb-4">
                                <Star className="w-4 h-4 text-[#e11d48] fill-[#e11d48]" />
                                <span className="text-sm font-medium tracking-wide uppercase text-white">
                                    Kết Quả Thực Tế Học Viên
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white font-playfair mb-4">
                                Bằng Chứng Thép Từ <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e11d48] to-[#fb7185]">Chương Trình Coaching</span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Kết quả nói thay mọi lời quảng cáo. Đây là những kênh thực tế đã áp dụng thành công bộ công cụ và chiến lược của SeenYT.</p>
                        </div>

                        {/* Dynamic Mixed-Media Masonry Gallery */}
                        <SocialProofGallery items={defaultSocialProofItems} />
                    </div>
                </section>

                {/* --- DELIVERABLES / BENEFITS --- */}
                <section className="py-20 bg-[#111116] border-t border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-white font-playfair mb-4">ĐẶC QUYỀN HỌC VIÊN COACHING</h2>
                            <p className="text-gray-400">Những gì bạn nhận được không chỉ là kiến thức, mà là một hệ sinh thái vũ khí hoàn chỉnh.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            <div className="bg-[#0b0b0f] p-6 rounded-xl border border-white/5 hover:border-[#e11d48]/40 transition-colors">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 border border-blue-500/20">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Đồng Hành 1-1</h4>
                                <p className="text-gray-400 text-sm">Không học qua Clip quay sẵn. Mr. Seen trực tiếp check kênh, sửa bài và định hướng chiến lược mỗi tuần.</p>
                            </div>

                            <div className="bg-[#0b0b0f] p-6 rounded-xl border border-white/5 hover:border-[#e11d48]/40 transition-colors">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 border border-purple-500/20">
                                    <ShieldCheck className="w-6 h-6 text-purple-400" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Tặng Gói SeenYT Pro</h4>
                                <p className="text-gray-400 text-sm">Miễn phí sử dụng toàn bộ hệ sinh thái công cụ AI mạnh nhất (Script, Voice, Hình ảnh) của SeenYT.</p>
                            </div>

                            <div className="bg-[#0b0b0f] p-6 rounded-xl border border-white/5 hover:border-[#e11d48]/40 transition-colors">
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4 border border-yellow-500/20">
                                    <Gift className="w-6 h-6 text-yellow-500" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Tài Nguyên Độc Quyền</h4>
                                <p className="text-gray-400 text-sm">Tặng kho 100 ngách "Vàng" CPM &gt; $10, kịch bản mẫu ngàn view và bộ 500+ Thumbnail cắn đề xuất.</p>
                            </div>

                            <div className="bg-[#0b0b0f] p-6 rounded-xl border border-white/5 hover:border-[#e11d48]/40 transition-colors">
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 border border-green-500/20">
                                    <Star className="w-6 h-6 text-green-400" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Cộng Đồng Kín</h4>
                                <p className="text-gray-400 text-sm">Trở thành thành viên Mastermind. Liên tục cập nhật thuật toán YouTube mới nhất trọn đời.</p>
                            </div>
                        </div>

                        {/* RESULTS PLEDGE */}
                        <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-[#e11d48]/20 to-[#0b0b0f] border border-[#e11d48]/30 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-[#e11d48] rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle className="w-8 h-8 text-black" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 font-playfair">Khẳng định chất lượng Coaching</h3>
                                <p className="text-gray-300">"Sau 4 - 8 tuần huấn luyện, bạn không chỉ có lý thuyết mà bạn sẽ thực sự <strong>Sở Hữu Một Kênh YouTube</strong> đang vận hành mượt mà với quy trình AI tự động, sẵn sàng sinh lời."</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- CTA SECTION --- */}
                <section className="py-24 bg-[url('/images/mrseen/mrseen-bg.jpg')] bg-cover bg-center relative border-t border-[#e11d48]/20">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white font-playfair mb-6">BẠN ĐÃ SẴN SÀNG BỨT PHÁ?</h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            Đừng để thời gian trôi qua vô nghĩa. Cơ hội Xây dựng Tài sản số bằng AI năm 2026 đang ở ngay trước mắt. Hãy nhắn tin để tôi nắm bắt mục tiêu của bạn!
                        </p>
                        <button
                            onClick={handleZaloContact}
                            className="px-10 py-5 bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-black font-extrabold text-xl rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(205,173,90,0.6)] transition-all animate-pulse-slow flex items-center justify-center gap-3 mx-auto"
                        >
                            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.464 11.666c0-5.755-4.802-10.42-10.732-10.42-5.93 0-10.732 4.665-10.732 10.42 0 3.195 1.493 6.05 3.84 8.014v4.32l4.16-2.22c.866.24 1.78.37 2.732.37 5.93 0 10.732-4.665 10.732-10.42z" />
                            </svg>
                            TRÒ CHUYỆN 1-1 QUA ZALO NGAY
                        </button>

                        <div className="mt-8 inline-block bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-2 rounded-full font-medium animate-pulse">
                            ⚠️ Lưu ý: Chỉ nhận đào tạo TỐI ĐA 5 Học Viên mỗi tháng.
                        </div>
                    </div>
                </section>

            </main>
            <Footer />

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        @keyframes pulseSlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(205, 173, 90, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(205, 173, 90, 0); }
        }
        .animate-pulse-slow { animation: pulseSlow 2.5s infinite; }
      `}</style>
        </div>
    );
}
