import Link from 'next/link';

export default function PromotionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12">Chi Tiết Các Chương Trình Khuyến Mãi</h1>

        <div className="grid md:grid-cols-3 gap-12 mb-20">
          {/* Event Tết */}
          <div className="bg-gradient-to-br from-red-900 to-black p-8 rounded-2xl border border-red-600">
            <h2 className="text-3xl font-bold mb-6">Tết Bính Ngọ – Double Commission</h2>
            <img src="/images/promotion/poster-tet-2026.jpg" alt="Event Tết" className="w-full rounded-xl mb-6" />
            <ul className="space-y-4 text-lg">
              <li>• Thời gian: 25/12/2025 – 28/2/2026</li>
              <li>• Double 60% hoa hồng lần đầu cho tất cả sale mới</li>
              <li>• Top 10: Bonus thêm 20% tổng commission</li>
              <li>• Top 1: iPhone 17 Pro hoặc 20 triệu cash</li>
              <li>• Review Tết theme: Bonus đặc biệt 70%</li>
            </ul>
            <p className="mt-6 font-bold">Cách tham gia: Đăng ký affiliate và quảng bá ngay!</p>
          </div>

          {/* User Mới */}
          <div className="bg-gradient-to-br from-blue-900 to-black p-8 rounded-2xl border border-blue-600">
            <h2 className="text-3xl font-bold mb-6">Welcome New User – Giảm 50% Tháng Đầu</h2>
            <img src="/images/promotion/poster-new-user.jpg" alt="User Mới" className="w-full rounded-xl mb-6" />
            <ul className="space-y-4 text-lg">
              <li>• Giảm 50% tháng đầu cho gói Sáng Tạo/Toàn Tri</li>
              <li>• Tặng thêm 7 ngày trial feature VIP</li>
              <li>• Hỗ trợ onboarding qua Telegram</li>
            </ul>
            <p className="mt-6 font-bold">Cách tham gia: Đăng ký tài khoản mới và chọn gói</p>
          </div>

          {/* Nâng Gói VIP */}
          <div className="bg-gradient-to-br from-purple-900 to-black p-8 rounded-2xl border border-purple-600">
            <h2 className="text-3xl font-bold mb-6">Ultimate Upgrade – VIP Trọn Đời + Bonus Triệu Đô</h2>
            <img src="/images/promotion/poster-upgrade-vip.jpg" alt="Nâng VIP" className="w-full rounded-xl mb-6" />
            <ul className="space-y-4 text-lg">
              <li>• VIP trọn đời + bonus 10tr cash</li>
              <li>• Zoom 1-1 đào tạo KDP Amazon + YouTube affiliate</li>
              <li>• 100+ template/script AI ready-to-use</li>
              <li>• Priority support 24/7 + group VIP creator</li>
            </ul>
            <p className="mt-6 font-bold">Cách tham gia: Liên hệ nâng gói VIP</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/">
            <button className="bg-cyan-600 py-4 px-12 rounded-full text-2xl font-bold hover:bg-cyan-500">
              Quay Về Trang Chủ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}