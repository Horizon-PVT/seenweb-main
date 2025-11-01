import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <section id="about" className="py-20 bg-black/50 border-y border-gray-800/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-playfair text-[#CDAD5A] mb-4">Sứ Mệnh Khai Sáng</h2>
                    <p className="text-xl text-gray-400">Về SeenYT - Một sản phẩm của Công Ty Cổ Phần Dịch Vụ Quốc Tế VTC</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-playfair text-white mb-3">Sứ Mệnh Của Chúng Tôi</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Tại SeenYT, sứ mệnh của chúng tôi là san phẳng sân chơi sáng tạo, trao vào tay mỗi nhà sáng tạo nội dung YouTube những công cụ AI quyền năng nhất. Chúng tôi tin rằng mọi tiếng nói đều xứng đáng được lắng nghe, và công nghệ là chìa khóa để phá vỡ mọi rào cản, biến ý tưởng táo bạo nhất thành hiện thực có sức lan tỏa toàn cầu.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-playfair text-white mb-3">Tầm Nhìn Tương Lai</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Chúng tôi hướng đến một tương lai nơi SeenYT không chỉ là một bộ công cụ, mà là một đồng minh chiến lược, một bộ não thứ hai cho mọi YouTuber. Một hệ sinh thái thông minh, liên tục học hỏi và phát triển cùng người dùng, giúp họ không chỉ bắt kịp mà còn định hình các xu hướng của ngày mai.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                         <div className="group flex items-start gap-4 p-4 transition-all duration-300 hover:bg-gray-900/50 rounded-lg">
                            <div className="w-12 h-12 flex-shrink-0 text-[#008080] group-hover:text-[#00ffc8] transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L11 12l4.293 4.293a1 1 0 01-1.414 1.414L10 13.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 12 4.293 7.707a1 1 0 011.414-1.414L10 10.586l4.293-4.293a1 1 0 011.414 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-white group-hover:text-[#CDAD5A] transition-colors">Đổi Mới Vượt Bậc</h4>
                                <p className="text-sm text-gray-400">Luôn đi đầu trong việc nghiên cứu và ứng dụng những công nghệ AI đột phá nhất vào quy trình sáng tạo nội dung.</p>
                            </div>
                        </div>
                         <div className="group flex items-start gap-4 p-4 transition-all duration-300 hover:bg-gray-900/50 rounded-lg">
                            <div className="w-12 h-12 flex-shrink-0 text-[#008080] group-hover:text-[#00ffc8] transition-colors duration-300">
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-white group-hover:text-[#CDAD5A] transition-colors">Minh Bạch Tuyệt Đối</h4>
                                <p className="text-sm text-gray-400">Cung cấp dữ liệu và phân tích chính xác, dễ hiểu, giúp nhà sáng tạo đưa ra quyết định dựa trên sự thật, không phải phỏng đoán.</p>
                            </div>
                        </div>
                         <div className="group flex items-start gap-4 p-4 transition-all duration-300 hover:bg-gray-900/50 rounded-lg">
                            <div className="w-12 h-12 flex-shrink-0 text-[#008080] group-hover:text-[#00ffc8] transition-colors duration-300">
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-white group-hover:text-[#CDAD5A] transition-colors">Trao Quyền Toàn Diện</h4>
                                <p className="text-sm text-gray-400">Mọi tính năng đều được thiết kế với mục tiêu cuối cùng là trao quyền cho người dùng, giúp họ tự chủ và bứt phá giới hạn sáng tạo của bản thân.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;