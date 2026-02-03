import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function AffiliateLanding() {
  const { t } = useTranslation('common');
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
              {t('affiliate_page.back_home')}
            </span>
          </Link>

          <Link href="/affiliate/dashboard">
            <span className="cursor-pointer text-sm md:text-base text-cyan-300 hover:text-cyan-200">
              {t('affiliate_page.dashboard_link')}
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
            {t('affiliate_page.title')}
          </h1>
          <p className="text-2xl md:text-4xl mb-8 font-semibold drop-shadow-lg">
            {t('affiliate_page.subtitle_1')}{' '}
            <span className="text-yellow-400 font-bold">{t('affiliate_page.commission_30')}</span> +{' '}
            <span className="text-green-400 font-bold">{t('affiliate_page.recurring_10')}</span>
          </p>
          <p className="text-xl md:text-2xl mb-12 text-gray-200 drop-shadow-lg">
            {t('affiliate_page.joined_count_prefix')}{' '}
            <span className="text-cyan-400 font-bold text-4xl">
              {affiliateCount.toLocaleString('vi-VN')}+
            </span>{' '}
            {t('affiliate_page.joined_count_suffix')}
          </p>

          <Link href="/affiliate/dashboard">
            <button className="bg-cyan-600 text-2xl md:text-3xl font-bold py-6 px-12 rounded-full hover:bg-cyan-500 transition-all shadow-2xl shadow-cyan-600/50 animate-pulse">
              {t('affiliate_page.join_now_btn')}
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
              {t('affiliate_page.video_caption')}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits + Tiers & Bonus */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="bg-gray-800 p-10 rounded-2xl border border-cyan-600">
            <h2 className="text-3xl font-bold mb-8">{t('affiliate_page.benefits_title')}</h2>
            <ul className="space-y-6 text-xl">
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> {t('affiliate_page.benefit_1')}
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> {t('affiliate_page.benefit_2')}
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> {t('affiliate_page.benefit_3')}
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> {t('affiliate_page.benefit_4')}
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> {t('affiliate_page.benefit_5')}
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-4 text-3xl">✔</span> {t('affiliate_page.benefit_6')}
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-black p-10 rounded-2xl border border-purple-600">
            <h2 className="text-3xl font-bold mb-8">{t('affiliate_page.tier_title')}</h2>
            <ul className="space-y-6 text-xl">
              <li className="flex items-center">
                <span className="text-purple-400 mr-4 text-3xl">⭐</span> {t('affiliate_page.tier_1')}
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-4 text-3xl">⭐</span> {t('affiliate_page.tier_2')}
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-4 text-3xl">🏆</span> {t('affiliate_page.tier_top')}
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-4 text-3xl">🎁</span> {t('affiliate_page.tier_seeding')}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">{t('affiliate_page.steps_title')}</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <img
              src="/images/affiliate/icon-step1.png"
              alt="Step 1"
              className="w-24 h-24 mx-auto mb-4"
            />
            <p className="font-bold">{t('affiliate_page.step_1_title')}</p>
            <p className="text-gray-400">{t('affiliate_page.step_1_desc')}</p>
          </div>
          <div className="text-center">
            <img
              src="/images/affiliate/icon-step2.png"
              alt="Step 2"
              className="w-24 h-24 mx-auto mb-4"
            />
            <p className="font-bold">{t('affiliate_page.step_2_title')}</p>
            <p className="text-gray-400">{t('affiliate_page.step_2_desc')}</p>
          </div>
          <div className="text-center">
            <img
              src="/images/affiliate/icon-step3.png"
              alt="Step 3"
              className="w-24 h-24 mx-auto mb-4"
            />
            <p className="font-bold">{t('affiliate_page.step_3_title')}</p>
            <p className="text-gray-400">{t('affiliate_page.step_3_desc')}</p>
          </div>
          <div className="text-center">
            <img
              src="/images/affiliate/icon-step4.png"
              alt="Step 4"
              className="w-24 h-24 mx-auto mb-4"
            />
            <p className="font-bold">{t('affiliate_page.step_4_title')}</p>
            <p className="text-gray-400">{t('affiliate_page.step_4_desc')}</p>
          </div>
        </div>
      </section>

      {/* Social Proof - Carousel loop mượt (inline style + keyframe) */}
      <section className="py-16 px-6 bg-gray-900/50 overflow-hidden">
        <h2 className="text-4xl font-bold text-center mb-12">
          {t('affiliate_page.testimonials_title')}
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
                  <p className="text-2xl font-bold text-yellow-400 mb-4">{t('affiliate_page.testimonial_1_income')}</p>
                  <p className="italic mb-4">"{t('affiliate_page.testimonial_1_quote')}"</p>
                  <p className="font-bold">- {t('affiliate_page.testimonial_1_name')}</p>
                </div>
                <div className="min-w-[350px] bg-gray-800 p-6 rounded-xl text-center">
                  <img
                    src="/images/affiliate/testimonial2.jpg"
                    alt="Lan Anh"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-2xl font-bold text-yellow-400 mb-4">{t('affiliate_page.testimonial_2_income')}</p>
                  <p className="italic mb-4">"{t('affiliate_page.testimonial_2_quote')}"</p>
                  <p className="font-bold">- {t('affiliate_page.testimonial_2_name')}</p>
                </div>
                <div className="min-w-[350px] bg-gray-800 p-6 rounded-xl text-center">
                  <img
                    src="/images/affiliate/testimonial3.jpg"
                    alt="Tuấn Kiệt"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-2xl font-bold text-yellow-400 mb-4">{t('affiliate_page.testimonial_3_income')}</p>
                  <p className="italic mb-4">"{t('affiliate_page.testimonial_3_quote')}"</p>
                  <p className="font-bold">- {t('affiliate_page.testimonial_3_name')}</p>
                </div>
                {/* Simplified repeats to keep code shorter - just repeating same data 2x in loop logic above */}
                <div className="min-w-[350px] bg-gray-800 p-6 rounded-xl text-center">
                  <img
                    src="/images/affiliate/testimonial1.jpg"
                    alt="Vũ Long"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-2xl font-bold text-yellow-400 mb-4">{t('affiliate_page.testimonial_4_income')}</p>
                  <p className="italic mb-4">"{t('affiliate_page.testimonial_4_quote')}"</p>
                  <p className="font-bold">- {t('affiliate_page.testimonial_4_name')}</p>
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
          {t('affiliate_page.promo_guide_title')}
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 text-red-400">{t('affiliate_page.guide_yt_title')}</h3>
            <ol className="list-decimal pl-6 space-y-3 text-gray-300 mb-6">
              <li>{t('affiliate_page.guide_yt_step_1')}</li>
              <li>{t('affiliate_page.guide_yt_step_2')}</li>
              <li>{t('affiliate_page.guide_yt_step_3')}</li>
              <li>{t('affiliate_page.guide_yt_step_4')}</li>
            </ol>
            <img src="/images/affiliate/banner-yt.jpg" alt="Banner YouTube" className="w-full rounded mb-4" />
            <a
              href="/images/affiliate/banner-yt.jpg"
              download
              className="block text-center bg-red-600 py-2 rounded hover:bg-red-700"
            >
              {t('affiliate_page.download_banner_yt')}
            </a>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">{t('affiliate_page.guide_fb_title')}</h3>
            <ol className="list-decimal pl-6 space-y-3 text-gray-300 mb-6">
              <li>{t('affiliate_page.guide_fb_step_1')}</li>
              <li>{t('affiliate_page.guide_fb_step_2')}</li>
              <li>{t('affiliate_page.guide_fb_step_3')}</li>
              <li>{t('affiliate_page.guide_fb_step_4')}</li>
            </ol>
            <img src="/images/affiliate/banner-fb.jpg" alt="Banner Facebook" className="w-full rounded mb-4" />
            <a
              href="/images/affiliate/banner-fb.jpg"
              download
              className="block text-center bg-blue-600 py-2 rounded hover:bg-blue-700"
            >
              {t('affiliate_page.download_banner_fb')}
            </a>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 text-pink-400">{t('affiliate_page.guide_tiktok_title')}</h3>
            <ol className="list-decimal pl-6 space-y-3 text-gray-300 mb-6">
              <li>{t('affiliate_page.guide_tiktok_step_1')}</li>
              <li>{t('affiliate_page.guide_tiktok_step_2')}</li>
              <li>{t('affiliate_page.guide_tiktok_step_3')}</li>
              <li>{t('affiliate_page.guide_tiktok_step_4')}</li>
            </ol>
            <img src="/images/affiliate/banner-tiktok.jpg" alt="Banner TikTok" className="w-full rounded mb-4" />
            <a
              href="/images/affiliate/banner-tiktok.jpg"
              download
              className="block text-center bg-pink-600 py-2 rounded hover:bg-pink-700"
            >
              {t('affiliate_page.download_banner_tiktok')}
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">{t('affiliate_page.final_cta_title')}</h2>
        <Link href="/affiliate/dashboard">
          <button className="bg-cyan-600 text-3xl font-bold py-8 px-16 rounded-full hover:bg-cyan-500 transition-all shadow-2xl shadow-cyan-600/50">
            {t('affiliate_page.final_cta_btn')}
          </button>
        </Link>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'vi', ['common'])),
    },
  };
};
