import React, { useState } from 'react';

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqItems = [
        {
            question: "Gói TOÀN TRI bao gồm những gì?",
            answer: "Gói TOÀN TRI mở khóa toàn bộ sức mạnh của SeenYT: tất cả các công cụ AI (Script Writer, SEO, Micro Niche Miner, Rival Scanner...), không giới hạn lượt sử dụng, và đặc biệt là quyền truy cập vào cộng đồng kín cùng các khóa học độc quyền để giúp bạn thành công trên YouTube."
        },
        {
            question: "SeenYT có thực sự là trí tuệ nhân tạo không?",
            answer: "Chính xác. SeenYT sử dụng các mô hình ngôn ngữ lớn (LLM) và kỹ thuật phân tích dữ liệu tiên tiến nhất hiện nay (Gemini Pro/Flash, Google Search Grounding) để phân tích thị trường, sáng tạo nội dung và tối ưu hóa video theo thời gian thực."
        },
        {
            question: "Tôi cần kiến thức lập trình hay AI để sử dụng không?",
            answer: "Hoàn toàn không. Chúng tôi thiết kế SeenYT để bất kỳ ai cũng có thể sử dụng. Giao diện thân thiện, trực quan, chỉ cần nhập ý tưởng và để AI lo phần còn lại."
        },
        {
            question: "Có bản dùng thử miễn phí không?",
            answer: "Có! Bạn có thể bắt đầu với gói FREE, trải nghiệm các tính năng cốt lõi (3 lượt/ngày) để cảm nhận hiệu quả trước khi quyết định nâng cấp lên các gói cao cấp hơn."
        },
        {
            question: "Làm thế nào để tham gia cộng đồng SEENYT?",
            answer: "Rất đơn giản. Hãy bấm vào nút 'Đăng ký CỘNG ĐỒNG SEENYT' hoặc tham gia nhóm Zalo của chúng tôi để giao lưu, học hỏi kinh nghiệm từ hàng ngàn sáng tạo nội dung khác."
        },
        {
            question: "Tôi có thể hủy đăng ký bất cứ lúc nào không?",
            answer: "Tất nhiên. Chúng tôi không bao giờ ràng buộc bạn. Bạn có thể sử dụng theo tháng và dừng bất cứ khi nào bạn muốn, mặc dù chúng tôi tin rằng giá trị bạn nhận được sẽ khiến bạn muốn gắn bó lâu dài."
        },
        {
            question: "Tại sao nên chọn TOÀN TRI ngay hôm nay?",
            answer: "Vì YouTube đang thay đổi từng giờ. Gói TOÀN TRI cung cấp cho bạn 'vũ khí' lợi hại nhất để đi tắt đón đầu, tìm ra các ngách chưa ai khai phá và xây dựng đế chế nội dung của riêng bạn ngay bây giờ với chi phí tối ưu nhất."
        }
    ];

    return (
        <section id="faq" className="py-24 bg-gradient-to-b from-gray-900/50 to-black">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-4xl md:text-5xl font-playfair text-[#CDAD5A] text-center mb-16">
                    CÂU HỎI THƯỜNG GẶP
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
                    <p className="text-xl text-gray-300 mb-6 font-light italic">Sẵn sàng bước vào trận chiến?</p>
                    <a
                        href="#pricing"
                        className="inline-block bg-[#008080] text-white font-bold py-4 px-12 text-lg border-2 border-[#008080] rounded-sm transition-all duration-300 transform hover:scale-105 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow"
                    >
                        Chọn Gói TOÀN TRI Ngay
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
