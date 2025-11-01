import React from 'react';

const testimonials = [
  {
    quote: "Noir Aetheos là một cuộc cách mạng. Kênh của tôi đã tăng trưởng 450% chỉ trong 90 ngày ngắn ngủi. Không thể tin được!",
    author: "Nguyễn Anh Dũng",
    channel: "Kênh Sáng Tạo Việt"
  },
  {
    quote: "Công cụ phân tích đối thủ chính là 'vũ khí tối thượng'. Tôi đã khám phá ra những cơ hội mà trước đây mình không hề hay biết.",
    author: "Trần Thị Mai Lan",
    channel: "Góc Nhìn Kinh Doanh"
  },
  {
    quote: "Quy trình làm việc của tôi đã được tự động hóa hoàn toàn. Tiết kiệm hàng chục giờ mỗi tuần để tập trung vào nội dung chất lượng hơn.",
    author: "Lê Hoàng Minh",
    channel: "Hiệu Suất Tối Ưu"
  }
];

const allTestimonials = [...testimonials, ...testimonials]; // Duplicate for seamless scroll

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-playfair text-[#CDAD5A] mb-4">Tiếng Vang Của Tinh Hoa</h2>
        <p className="text-xl text-gray-400 mb-12">Lời Chứng Thực Từ Những Người Dẫn Đầu</p>
        <div className="relative w-full">
          <div className="flex animate-scroll-left" style={{animationDuration: '80s'}}>
            {allTestimonials.map((testimonial, index) => (
              <div key={index} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4">
                <div className="h-full p-8 bg-black/30 border border-gray-800/50 flex flex-col items-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#008080]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 12c-3.7 0-6.7 2.8-7 6.4.1 1 .9 1.6 2 1.6h10c1.1 0 1.9-.6 2-1.6-.3-3.6-3.3-6.4-7-6.4z"></path>
                    </svg>
                    <div className="absolute inset-0 border-2 border-[#008080] rounded-full animate-ping opacity-50"></div>
                  </div>
                  <p className="text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                  <p className="font-bold text-[#CDAD5A]">{testimonial.author}</p>
                  <p className="text-sm text-[#008080]">{testimonial.channel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;