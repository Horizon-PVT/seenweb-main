import React from 'react';
import { useTranslation } from 'next-i18next';

const Testimonials: React.FC = () => {
  const { t } = useTranslation('common');

  const testimonials = [
    {
      quote: t('testimonials.1.quote', "Từ 0 views lên 100k views chỉ trong 1 videos nhờ công cụ đào ngách. Thật không thể tin nổi!"),
      author: "Phạm Văn Minh",
      channel: "Minh Review Tech",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: t('testimonials.2.quote', "Kịch bản AI viết quá hay, mình chỉ cần đọc theo. Tiết kiệm 80% thời gian nghĩ nội dung."),
      author: "Nguyễn Thị Hương",
      channel: "Life of Huong",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      quote: t('testimonials.3.quote', "Công cụ phân tích đối thủ giúp mình tìm ra lỗ hổng thị trường ngay lập tức."),
      author: "Trần Đức Thắng",
      channel: "Thắng Digital Marketing",
      avatar: "https://randomuser.me/api/portraits/men/86.jpg"
    },
    {
      quote: t('testimonials.4.quote', "Mình là newbie nhưng đã kiếm được $500 tháng đầu tiên nhờ làm theo roadmap."),
      author: "Lê Thanh Tú",
      channel: "Tú Making Money",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      quote: t('testimonials.5.quote', "Giọng đọc AI quá tự nhiên, không ai nhận ra là máy đọc luôn."),
      author: "Hoàng Văn Nam",
      channel: "Truyện Đêm Khuya",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg"
    },
  ];

  const allTestimonials = [...testimonials, ...testimonials]; // Duplicate for seamless scroll

  return (
    <section id="testimonials" className="py-20 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-playfair text-[#CDAD5A] mb-4">{t('testimonials.title', 'Cảm Nhận Từ Cộng Đồng')}</h2>
        <p className="text-xl text-gray-400 mb-12">{t('testimonials.subtitle', 'Những câu chuyện thành công thực tế')}</p>
        <div className="relative w-full">
          <div className="flex animate-scroll-left" style={{ animationDuration: '120s' }}>
            {allTestimonials.map((testimonial, index) => (
              <div key={index} className="flex-shrink-0 w-full md:w-[400px] px-4">
                <div className="h-full p-8 bg-black/40 border border-gray-800/50 flex flex-col items-center rounded-2xl hover:bg-gray-900/40 transition-colors">
                  <div className="flex items-center gap-4 mb-6 w-full">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-14 h-14 rounded-full border-2 border-[#CDAD5A]"
                    />
                    <div className="text-left">
                      <p className="font-bold text-[#CDAD5A] text-lg">{testimonial.author}</p>
                      <p className="text-sm text-[#008080] font-medium">{testimonial.channel}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic text-left leading-relaxed">"{testimonial.quote}"</p>
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