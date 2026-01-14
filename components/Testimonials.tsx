import React from 'react';

const testimonials = [
  {
    quote: "Từ 0 views lên 100k views chỉ trong 1 videos nhờ công cụ đào ngách. Thật không thể tin nổi!",
    author: "Phạm Văn Minh",
    channel: "Minh Review Tech",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    quote: "Kịch bản AI viết quá hay, mình chỉ cần đọc theo. Tiết kiệm 80% thời gian nghĩ nội dung.",
    author: "Nguyễn Thị Hương",
    channel: "Life of Huong",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    quote: "Công cụ phân tích đối thủ giúp mình tìm ra lỗ hổng thị trường ngay lập tức.",
    author: "Trần Đức Thắng",
    channel: "Thắng Digital Marketing",
    avatar: "https://randomuser.me/api/portraits/men/86.jpg"
  },
  {
    quote: "Mình là newbie nhưng đã kiếm được $500 tháng đầu tiên nhờ làm theo roadmap.",
    author: "Lê Thanh Tú",
    channel: "Tú Making Money",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    quote: "Giọng đọc AI quá tự nhiên, không ai nhận ra là máy đọc luôn.",
    author: "Hoàng Văn Nam",
    channel: "Truyện Đêm Khuya",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg"
  },
  {
    quote: "MC Ảo giúp mình làm video tin tức mà không cần lộ mặt. Quá tuyệt!",
    author: "Phan Thị Mai",
    channel: "Global News Daily",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    quote: "Support nhiệt tình 1-1, mình chưa thấy bên nào chăm sóc kỹ như vậy.",
    author: "Đặng Văn Hùng",
    channel: "Hung Vlogs Official",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg"
  },
  {
    quote: "Gói PRO đáng từng đồng. ROI của mình là 500% sau 3 tháng.",
    author: "Vũ Thị Lan",
    channel: "Lan Business Talk",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg"
  },
  {
    quote: "Thư viện ngách giúp mình không bao giờ bí ý tưởng làm video.",
    author: "Ngô Văn Long",
    channel: "Long Creative Studio",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg"
  },
  {
    quote: "Tính năng dịch phụ đề và lồng tiếng giúp mình đánh thị trường Mỹ dễ dàng.",
    author: "Trịnh Văn Quân",
    channel: "Quân Global",
    avatar: "https://randomuser.me/api/portraits/men/91.jpg"
  },
  {
    quote: "Giao diện đơn giản, dễ dùng cho người không biết kỹ thuật như mình.",
    author: "Lý Thị Hà",
    channel: "Hà Kitchen",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    quote: "Nhờ SeenYT mà mình xây dựng được hệ thống 10 kênh vệ tinh tự động.",
    author: "Đỗ Văn Tam",
    channel: "Tam MMO Journey",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg"
  },
  {
    quote: "Khóa học đi kèm rất chất lượng, cầm tay chỉ việc từ A-Z.",
    author: "Bùi Văn Kiên",
    channel: "Kiên Crypto Currencies",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    quote: "Công cụ SEO chuẩn từng milimet, video nào đăng lên cũng xanh điểm SEO.",
    author: "Hồ Thị Thu",
    channel: "Thu Beauty & Spa",
    avatar: "https://randomuser.me/api/portraits/women/10.jpg"
  },
  {
    quote: "SeenYT là vũ khí bí mật giúp mình vượt qua đối thủ cạnh tranh.",
    author: "Dương Văn An",
    channel: "An Tech Reviews",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg"
  }
];

const allTestimonials = [...testimonials, ...testimonials]; // Duplicate for seamless scroll

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-playfair text-[#CDAD5A] mb-4">Cảm Nhận Từ Cộng Đồng</h2>
        <p className="text-xl text-gray-400 mb-12">Những câu chuyện thành công thực tế</p>
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