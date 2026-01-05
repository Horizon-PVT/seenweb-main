
import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CoachingPage() {
    const handleZaloContact = () => {
        window.open('https://zalo.me/0789284078', '_blank');
    };

    return (
        <div className="bg-[#0b0b0f] text-gray-200 min-h-screen font-sans selection:bg-[#CDAD5A] selection:text-black">
            <Head>
                <title>Coaching 1-1 YouTube & Affiliate | Mr. Seen</title>
                <meta name="description" content="Chương trình Coaching 1-1 độc quyền cùng Mr. Seen. Xây dựng kênh YouTube triệu view và hệ thống Affiliate tự động." />
            </Head>

            <Header />

            <main>
                {/* --- HERO SECTION --- */}
                <section className="relative w-full h-auto min-h-[600px] flex items-center justify-center overflow-hidden pt-20">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/mrseen/mrseen-stage.jpg"
                            alt="Mr Seen Stage"
                            fill
                            priority
                            className="object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0f] via-transparent to-[#0b0b0f]"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f] via-transparent to-[#0b0b0f]"></div>
                    </div>

                    <div className="relative z-10 container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-[#CDAD5A] font-playfair tracking-tight mb-4 animate-fade-in-up">
                            SAN PHẲNG CUỘC CHƠI <br /> YOUTUBE & AFFILIATE
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 animate-fade-in-up delay-100">
                            Chiến lược thực chiến, công cụ AI độc quyền và sự đồng hành 1-1 để bạn bứt phá thu nhập từ Online Business.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
                            <button
                                onClick={handleZaloContact}
                                className="px-8 py-4 bg-[#CDAD5A] text-black font-bold text-lg rounded-sm hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(205,173,90,0.4)]"
                            >
                                Đăng Ký Tư Vấn 1-1 (Qua Zalo)
                            </button>
                            <a href="#content" className="px-8 py-4 border border-[#CDAD5A] text-[#CDAD5A] font-bold text-lg rounded-sm hover:bg-[#CDAD5A]/10 transition-all">
                                Xem Nội Dung
                            </a>
                        </div>
                    </div>
                </section>

                {/* --- AUTHORITY SECTION --- */}
                <section className="py-20 bg-[#111116] relative">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2 relative h-[500px] text-center md:text-left">
                            {/* Portrait Image */}
                            <div className="relative w-full h-full max-w-[400px] mx-auto md:mx-0 border border-[#CDAD5A]/30 p-2 rounded-sm shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-700 cursor-pointer">
                                <Image
                                    src="/images/mrseen/mrseen-portrait.png"
                                    alt="Mr Seen Portrait"
                                    fill
                                    className="object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            </div>

                            {/* Book Cover Floating */}
                            <div className="absolute -bottom-10 -right-5 md:right-10 w-[180px] h-[260px] shadow-2xl animate-float hidden md:block border border-white/10 rounded-sm bg-black">
                                <Image
                                    src="/images/mrseen/mrseen-book.png"
                                    alt="SeenYT Book"
                                    fill
                                    className="object-cover rounded-sm"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl font-bold text-white mb-6 font-playfair border-l-4 border-[#CDAD5A] pl-6">
                                AI LÀ NGƯỜI DẪN DẮT BẠN?
                            </h2>
                            <div className="prose prose-invert text-gray-300 mb-8 space-y-4">
                                <p>
                                    Xin chào, tôi là <strong className="text-[#CDAD5A]">Mr. Seen</strong> (Phạm Anh Tùng).
                                </p>
                                <p>
                                    Tôi không dạy lý thuyết suông. Tất cả những gì tôi chia sẻ đều đúc kết từ hơn 5 năm lăn lộn với YouTube, Affiliate và kiếm tiền Online, từ con số 0 đến những cột mốc doanh thu mơ ước.
                                </p>
                                <p>
                                    Phương pháp của tôi tập trung vào <span className="text-white font-semibold">TƯ DUY ĐÚNG</span> kết hợp sức mạnh <span className="text-white font-semibold">CÔNG CỤ AI</span> để tối ưu hóa thời gian và lợi nhuận.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-white/5 border-l-2 border-[#CDAD5A]">
                                    <h4 className="text-2xl font-bold text-white">500K+</h4>
                                    <p className="text-gray-400 text-sm">Followers hệ thống kênh</p>
                                </div>
                                <div className="p-4 bg-white/5 border-l-2 border-[#CDAD5A]">
                                    <h4 className="text-2xl font-bold text-white">5+ Năm</h4>
                                    <p className="text-gray-400 text-sm">Kinh nghiệm thực chiến</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- PROGRAM CONTENT --- */}
                <section id="content" className="py-20 bg-[#0b0b0f] relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-[#CDAD5A] font-playfair mb-4">LỘ TRÌNH COACHING 1-1</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">Chương trình được thiết kế riêng ("tailor-made") dựa trên xuất phát điểm và mục tiêu của chính bạn.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Module 1 */}
                            <div className="group p-8 bg-[#16161c] border border-gray-800 hover:border-[#CDAD5A] transition-all rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white group-hover:text-[#CDAD5A] transition-colors">01</div>
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="text-[#CDAD5A]">⚡</span> YOUTUBE AUTOMATION
                                </h3>
                                <ul className="space-y-4 text-gray-300">
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Tư duy chọn ngách "triệu view" ít cạnh tranh.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Quy trình sản xuất video tự động hóa bằng AI (ChatGPT, Midjourney, VEO...).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Tối ưu SEO YouTube để leo Top tìm kiếm bền vững.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Xây dựng thương hiệu cá nhân (Personal Brand) uy tín.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Module 2 */}
                            <div className="group p-8 bg-[#16161c] border border-gray-800 hover:border-[#CDAD5A] transition-all rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white group-hover:text-[#CDAD5A] transition-colors">02</div>
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="text-[#CDAD5A]">💰</span> HIGH-TICKET AFFILIATE
                                </h3>
                                <ul className="space-y-4 text-gray-300">
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Chiến lược chọn sản phẩm Affiliate hoa hồng cao (High-Ticket).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Xây dựng phễu bán hàng (Sales Funnel) tự động chuyển đổi.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Kỹ năng Copywriting "thôi miên" khách hàng.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Quy trình chăm sóc khách hàng và upsell hiệu quả.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- CTA SECTION --- */}
                <section className="py-24 bg-gradient-to-r from-[#CDAD5A]/10 to-[#0b0b0f] border-t border-[#CDAD5A]/20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-white font-playfair mb-6">BẠN ĐÃ SẴN SÀNG BỨT PHÁ?</h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            Đừng để năm 2026 trôi qua mà không có sự thay đổi nào. Hãy để tôi đồng hành cùng bạn trên con đường chinh phục tự do tài chính.
                        </p>
                        <button
                            onClick={handleZaloContact}
                            className="px-10 py-5 bg-[#CDAD5A] text-black font-extrabold text-xl rounded-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(205,173,90,0.6)] transition-all animate-pulse-slow"
                        >
                            👉 LIÊN HỆ ZALO NGAY 0789.284.078
                        </button>
                        <p className="mt-4 text-gray-500 text-sm italic">*Số lượng học viên nhận Coaching 1-1 có hạn mỗi tháng</p>
                    </div>
                </section>

            </main>
            <Footer />

            {/* Styles */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }

        @keyframes pulseSlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(205, 173, 90, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(205, 173, 90, 0); }
        }
        .animate-pulse-slow { animation: pulseSlow 2s infinite; }
      `}</style>
        </div>
    );
}
