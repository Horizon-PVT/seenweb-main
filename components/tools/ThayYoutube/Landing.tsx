import React, { useState } from "react";
import Image from "next/image";
import OnboardingModal from "./OnboardingModal";

const Landing: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#1F291D] text-[#F3EFE0] font-sans">
            {/* HERO */}
            <div className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-bold text-sm tracking-wide animate-fade-in-up">
                        🔥 TOOL MỚI NHẤT TRÊN SEENYT
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in-up delay-100">
                        THẦY <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">YOUTUBE</span>
                        <br />
                        <span className="text-3xl md:text-5xl font-light text-[#F3EFE0]/90">
                            Giáo Án 30 Ngày Cầm Tay Chỉ Việc
                        </span>
                    </h1>
                    <p className="text-xl text-[#F3EFE0]/60 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
                        Không còn mơ hồ. Không còn đoán mò.
                        Một lộ trình chi tiết từng ngày, từng giờ, từng video giúp bạn đạt
                        <strong className="text-white"> 1.000 Subscribers</strong> đầu tiên trong 30 ngày.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] hover:scale-105 transition-all duration-300"
                        >
                            BẮT ĐẦU NGAY (MIỄN PHÍ)
                        </button>
                        <button className="px-8 py-4 bg-white/5 border border-white/10 text-[#F3EFE0] font-bold text-lg rounded-full hover:bg-white/10 transition-all">
                            XEM DEMO GIÁO ÁN
                        </button>
                    </div>
                </div>
            </div>

            {/* FEATURES */}
            <div className="container mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Ngày 0-10: Khởi Động (Free)",
                            desc: "Xây dựng tư duy, chọn ngách đúng, đăng video đầu tiên và vượt qua nỗi sợ.",
                            icon: "🚀"
                        },
                        {
                            title: "Ngày 11-20: Tăng Tốc (VVIP)",
                            desc: "Tối ưu hóa Retention, học cách viết Hook viral và giữ chân khán giả.",
                            icon: "⚡"
                        },
                        {
                            title: "Ngày 21-30: Về Đích (VVIP)",
                            desc: "Xây dựng series, biến người xem thành Fan trung thành và bắt đầu kiếm tiền.",
                            icon: "🏆"
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all">
                            <div className="text-4xl mb-4">{item.icon}</div>
                            <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                            <p className="text-[#F3EFE0]/60">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <OnboardingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={onComplete}
            />
        </div>
    );
};

export default Landing;
