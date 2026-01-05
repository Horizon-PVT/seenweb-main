
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const CoachingSection: React.FC = () => {
    const router = useRouter();

    const handleZaloContact = () => {
        window.open('https://zalo.me/0789284078', '_blank');
    };

    return (
        <section className="relative py-20 bg-[#0b0b0f] overflow-hidden border-y border-[#CDAD5A]/10">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#CDAD5A]/5 to-transparent pointer-events-none"></div>

            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">

                {/* Text Content */}
                <div className="w-full md:w-1/2 z-10">
                    <div className="inline-block px-3 py-1 bg-[#CDAD5A]/10 border border-[#CDAD5A]/30 rounded-full mb-4">
                        <span className="text-[#CDAD5A] text-xs font-bold tracking-widest uppercase">Premium Service</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white font-playfair mb-6 leading-tight">
                        Coaching 1-1 <br />
                        <span className="text-[#CDAD5A]">YouTube & Affiliate</span>
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                        Bạn muốn đi nhanh hơn và xa hơn? Chương trình huấn luyện cá nhân hóa giúp bạn xây dựng đế chế nội dung số và tạo thu nhập thụ động bền vững cùng Mr. Seen.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleZaloContact}
                            className="px-6 py-3 bg-[#CDAD5A] text-black font-bold uppercase tracking-wider hover:bg-white hover:shadow-[0_0_15px_rgba(205,173,90,0.5)] transition-all rounded-sm text-sm"
                        >
                            Liên hệ Zalo Tư Vấn
                        </button>
                        <Link
                            href="/coaching"
                            className="px-6 py-3 border border-white/20 text-white font-bold uppercase tracking-wider hover:border-[#CDAD5A] hover:text-[#CDAD5A] transition-all rounded-sm text-sm flex items-center justify-center"
                        >
                            Tìm Hiểu Thêm
                        </Link>
                    </div>
                </div>

                {/* Image Content */}
                <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f] to-transparent z-10 md:hidden"></div>
                    <div className="relative w-full h-full border border-white/10 rounded-sm overflow-hidden group cursor-pointer">
                        <Image
                            src="/images/mrseen/hero-coaching-new.png"
                            alt="Mr Seen Coaching"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                        />
                        {/* Overlay Badge */}
                        <div className="absolute bottom-6 right-6 z-20 bg-black/80 backdrop-blur-sm border border-[#CDAD5A] p-4 rounded-sm shadow-xl hidden md:block">
                            <p className="text-[#CDAD5A] font-bold text-2xl">High-Ticket</p>
                            <p className="text-gray-300 text-xs text-right">Mastery Program</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CoachingSection;
