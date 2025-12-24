import React from 'react';
import Link from 'next/link';

export default function PromotionCarousel() {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
          Chương Trình Khuyến Mãi & Affiliate Hot
        </h2>

        {/* Carousel với số thứ tự + tốc độ nhanh hơn */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-fast gap-8">
            {/* Duplicate để loop mượt */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-8">
                {/* 1. Affiliate Cơ Bản */}
                <div className="min-w-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Link href="/affiliate">
                    <img src="/images/promotion/poster-affiliate-basic.jpg" alt="Affiliate Cơ Bản" className="w-full h-auto" />
                    <div className="bg-gradient-to-t from-cyan-900 to-transparent p-6 text-center">
                      <button className="bg-cyan-600 py-3 px-8 rounded-full text-xl font-bold hover:bg-cyan-500">
                        Tham Gia Affiliate
                      </button>
                    </div>
                  </Link>
                </div>

                {/* 2. Tier & Bonus Affiliate */}
                <div className="min-w-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Link href="/affiliate">
                    <img src="/images/promotion/poster-tier-bonus.jpg" alt="Tier & Bonus" className="w-full h-auto" />
                    <div className="bg-gradient-to-t from-purple-900 to-transparent p-6 text-center">
                      <button className="bg-purple-600 py-3 px-8 rounded-full text-xl font-bold hover:bg-purple-500">
                        Xem Tier & Bonus
                      </button>
                    </div>
                  </Link>
                </div>

                {/* 3. Event Tết */}
                <div className="min-w-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Link href="/promotions">
                    <img src="/images/promotion/poster-tet-2026.jpg" alt="Event Tết" className="w-full h-auto" />
                    <div className="bg-gradient-to-t from-red-900 to-transparent p-6 text-center">
                      <button className="bg-red-600 py-3 px-8 rounded-full text-xl font-bold hover:bg-red-500">
                        Tham Gia Event Tết
                      </button>
                    </div>
                  </Link>
                </div>

                {/* 4. User Mới */}
                <div className="min-w-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Link href="/promotions">
                    <img src="/images/promotion/poster-new-user.jpg" alt="User Mới" className="w-full h-auto" />
                    <div className="bg-gradient-to-t from-blue-900 to-transparent p-6 text-center">
                      <button className="bg-blue-600 py-3 px-8 rounded-full text-xl font-bold hover:bg-blue-500">
                        Đăng Ký Ngay
                      </button>
                    </div>
                  </Link>
                </div>

                {/* 5. Nâng Gói VIP */}
                <div className="min-w-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Link href="/promotions">
                    <img src="/images/promotion/poster-upgrade-vip.jpg" alt="Nâng VIP" className="w-full h-auto" />
                    <div className="bg-gradient-to-t from-purple-900 to-transparent p-6 text-center">
                      <button className="bg-yellow-600 py-3 px-8 rounded-full text-xl font-bold hover:bg-yellow-500">
                        Nâng Gói VIP
                      </button>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Số thứ tự carousel (1/5, 2/5...) */}
          <div className="flex justify-center mt-8 gap-2">
            {[1,2,3,4,5].map((num) => (
              <div key={num} className="w-3 h-3 bg-gray-600 rounded-full"></div>
            ))}
          </div>
        </div>

        {/* CSS tăng tốc + loop mượt */}
        <style jsx>{`
          .animate-scroll-fast {
            display: flex;
            animation: scroll 30s linear infinite;
          }
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </section>
  );
}