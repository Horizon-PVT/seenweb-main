import Link from 'next/link';

const posts = [
  { number: 1, title: "Hướng dẫn lập kênh YouTube từ A-Z cho người mới 2025", excerpt: "Cầm tay chỉ việc tạo kênh chuyên nghiệp...", slug: "/blog/huong-dan-lap-kenh-youtube-2025" },
  { number: 2, title: "Hướng dẫn chọn ngách YouTube bền vững – tránh ngách chết", excerpt: "Tìm ngách CPM cao với SeenYT...", slug: "/blog/huong-dan-chon-ngach-youtube-ben-vung" },
  { number: 3, title: "10 sai lầm chết người khi làm YouTube – người mới hay mắc nhất", excerpt: "Tránh ngay để không bỏ cuộc sớm...", slug: "/blog/10-sai-lam-chet-nguoi-khi-lam-youtube" },
  { number: 4, title: "So sánh làm YouTube view Việt vs view ngoài – nên chọn cái nào?", excerpt: "Phân tích CPM thực tế...", slug: "/blog/so-sanh-view-viet-vs-view-ngoai" },
  { number: 5, title: "Làm thế nào để biết kênh YouTube đang được đề xuất mạnh?", excerpt: "Xem Analytics + cách tăng đề xuất...", slug: "/blog/cach-biet-kenh-duoc-de-xuat" },
];

const BlogTeaser: React.FC = () => {
  return (
    <section id="blog-section" className="py-10 bg-gradient-to-b from-[#0A1929] via-black to-[#0A1929]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-black text-center text-[#CDAD5A] mb-4 uppercase tracking-wider drop-shadow-lg">
          BLOG & TÀI NGUYÊN MIỄN PHÍ
        </h2>
        <p className="text-center text-gray-300 mb-6 text-base">
          Kiến thức chuyên sâu về YouTube + AI
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={post.slug}
              className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-lg p-4 border border-[#CDAD5A]/20 hover:border-[#CDAD5A] transition-all duration-300 group flex items-center gap-4 shadow-lg hover:shadow-[#CDAD5A]/30"
            >
              <span className="text-xl font-black text-[#CDAD5A] group-hover:scale-110 transition-transform">
                {post.number}.
              </span>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#CDAD5A] group-hover:text-white transition-colors line-clamp-2">
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