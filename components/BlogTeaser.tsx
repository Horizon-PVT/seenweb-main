import Link from 'next/link';

const posts = [
  { number: 1, title: "Top 10 Công Cụ AI YouTube Tốt Nhất 2025 – Dễ Viral, Rank Cao", excerpt: "Review top 10 tool AI YouTube...", slug: "/blog/top-10-cong-cu-ai-youtube-2025" },
  { number: 2, title: "Công Cụ Text To Speech Tiếng Việt Tự Nhiên Cho YouTube", excerpt: "Voice AI tiếng Việt pro...", slug: "/blog/cong-cu-text-to-speech-tieng-viet-tu-nhien-cho-youtube" },
  { number: 3, title: "Công Cụ SEO YouTube Title Description Tag 2025", excerpt: "Tối ưu SEO YouTube...", slug: "/blog/cong-cu-seo-youtube-title-description-tag-2025" },
  { number: 4, title: "Công Cụ AI Viết Kịch Bản YouTube Viral 2025", excerpt: "Viết script viral AI...", slug: "/blog/cong-cu-ai-viet-kich-ban-youtube-viral-2025" },
  { number: 5, title: "Công Cụ AI Tìm Ngách YouTube Kiếm Tiền Cao 2025", excerpt: "Tìm ngách vàng AI...", slug: "/blog/cong-cu-ai-tim-ngach-youtube-kiem-tien-cao-2025" },
  { number: 6, title: "Công Cụ AI Tạo Video Faceless Tự Động 2025", excerpt: "Video faceless tự động...", slug: "/blog/cong-cu-ai-tao-video-faceless-tu-dong-2025" },
  { number: 7, title: "Công Cụ AI Tạo Thumbnail YouTube Chuyên Nghiệp Miễn Phí", excerpt: "Thumbnail AI pro...", slug: "/blog/cong-cu-ai-tao-thumbnail-youtube-chuyen-nghiep-mien-phi" },
  { number: 8, title: "Công Cụ AI Phân Tích Đối Thủ YouTube Độc Quyền", excerpt: "Phân tích đối thủ...", slug: "/blog/cong-cu-ai-phan-tich-doi-thu-youtube-doc-quyen" },
  { number: 9, title: "Cách Tăng Retention YouTube Lên 70% Với AI", excerpt: "Tăng retention AI...", slug: "/blog/cach-tang-retention-youtube-len-70-voi-ai" },
  { number: 10, title: "Cách Làm Video YouTube Kiếm Tiền Với AI Cho Người Mới", excerpt: "Kiếm tiền YouTube AI...", slug: "/blog/cach-lam-video-youtube-kiem-tien-voi-ai-cho-nguoi-moi" },
];

const BlogTeaser: React.FC = () => {
  return (
    <section id="blog-section" className="py-12 bg-gradient-to-b from-[#0A1929] via-black to-[#0A1929]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-black text-center text-[#CDAD5A] mb-4 uppercase tracking-wider drop-shadow-lg">
          BLOG & TÀI NGUYÊN MIỄN PHÍ
        </h2>
        <p className="text-center text-gray-400 mb-6 text-base">
          Kiến thức chuyên sâu về YouTube + AI
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={post.slug}
              className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-lg p-4 border border-[#CDAD5A]/20 hover:border-[#CDAD5A] transition-all duration-300 group flex items-center gap-4 shadow-lg hover:shadow-[#CDAD5A]/30"
            >
              <span className="text-xl font-black text-[#CDAD5A] group-hover:scale-110 transition-transform flex-shrink-0">
                {post.number}.
              </span>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white group-hover:text-[#CDAD5A] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-1 mt-1">{post.excerpt}</p>
                <span className="text-[#008080] text-sm font-medium mt-2 inline-block group-hover:text-[#CDAD5A] transition-colors">Đọc ngay →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogTeaser;