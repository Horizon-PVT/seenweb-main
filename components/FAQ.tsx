import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';

const FAQ: React.FC = () => {
    const { t } = useTranslation('common');
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqItems = [
        {
            question: t('faq.q1', "Tôi là người mới hoàn toàn, SeenYT có dễ dùng không?"),
            answer: t('faq.a1', "Cực kỳ dễ! Chúng tôi thiết kế giao diện dành riêng cho người không rành công nghệ. Có quy trình 3 bước cầm tay chỉ việc, bạn chỉ cần làm theo hướng dẫn là có video.")
        },
        {
            question: t('faq.q2', "SeenYT có giúp video của tôi lên xu hướng không?"),
            answer: t('faq.a2', "Có! Công cụ của chúng tôi sử dụng AI để phân tích thuật toán YouTube, tìm ra các chủ đề đang hot và hướng dẫn bạn cách tối ưu (SEO, Thumbnail, Kịch bản) để tăng tối đa cơ hội được đề xuất.")
        },
        {
            question: t('faq.q3', "Tôi có thể kiếm tiền từ các video tạo bởi SeenYT không?"),
            answer: t('faq.a3', "Chắc chắn rồi. Bạn sở hữu 100% bản quyền video tạo ra. Rất nhiều người dùng của chúng tôi đã bật kiếm tiền và nhận doanh thu từ YouTube cũng như Affiliate.")
        }
    ];

    return (
        <section id="faq" className="py-24 bg-gradient-to-b from-gray-900/50 to-black">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-4xl md:text-5xl font-playfair text-[#CDAD5A] text-center mb-16">
                    {t('faq.title', 'CÂU HỎI THƯỜNG GẶP')}
                </h2>

                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <div
                            key={index}
                            className="border border-gray-800 rounded-lg overflow-hidden bg-black/40 transition-all duration-300 hover:border-[#CDAD5A]/30 hover:shadow-[0_0_15px_rgba(205,173,90,0.1)]"
                        >
                            <button
                                className="w-full text-left p-6 flex justify-between items-center focus:outline-none group"
                                onClick={() => toggleAccordion(index)}
                            >
                                <span className={`text-lg md:text-xl font-medium transition-colors duration-300 ${openIndex === index ? 'text-[#CDAD5A]' : 'text-white group-hover:text-[#CDAD5A]'}`}>
                                    {item.question}
                                </span>
                                <span className={`transform transition-transform duration-300 text-[#CDAD5A] text-2xl ${openIndex === index ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            <div
                                className={`transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-gray-800/50">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <p className="text-xl text-gray-300 mb-6 font-light italic">{t('faq.cta_text', 'Sẵn sàng bước vào trận chiến?')}</p>
                    <a
                        href="#pricing"
                        className="inline-block bg-[#008080] text-white font-bold py-4 px-12 text-lg border-2 border-[#008080] rounded-sm transition-all duration-300 transform hover:scale-105 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow"
                    >
                        {t('faq.cta_button', 'Chọn Gói TOÀN TRI Ngay')}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
