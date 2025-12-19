import Link from 'next/link';

export default function AffiliateLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Kiếm Tiền Trọn Đời Với <span className="text-cyan-400">SeenYT Affiliate</span>
        </h1>
        <p className="text-2xl md:text-3xl mb-8 max-w-4xl mx-auto">
          Giới thiệu tool AI YouTube hot nhất 2025 – Nhận <span className="text-yellow-400 font-bold">30% hoa hồng lần đầu</span> + <span className="text-green-400 font-bold">10% recurring hàng tháng</span>
        </p>
        <p className="text-xl mb-12 text-gray-300">Đã có hàng nghìn creator kiếm tiền ổn định từ SeenYT!</p>

        <Link href="/affiliate/dashboard">
          <button className="bg-cyan-600 text-2xl font-bold py-6 px-12 rounded-full hover:bg-cyan-500 transition-all shadow-2xl shadow-cyan-600/50">
            Tham Gia Ngay – Miễn Phí!
          </button>
        </Link>

        {/* Video Demo Placeholder */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
            <iframe 
              className="w-full h-96"
              src="https://www.youtube.com/embed/VIDEO_ID_DEMO_SEENYT" // Anh thay ID video demo SeenYT thật
              title="Demo SeenYT"
              allowFullScreen
            ></iframe>
          </div>
          <p className="mt-4 text-gray-400">Xem demo SeenYT tạo video AI chỉ trong 60 giây!</p>
        </div>
      </section>

      {/* Benefits + Tiers & Bonus */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Lợi ích cơ bản */}
          <div className="bg-gray-800 p-10 rounded-2xl border border-cyan-600">
            <h2 className="text-3xl font-bold mb-8">Lợi Ích Khi Tham Gia</h2>
            <ul className="space-y-6 text-xl">
              <li className="flex items-center"><span className="text-cyan-400 mr-4 text-3xl">✔</span> Hoa hồng cao: 30% lần đầu (104k-194k/user)</li>
              <li className="flex items-center"><span className="text-cyan-400 mr-4 text-3xl">✔</span> Recurring 10% mỗi tháng gia hạn</li>
              <li className="flex items-center"><span className="text-cyan-400 mr-4 text-3xl">✔</span> Cookie tracking 60 ngày</li>
              <li className="flex items-center"><span className="text-cyan-400 mr-4 text-3xl">✔</span> Rút tiền từ 1tr VND (ngày 20-25)</li>
              <li className="flex items-center"><span className="text-cyan-400 mr-4 text-3xl">✔</span> Material đầy đủ: banner, script review, swipe file</li>
              <li className="flex items-center"><span className="text-cyan-400 mr-4 text-3xl">✔</span> Group Telegram support riêng</li>
            </ul>
          </div>

          {/* Tier & Bonus */}
          <div className="bg-gradient-to-br from-purple-900 to-black p-10 rounded-2xl border border-purple-600">
            <h2 className="text-3xl font-bold mb-8">Tier Hoa Hồng & Bonus Đặc Biệt</h2>
            <ul className="space-y-6 text-xl">
              <li className="flex items-center"><span className="text-purple-400 mr-4 text-3xl">⭐</span> Tier 1: >10 user trả phí/tháng → tăng 35% hoa hồng lần đầu</li>
              <li className="flex items-center"><span className="text-purple-400 mr-4 text-3xl">⭐</span> Tier 2: >20 user/tháng → 40% + priority support</li>
              <li className="flex items-center"><span className="text-purple-400 mr-4 text-3xl">🏆</span> Top affiliate tháng: Bonus 5-10 triệu VND cash hoặc VIP miễn phí trọn đời</li>
              <li className="flex items-center"><span className="text-purple-400 mr-4 text-3xl">🎁</span> Seeding đặc biệt: Review video → hoa hồng 50% + VIP 12 tháng</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Cách Kiếm Tiền Chỉ 4 Bước</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-cyan-600 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">1</div>
            <p className="font-bold">Tham gia miễn phí</p>
            <p className="text-gray-400">Đăng nhập → bật affiliate → nhận link riêng</p>
          </div>
          <div className="text-center">
            <div className="bg-cyan-600 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">2</div>
            <p className="font-bold">Quảng bá link</p>
            <p className="text-gray-400">YouTube, TikTok, FB group, blog...</p>
          </div>
          <div className="text-center">
            <div className="bg-cyan-600 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">3</div>
            <p className="font-bold">User mua qua link</p>
            <p className="text-gray-400">Bạn nhận hoa hồng tự động</p>
          </div>
          <div className="text-center">
            <div className="bg-cyan-600 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">4</div>
            <p className="font-bold">Rút tiền dễ dàng</p>
            <p className="text-gray-400">Từ 1tr → chuyển khoản ngày 20-25</p>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-16 px-6 bg-gray-900/50">
        <h2 className="text-4xl font-bold text-center mb-12">Hàng Nghìn Creator Đã Kiếm Tiền Với SeenYT</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-2xl font-bold text-yellow-400 mb-4">50tr+/tháng</p>
            <p className="italic">"SeenYT giúp channel em growth 300% view!"</p>
            <p className="mt-4 font-bold">- Anh A, 100k sub YouTuber</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-2xl font-bold text-yellow-400 mb-4">20tr commission</p>
            <p className="italic">"Affiliate SeenYT là nguồn thu nhập passive tốt nhất!"</p>
            <p className="mt-4 font-bold">- Chị B, TikTok creator</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-2xl font-bold text-yellow-400 mb-4">Top 1 tháng</p>
            <p className="italic">"Bonus 10tr + VIP miễn phí – cảm ơn SeenYT!"</p>
            <p className="mt-4 font-bold">- Anh C, MMO blogger</p>
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
        <p className="mt-8 text-gray-400">
          Khi tham gia, bạn đồng ý với <Link href="/affiliate-terms" className="text-cyan-400 hover:underline">điều khoản chương trình</Link>.
        </p>
      </section>
    </div>
  );
}