import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ChevronDown } from 'lucide-react';

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
        },
        {
            question: "Tôi cần có kỹ năng gì để sử dụng SeenYT không?",
            answer: "Không cần kỹ năng gì đặc biệt! Chỉ cần biết sử dụng máy tính cơ bản. Giao diện được thiết kế intuitive với hướng dẫn từng bước. Nếu bạn đọc được và làm theo, bạn có thể tạo video ngay trong ngày đầu tiên."
        },
        {
            question: "SeenYT có hỗ trợ trên điện thoại không?",
            answer: "Hiện tại SeenYT tối ưu nhất trên máy tính (Windows/Mac). Phiên bản web có thể truy cập từ điện thoại nhưng trải nghiệm tốt nhất là trên desktop. Chúng tôi đang phát triển app di động cho tương lai."
        },
        {
            question: "Video tạo ra có bị YouTube đánh bản quyền không?",
            answer: "Không. Video do SeenYT tạo ra sử dụng voiceover AI và nội dung do bạn nhập, không sao chép từ nguồn có bản quyền. Bạn sở hữu 100% bản quyền video. Tuy nhiên, nếu bạn nhập nội dung có bản quyền (nhạc, hình ảnh từ người khác) thì đó là trách nhiệm của bạn."
        },
        {
            question: "Tôi có được hoàn tiền nếu không hài lòng không?",
            answer: "Có. Chúng tôi cung cấp chính sách hoàn tiền trong 7 ngày đầu tiên nếu bạn không hài lòng với sản phẩm. Điều này cho thấy chúng tôi tự tin vào chất lượng dịch vụ và muốn bạn yên tâm khi đăng ký."
        },
        {
            question: "Tôi có thể dùng thử trước khi trả tiền không?",
            answer: "Có! Chúng tôi cung cấp gói Starter với giá 199K/tháng để bạn trải nghiệm. Ngoài ra, bạn có thể xem các video hướng dẫn trên YouTube và tham gia cộng đồng CreatorCamp miễn phí trước khi quyết định."
        },
        {
            question: "Koda Studio (Desktop App) khác gì phiên bản web?",
            answer: "Koda Studio là phiên bản desktop với các tính năng nâng cao: render video nhanh hơn, hỗ trợ nhiều workers cùng lúc, và không phụ thuộc internet. Phiên bản web phù hợp để bắt đầu, desktop app dành cho creator chuyên nghiệp cần sản lượng lớn."
        },
        {
            question: "SeenYT có cập nhật tính năng mới không?",
            answer: "Có! Chúng tôi liên tục cập nhật dựa trên feedback của người dùng. Các tính năng mới như Multilingual Studio, Intelligence Hub, và Rival Scanner được thêm thường xuyên. Bạn không phải trả thêm phí cho các cập nhật trong gói của mình."
        },
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
                                <span className={`transform transition-transform duration-300 text-[#CDAD5A] ${openIndex === index ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} />
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
