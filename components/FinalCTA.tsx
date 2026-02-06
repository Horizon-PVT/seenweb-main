
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Rocket } from 'lucide-react';

const FinalCTA: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <section id="final-cta" className="py-12 bg-gradient-to-t from-black to-gray-900/50">
      <div className="container mx-auto px-6 text-center">
        {/* Compact Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#CDAD5A]/10 border border-[#CDAD5A]/30 rounded-full mb-6">
          <Rocket className="w-8 h-8 text-[#CDAD5A]" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 max-w-2xl mx-auto leading-tight">
          {t('finalCTA.title', 'Hãy bước vào trận chiến, đừng chỉ là khán giả.')}
        </h2>
        <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
          {t('finalCTA.subtitle', 'Bắt đầu hành trình xây kênh YouTube bền vững ngay hôm nay.')}
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <a
            href="#pricing"
            className="px-8 py-3 bg-gradient-to-r from-[#CDAD5A] to-[#F2D06B] text-black font-bold text-sm rounded-lg hover:shadow-[0_0_20px_rgba(205,173,90,0.5)] transition-all"
          >
            {t('finalCTA.choosePlan', 'Chọn Gói Ngay')}
          </a>
          <a
            href="https://zalo.me/g/lhxazc331"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-medium text-sm rounded-lg transition-colors"
          >
            {t('finalCTA.joinCommunity', 'Tham gia Cộng đồng')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
