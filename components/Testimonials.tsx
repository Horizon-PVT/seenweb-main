import React from 'react';
import { useTranslation } from 'next-i18next';
import SocialProofGallery, { defaultSocialProofItems } from './SocialProofGallery';

const Testimonials: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <section id="testimonials" className="py-16 bg-[#0a0a0a] overflow-hidden relative border-y border-white/5">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1a103c,transparent_70%)]" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-4 tracking-tight max-w-3xl mx-auto leading-normal">
            {t('testimonials_video.heading').split('SEENYT')[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-[#F3EAC0]">SEENYT</span>{t('testimonials_video.heading').split('SEENYT')[1]}
          </h2>
        </div>

        <SocialProofGallery items={defaultSocialProofItems} />
      </div>
    </section>
  );
};

export default Testimonials;