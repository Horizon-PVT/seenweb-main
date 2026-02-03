import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Play } from 'lucide-react';

const Testimonials: React.FC = () => {
  const { t } = useTranslation('common');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const testimonials = [
    { id: "t1", metric: t('testimonials_video.metric_1'), videoUrl: "sZRqXy4IeIQ", thumb: "/images/testimonials/shorts-1.jpg" },
    { id: "t2", metric: t('testimonials_video.metric_2'), videoUrl: "86pXGV_C0q8", thumb: "/images/testimonials/shorts-2.jpg" },
    { id: "t3", metric: t('testimonials_video.metric_3'), videoUrl: "8nRqWsdg5oI", thumb: "/images/testimonials/shorts-3.png" },
    { id: "t4", metric: t('testimonials_video.metric_4'), videoUrl: "DnWhLE_4lAs", thumb: "/images/testimonials/shorts-4.png" },
    { id: "t5", metric: t('testimonials_video.metric_5'), videoUrl: "DVhPcdq3430", thumb: "/images/testimonials/shorts-5.png" },
    { id: "t6", metric: t('testimonials_video.metric_6'), videoUrl: "4nf-Q_dQkLw", thumb: "/images/testimonials/shorts-6.png" }
  ];

  const stats = [
    { id: "s1", src: "/images/testimonials/stat-1.png" },
    { id: "s2", src: "/images/testimonials/stat-2.png" },
    { id: "s3", src: "/images/testimonials/stat-3.png" },
    { id: "s4", src: "/images/testimonials/stat-4.png" },
  ];

  const renderVideoCard = (item: typeof testimonials[0]) => (
    <div
      key={item.id}
      className="group relative w-full aspect-[9/16] rounded-[20px] overflow-hidden bg-[#151515] border border-gray-800/50 hover:border-[#CDAD5A]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_20px_-8px_rgba(205,173,90,0.3)] cursor-pointer"
      onClick={() => setActiveVideo(item.videoUrl)}
    >
      <div className="absolute inset-0">
        <img
          src={item.thumb || `https://i.ytimg.com/vi/${item.videoUrl}/hq720.jpg`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('hqdefault')) {
              target.src = `https://i.ytimg.com/vi/${item.videoUrl}/hqdefault.jpg`;
            }
          }}
          alt="Testimonial"
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
      </div>

      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-[#CDAD5A] transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
          <Play className="w-4 h-4 text-white ml-1 fill-white" />
        </div>

        <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-gray-700/50 rounded-lg p-2.5 flex items-center gap-2 shadow-lg">
            <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">{t('testimonials_video.result_label')}</p>
              <p className="text-[10px] sm:text-xs font-bold text-white truncate text-ellipsis">{item.metric}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatCard = (item: typeof stats[0]) => (
    <div key={item.id} className="w-full rounded-[20px] overflow-hidden border border-gray-800/30 hover:border-[#CDAD5A]/30 transition-all duration-500 hover:scale-[1.02] shadow-lg bg-[#111]">
      <img src={item.src} alt="Statistic" className="w-full h-auto object-cover" />
    </div>
  );

  return (
    <section id="testimonials" className="py-16 bg-[#0a0a0a] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1a103c,transparent_70%)]" />

      {/* Reduced max-width to 4xl for compactness */}
      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-4 tracking-tight max-w-3xl mx-auto leading-normal">
            {t('testimonials_video.heading').split('SEENYT')[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-[#F3EAC0]">SEENYT</span>{t('testimonials_video.heading').split('SEENYT')[1]}
          </h2>
        </div>

        {/* 
            Compact Masonry Layout 
            Gap reduced to 4
        */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-start">
          {/* Column 1 */}
          <div className="flex-1 flex flex-col gap-4 w-full md:w-auto">
            {renderVideoCard(testimonials[0])}
            {renderStatCard(stats[0])}
            {renderVideoCard(testimonials[3])}
          </div>

          {/* Column 2 - Staggered Down less (pt-8 instead of 12) */}
          <div className="flex-1 flex flex-col gap-4 w-full md:w-auto md:pt-8">
            {renderStatCard(stats[1])}
            {renderVideoCard(testimonials[1])}
            {renderVideoCard(testimonials[4])}
          </div>

          {/* Column 3 - Staggered More (pt-16 instead of 24) */}
          <div className="flex-1 flex flex-col gap-4 w-full md:w-auto md:pt-16">
            {renderVideoCard(testimonials[2])}
            {renderStatCard(stats[2])}
            {renderVideoCard(testimonials[5])}
            {renderStatCard(stats[3])}
          </div>
        </div>

      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          onClick={() => setActiveVideo(null)}
        >
          <div className="relative w-full max-w-4xl aspect-[9/16] md:aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10">
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white z-10 bg-black/50 p-2 rounded-full backdrop-blur-md transition-colors"
              onClick={() => setActiveVideo(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`}
              title="Testimonial"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;