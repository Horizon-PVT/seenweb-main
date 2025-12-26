import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AffiliateLanding() {
  // Counter affiliate tham gia (bắt đầu 3000+, tăng dần, reset loop)
  const [affiliateCount, setAffiliateCount] = useState(3000);

  useEffect(() => {
    const interval = setInterval(() => {
      setAffiliateCount((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 3;
        return next > 3500 ? 3000 : next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Top Nav */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="cursor-pointer text-sm md:text-base text-gray-200 hover:text-white">
              ← Về trang chủ
            </span>
          </Link>

          <Link href="/affiliate/dashboard">
            <span className="cursor-pointer text-sm md:text-base text-cyan-300 hover:text-cyan-200">
              Dashboard Affiliate
            </span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/affiliate/hero-bg.jpg"
            alt="Hero background"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">
            Kiếm Tiền Trọn Đời Với SeenYT Affiliate
          </h1>
          <p className="text-2xl md:text-4xl mb-8 font-semibold drop-shadow-lg">
            Giới thiệu tool AI YouTube hot nhất 2025 – Nhận{' '}
            <span className="text-yellow-400 font-bold">30% hoa hồng lần đầu</span> +{' '}
            <span className="text-green-400 font-bold">10% recurring hàng tháng</span>
          </p>
          <p className="text-xl md:text-2xl mb-12 text-gray-200 drop-shadow-lg">
            Đã có{' '}
            <span className="text-cyan-400 font-bold text-4xl">
              {affiliateCount.toLocaleString('vi-VN')}+
            </span>{' '}
            creator tham gia và kiếm tiền ổn định từ SeenYT!
          </p>

          <Link href="/affiliate/dashboard">
            <button className="bg-cyan-600 text-2xl md:text-3xl font-bold py-6 px-12 rounded-full hover:bg-cyan-500 transition-all shadow-2xl shadow-cyan-600/50 animate-pulse">
              Tham Gia Ngay – Miễn Phí!
            </button>
          </Link>

          {/* Video Demo với thumbnail fallback luôn hiện */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <iframe
                className="w-full h-96"
                src="https://www.youtube.com/embed/THAY_ID_VIDEO_DEMO_TAI_DAY" // Anh thay ID thật
                title="Demo SeenYT"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              {/* Fallback thumbnail nếu iframe chậm */}
              <div className="absolute inset-0 pointer-events-none">
                <img
                  src="/images/affiliate/video-thumbnail.jpg"
                  alt="Demo SeenYT"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="bg-white/20 rounded-full p-8">
                    <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l7-5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-400 text-center text-lg">
              Xem demo SeenYT tạo video AI chỉ trong 60 giây!
            </p>
          </div>
        </div>
      </section>

      {/* Benefits + Tiers & Bonus */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="bg-gray-800 p-10 rounded-2xl border border-cyan-600">
            <h2 className="text-3xl font-bold mb-8">Lợi Ích Khi Tham Gia</h2>
            <ul className="space-y-6 text-xl">
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> Hoa hồng cao: 30% lần đầu
                (104k-194k/user)
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> Recurring 10% mỗi tháng gia
                hạn
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> Cookie tracking 60 ngày
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> Rút tiền từ 1tr VND (ngày
                20-25)
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> Material đầy đủ: banner,
                script review, swipe file
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> Group Telegram support riêng
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-black p-10 rounded-2xl border border-purple-600">
            <h2 className="text-3xl font-bold mb-8">Tier Hoa Hồng & Bonus Đặc Biệt</h2>
            <ul className="space-y-6 text-xl">
              <li className="flex items-center">
                <span className="text-purple-400 mr-4 text-3xl">⭐</span> Tier 1: &gt;10 user trả
                phí/tháng → tăng 35% hoa hồng lần đầu
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-4 text-3xl">⭐</span> Tier 2: &gt;20 user/tháng →
                40% + priority support
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-4 text-3xl">🏆</span> Top affiliate tháng: Bonus
                5-10 triệu VND cash hoặc VIP miễn phí trọn đời
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-4 text-3xl">🎁</span> Seeding đặc biệt: Review
                video → hoa hồng 50% + VIP 12 tháng
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Cách Kiếm Tiền Chỉ 4 Bước</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <img
              src="/images/affiliate/icon-step1.png"
              alt="Step 1"
              className="w-24 h-24 mx-auto mb-4"
            />
            <p className="font-bold">Tham gia miễn phí</p>
            <p className="text-gray-400">Đăng nhập → bật affiliate → nhận link riêng</p>
          </div>
          <div className="text-center">
            <img
              src="/images/affiliate/icon-step2.png"
              alt="Step 2"
              className="w-24 h-24 mx-auto mb-4"
            />
            <p className="font-bold">Quảng bá link</p>
            <p className="text-gray-400">YouTube, TikTok, FB group, blog...</p>
          </div>
          <div className="text-center">
            <img
              src="/images/affiliate/icon-step3.png"
              alt="Step 3"
              className="w-24 h-24 mx-auto mb-4"
            />
            <p className="font-bold">User mua qua link</p>
            <p className="text-gray-400">Bạn nhận hoa hồng tự động</p>
          </div>
          <div className="text-center">
            <img
              src="/images/affiliate/icon-step4.png"
              alt="Step 4"
              className="w-24 h-24 mx-auto mb-4"
            />
            <p className="font-bold">Rút tiền dễ dàng</p>
            <p className="text-gray-400">Từ 1tr → chuyển khoản ngày 20-25</p>
          </div>
        </div>
      </section>

      {/* Social Proof - Carousel loop mượt (inline style + keyframe) */}
      <section className="py-16 px-6 bg-gray-900/50 overflow-hidden">
        <h2 className="text-4xl font-bold text-center mb-12">
          Hàng Nghìn Creator Đã Kiếm Tiền Với SeenYT
        </h2>
        <div className="relative">
          <div className="flex" style={{ animation: 'scroll 60s linear infinite', gap: '2rem' }}>
            {/* Duplicate 2 lần để loop mượt */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex" style={{ gap: '2rem' }}>
                <div className="min-w-[350px] bg-gray-800 p-6 rounded-xl text-center">
                  <img
                    src="/images/affiliate/testimonial1.jpg"
                    alt="Minh Hải"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-2xl font-bold text-yellow-400 mb-4">50tr+/tháng</p>
                  <p className="italic mb-4">"SeenYT giúp channel em growth 300% view!"</p>
                  <p className="font-bold">- Minh Hải (100k sub YouTuber)</p>
                </div>
                <div className="min-w-[350px] bg-gray-800 p-6 rounded-xl text-center">
                  <img
                    src="/images/affiliate/testimonial2.jpg"
                    alt="Lan Anh"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-2xl font-bold text-yellow-400 mb-4">30tr commission</p>
                  <p className="italic mb-4">"Affiliate SeenYT là passive income tốt nhất!"</p>
                  <p className="font-bold">- Lan Anh TikTok</p>
                </div>
                <div className="min-w-[350px] bg-gray-800 p-6 rounded-xl text-center">
                  <img
                    src="/images/affiliate/testimonial3.jpg"
                    alt="Tuấn Kiệt"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-2xl font-bold text-yellow-400 mb-4">Top 1 tháng</p>
                  <p className="italic mb-4">"Bonus 10tr + VIP – cảm ơn SeenYT!"</p>
                  <p className="font-bold">- Tuấn Kiệt MMO</p>
                </div>
                <div className="min-w-[350px] bg-gray-800 p-6 rounded-xl text-center">
                  <img
                    src="/images/affiliate/testimonial1.jpg"
                    alt="Vũ Long"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-2xl font-bold text-yellow-400 mb-4">40tr+/tháng</p>
                  <p className="italic mb-4">"Từ 0 đến 40tr chỉ 3 tháng!"</p>
                  <p className="font-bold">- Vũ Long Creator</p>
                </div>
                <div className="min-w-[350px] bg-gray-800 p-6 rounded-xl text-center">
                  <img
                    src="/images/affiliate/testimonial2.jpg"
                    alt="Hương Ly"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-2xl font-bold text-yellow-400 mb-4">25tr passive</p>
                  <p className="italic mb-4">"Recurring ổn định mỗi tháng!"</p>
                  <p className="font-bold">- Hương Ly TikToker</p>
                </div>
                <div className="min-w-[350px] bg-gray-800 p-6 rounded-xl text-center">
                  <img
                    src="/images/affiliate/testimonial3.jpg"
                    alt="Đức Anh"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-2xl font-bold text-yellow-400 mb-4">Bonus 10tr</p>
                  <p className="italic mb-4">"Tool AI tốt nhất cho creator Việt!"</p>
                  <p className="font-bold">- Đức Anh Tech Review</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inline keyframe chắc chắn chạy */}
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </section>

      {/* Hướng dẫn quảng bá chi tiết theo nền tảng */}
      <section className="py-16 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Hướng Dẫn Quảng Bá Hiệu Quả Theo Nền Tảng
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 text-red-400">YouTube (Hiệu quả cao nhất)</h3>
            <ol className="list-decimal pl-6 space-y-3 text-gray-300 mb-6">
              <li>Quay video review SeenYT (demo "Tìm kênh ẩn" + "Micro niches").</li>
              <li>Thêm link affiliate vào description + card video + pinned comment.</li>
              <li>End screen CTA "Link affiliate description – kiếm hoa hồng 30%".</li>
              <li>Post community tab với banner + link.</li>
            </ol>
            <img src="/images/affiliate/banner-yt.jpg" alt="Banner YouTube" className="w-full rounded mb-4" />
            <a
              href="/images/affiliate/banner-yt.jpg"
              download
              className="block text-center bg-red-600 py-2 rounded hover:bg-red-700"
            >
              Tải Banner YouTube
            </a>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Facebook (Traffic nhanh)</h3>
            <ol className="list-decimal pl-6 space-y-3 text-gray-300 mb-6">
              <li>Post vào group MMO/YouTuber Việt Nam (2-3 post/tuần).</li>
              <li>Content: "Tool AI YouTube SeenYT giúp em kiếm thêm 20tr/tháng affiliate – link join".</li>
              <li>Đính kèm banner + link affiliate.</li>
              <li>Comment boost post của người khác về tool YouTube.</li>
            </ol>
            <img src="/images/affiliate/banner-fb.jpg" alt="Banner Facebook" className="w-full rounded mb-4" />
            <a
              href="/images/affiliate/banner-fb.jpg"
              download
              className="block text-center bg-blue-600 py-2 rounded hover:bg-blue-700"
            >
              Tải Banner Facebook
            </a>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 text-pink-400">TikTok (Viral trẻ)</h3>
            <ol className="list-decimal pl-6 space-y-3 text-gray-300 mb-6">
              <li>Quay video ngắn demo SeenYT (15-30s).</li>
              <li>Text on screen "Tool AI YouTube kiếm tiền – link bio affiliate 30%".</li>
              <li>Hashtag #SeenYT #Affiliate #KiếmTiềnYouTube #ToolAI.</li>
              <li>Duet/Stitch video creator khác nói về YouTube tool.</li>
            </ol>
            <img src="/images/affiliate/banner-tiktok.jpg" alt="Banner TikTok" className="w-full rounded mb-4" />
            <a
              href="/images/affiliate/banner-tiktok.jpg"
              download
              className="block text-center bg-pink-600 py-2 rounded hover:bg-pink-700"
            >
              Tải Banner TikTok Story
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Sẵn Sàng Kiếm Tiền Trọn Đời?</h2>
        <Link href="/affiliate/dashboard">
          <button className="bg-cyan-600 text-3xl font-bold py-8 px-16 rounded-full hover:bg-cyan-500 transition-all shadow-2xl shadow-cyan-600/50">
            Tham Gia Affiliate Ngay Hôm Nay
          </button>
        </Link>
      </section>
    </div>
  );
}
