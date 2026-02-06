import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Copy, Clock, Gift, Tag, Ticket, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Promotion {
  id: string;
  code: string;
  type: string;
  value: string; // Decimal comes as string or number depending on serialization
  promotionType: string;
  startDate: string | null;
  endDate: string | null;
  minOrder: string | null;
  description: string | null;
  imageUrl: string | null;
}

interface PromotionsPageProps {
  promotions: Promotion[];
}

export default function PromotionsPage({ promotions }: PromotionsPageProps) {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <Head>
        <title>Săn Deal Hot - SeenYT</title>
        <meta name="description" content="Tổng hợp mã giảm giá và chương trình khuyến mại mới nhất từ SeenYT." />
      </Head>

      <Header />

      <main className="pt-24 pb-20 container mx-auto px-4 md:px-6">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/30 blur-[120px] rounded-full pointer-events-none" />
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 relative z-10">
            Săn Deal Hot <span className="text-[#CDAD5A]">SeenYT</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto relative z-10">
            Cập nhật những ưu đãi độc quyền mới nhất giúp bạn tiết kiệm chi phí xây kênh.
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
              <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Hiện chưa có chương trình khuyến mại nào.</p>
              <p className="text-gray-500">Vui lòng quay lại sau nhé!</p>
            </div>
          ) : (
            promotions.map((promo) => (
              <div key={promo.id} className="bg-[#18181b] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#CDAD5A]/50 transition-all duration-300 group flex flex-col">
                {/* Banner Image */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  {promo.imageUrl ? (
                    <img
                      src={promo.imageUrl}
                      alt={promo.description || promo.code}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <span className="text-gray-600 font-bold text-lg"><Tag className="w-12 h-12 opacity-20" /></span>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-3 right-3 bg-[#CDAD5A] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    {promo.type === 'PERCENT' ? `Giảm ${promo.value}%` : promo.type === 'FIXED' ? `Giảm ${parseInt(promo.value).toLocaleString('vi-VN')}đ` : 'Tặng Ngày'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${promo.promotionType === 'PROGRAM' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                      {promo.promotionType === 'PROGRAM' ? 'Chương trình' : 'Mã giảm giá'}
                    </span>
                    {promo.endDate && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                        <Clock size={12} /> Hết hạn: {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2" title={promo.description || ''}>
                    {promo.description || `Mã giảm giá ${promo.code}`}
                  </h3>

                  {promo.minOrder && Number(promo.minOrder) > 0 && (
                    <p className="text-sm text-gray-400 mb-4">
                      Áp dụng cho đơn từ {parseInt(promo.minOrder).toLocaleString('vi-VN')}đ
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between bg-black/30 p-1 pl-4 rounded-lg border border-gray-700/50 dashed-border">
                      <span className="font-mono text-[#CDAD5A] font-bold tracking-wider text-lg">
                        {promo.code}
                      </span>
                      <button
                        onClick={() => handleCopy(promo.code)}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${copiedCode === promo.code
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                      >
                        {copiedCode === promo.code ? 'Đã copy' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating CTA Button - Bottom Center Horizontal */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-slow w-max">
        <button
          onClick={() => router.push('/#pricing')}
          className="group flex items-center gap-3 bg-gradient-to-r from-[#CDAD5A] to-[#F2D06B] text-black font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(205,173,90,0.5)] hover:shadow-[0_0_30px_rgba(205,173,90,0.8)] hover:scale-105 transition-all duration-300 border-2 border-[#fff]/20"
        >
          <div className="bg-black/10 p-1.5 rounded-full">
            <Ticket size={20} className="text-black" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] uppercase font-semibold opacity-80">Đã copy mã?</span>
            <span className="text-sm font-bold">SỬ DỤNG NGAY</span>
          </div>
          <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform duration-300 ml-1" />
        </button>
      </div>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const promotions = await prisma.promotion.findMany({
    where: {
      status: 'ACTIVE',
      // Optional: Filter by startDate/endDate if needed, but currently simplified
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Serialize Decimal and Date objects
  const serializedPromotions = promotions.map(p => ({
    ...p,
    value: p.value.toString(),
    minOrder: p.minOrder ? p.minOrder.toString() : null,
    startDate: p.startDate ? p.startDate.toISOString() : null,
    endDate: p.endDate ? p.endDate.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return {
    props: {
      promotions: serializedPromotions,
    },
  };
};