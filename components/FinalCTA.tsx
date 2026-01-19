
import React from 'react';
import { useTranslation } from 'next-i18next';

const FinalCTA: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <section id="final-cta" className="py-24 bg-gradient-to-t from-black to-gray-900/50">
      <div className="container mx-auto px-6 text-center">
        {/* Giant Bronze Hand Icon Placeholder */}
        <div className="text-8xl text-[#CDAD5A] mb-8 animate-pulse">
          ✋
        </div>
        <h2 className="text-4xl md:text-5xl font-playfair text-[#CDAD5A] mb-6 max-w-4xl mx-auto leading-tight animate-ring inline-block">
          {t('finalCTA.title', 'STEP INTO THE BATTLE, DON\'T JUST BE A SPECTATOR.')}
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
          <a
            href="#pricing"
            className="w-full sm:w-auto bg-[#008080] text-white font-bold py-4 px-12 text-lg border-2 border-[#008080] rounded-sm transition-all duration-300 transform hover:scale-105 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow inline-block"
          >
            {t('finalCTA.choosePlan', 'Choose Your Plan Now')}
          </a>
          <a
            href="https://zalo.me/g/lhxazc331"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-gray-400 hover:text-white transition-colors py-4 px-12 text-lg inline-block"
          >
            {t('finalCTA.joinCommunity', 'Join SeenYT Community')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
