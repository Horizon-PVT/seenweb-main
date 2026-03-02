import React, { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import AcademyLayout from '@/components/layout/AcademyLayout';
import { Play, Cpu, Crown, CheckCircle2, Search, ArrowRight, BookOpen, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSession } from 'next-auth/react';
import VideoTipsSection from '@/components/VideoTipsSection';
import KnowledgeSection from '@/components/KnowledgeSection';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct

// Fetch articles and basic videos for the relocated sections
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  try {
    const [videoTips, blogPosts] = await Promise.all([
      prisma.videoTip.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, slug: true, summary: true, coverImage: true, createdAt: true }
      })
    ]);

    const strategyVideos = videoTips.filter((v: any) => v.type === 'STRATEGY');
    const featuredStrategyVideo = strategyVideos.length > 0 ? {
      title: strategyVideos[0].title,
      desc: strategyVideos[0].description || '',
      videoId: strategyVideos[0].youtubeId,
      thumb: strategyVideos[0].thumbnailUrl || ''
    } : undefined;

    return {
      props: {
        ...(await serverSideTranslations(locale || 'vi', ['common'])),
        featuredStrategyVideo: featuredStrategyVideo ? JSON.parse(JSON.stringify(featuredStrategyVideo)) : null,
        articles: JSON.parse(JSON.stringify(blogPosts)),
      },
    };
  } catch (error) {
    console.error('Error fetching data for academy:', error);
    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
      },
    };
  }
};

export default function AcademyHome({ featuredStrategyVideo, articles = [] }: { featuredStrategyVideo?: any; articles?: any[] }) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { data: session } = useSession();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Set email when session loads
  React.useEffect(() => {
    if (session?.user?.email && !checkoutEmail) {
      setCheckoutEmail(session.user.email);
    }
  }, [session, checkoutEmail]);

  const handleCheckoutCourse = async () => {
    if (!checkoutEmail || !checkoutEmail.includes("@")) {
      alert("Vui lòng nhập email hợp lệ!");
      return;
    }
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/payment/create-payos-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: checkoutEmail,
          amount: 849000,
          plan: "MASTERCLASS_COURSE",
          role: "MASTERCLASS",
          note: "Mua Gói Học Viện Trọn Đời",
        }),
      });
      const data = await res.json();
      if (data.success && data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        alert("Lỗi tạo thanh toán: " + data.error);
      }
    } catch (err) {
      alert("Lỗi kết nối server.");
    }
    setLoadingCheckout(false);
  };

  // Relocated Series Data from HomePage
  const VIDEO_SERIES_2026 = [
    { id: '1', title: t('home.video_series.1_title', 'Tư duy đúng khi làm YouTube 2026'), youtubeId: 'yvUouUjwZKw', description: t('home.video_series.1_desc', 'Bài 1: Khởi động hành trình') },
    { id: '2', title: t('home.video_series.2_title', 'Cách chọn ngách tiềm năng'), youtubeId: '_KzRdzW5SSM', description: t('home.video_series.2_desc', 'Bài 2: Chiến lược ngách') },
    { id: '3', title: t('home.video_series.3_title', 'Phân tích đối thủ & Thị trường'), youtubeId: 'UgpPkYBAXL0', description: t('home.video_series.3_desc', 'Bài 3: Nghiên cứu') },
    { id: '4', title: t('home.video_series.4_title', 'Quy trình sản xuất video chuẩn'), youtubeId: '4SlGnwW4nOE', description: t('home.video_series.4_desc', 'Bài 4: Production') },
    { id: '5', title: t('home.video_series.5_title', 'Tối ưu SEO & Thuật toán'), youtubeId: 'WsyJ_JMknoY', description: t('home.video_series.5_desc', 'Bài 5: SEO Mastery') },
    { id: '6', title: t('home.video_series.6_title', 'Chiến lược Thumbnail & Title'), youtubeId: '-LJDDrLi76g', description: t('home.video_series.6_desc', 'Bài 6: Click-Through Rate') },
    { id: '7', title: t('home.video_series.7_title', 'Kiếm tiền & Affiliate'), youtubeId: 'Mv6XwQhN3ig', description: t('home.video_series.7_desc', 'Bài 7: Monetization') },
    { id: '8', title: t('home.video_series.8_title', 'Xây dựng hệ thống tự động'), youtubeId: '2bm-goinao4', description: t('home.video_series.8_desc', 'Bài 8: Automation') },
  ];

  const handleAction = (type: string) => {
    if (type === 'free') {
      const section = document.getElementById('featured-series');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
    if (type === 'pro') router.push('/#pricing');
    if (type === 'coaching') router.push('https://zalo.me/0981927599');
  };

  // Users with ADMIN or explicit hasMasterclass flag get access
  const hasMasterclass = (session?.user as any)?.hasMasterclass === true || (session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "SUPER";

  return (
    <AcademyLayout>
      <Head>
        <title>Học Viện SeenYT - Lộ Trình Xây Kênh Triệu View</title>
        <meta name="description" content="Chuyên đào tạo tư duy chiến lược và kỹ năng thực chiến kiếm tiền YouTube." />
      </Head>

      <div className="bg-[#050505] min-h-screen font-sans text-gray-200">

        {/* --- ANNOUNCEMENT BAR --- */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-2.5 px-4 text-sm font-bold relative z-50 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          <span className="animate-pulse mr-2">🚨</span>
          Sắp diễn ra: 3 Ngày Master YouTube AI 2026 cho Newbie - Miễn phí 100%.{' '}
          <button onClick={() => router.push('/academy/zoom-3-days')} className="underline underline-offset-2 hover:text-yellow-300 ml-1 transition-colors">
            [Đăng ký ngay]
          </button>
        </div>

        {/* --- HERO SECTION --- */}
        <section className="relative pt-24 pb-20 px-4 overflow-hidden">
          {/* Subtle glowing orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-left space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium tracking-wide uppercase text-white">
                  SeenYT Mastery Training
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Học Viện SeenYT <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                  Lộ Trình Triệu View
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl">
                Không chỉ dạy cách dùng công cụ, chúng tôi dạy bạn <strong className="text-white">tư duy chiến lược</strong> để thành công bền vững trên YouTube 2026.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center space-x-2"
                >
                  <span>Xem Lộ Trình Ngay</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/academy/zoom-3-days')}
                  className="px-8 py-4 rounded-xl border-2 border-red-500 bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center space-x-2 animate-pulse hover:animate-none"
                >
                  <span className="relative flex h-3 w-3 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Tham gia Zoom 3 ngày (Free)
                </button>
              </div>
            </div>

            {/* Social Proof Image (Dashboard/Results) */}
            <div className="relative group perspective">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-[#111] backdrop-blur-xl border border-green-500/30 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center overflow-hidden transform transition-all duration-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                {/* Simulated Chart/Analytics Dashboard Thumbnail */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-80"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-bold text-sm mb-2">
                    +2,540,000 Views / 28 Ngày
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    Kết quả thực tế từ Hệ thống SeenYT
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3-TIER ROADMAP (Core Content) --- */}
        <section id="roadmap" className="py-24 px-4 bg-black/40 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Hành Trình Sáng Tạo</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Chọn cho mình một vị thế bắt đầu phù hợp để tăng tốc đến vinh quang.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* TIER 1: Starter */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all flex flex-col">
                <div className="w-14 h-14 bg-gray-800/80 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                  <BookOpen className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-red-400 text-sm font-medium mb-6 uppercase tracking-wider">Người Khởi Đầu (Free)</p>
                <p className="text-gray-400 mb-6 flex-grow">
                  Xem miễn phí <strong className="text-gray-200">"Chương 1: Tư duy Youtube 2026"</strong>. Hiểu sự khác biệt giữa làm bằng bản năng và thu hoạch bằng AI tự động.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Tư duy YouTube AI bền vững</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Cách chọn ngách làm video</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Được dùng thử 3 Tools AI cơ bản</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAction('free')}
                  className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/5"
                >
                  Học Chương 1 Ngay
                </button>
              </div>

              {/* TIER 2: Masterclass */}
              <div className="bg-gradient-to-b from-red-900/40 to-black backdrop-blur-md border border-red-500/30 rounded-2xl p-8 transform md:-translate-y-4 relative shadow-[0_0_40px_rgba(220,38,38,0.1)] flex flex-col">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Lựa Chọn Hàng Đầu
                </div>
                <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30">
                  <Cpu className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Creator Masterclass</h3>
                <p className="text-red-400 text-sm font-medium mb-4 uppercase tracking-wider">Mua 1 Lần - Học Trọn Đời</p>

                <div className="mb-6 flex items-baseline gap-3">
                  <span className="text-5xl font-black text-white">849k</span>
                  <span className="text-gray-500 text-sm line-through decoration-red-500 decoration-2">2.999k</span>
                </div>

                <p className="text-gray-300 mb-6 flex-grow">
                  Sở hữu <strong className="text-white">vĩnh viễn</strong> Full giáo trình 30 ngày Thực Chiến, liên tục cập nhật case study mới từ cộng đồng.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white font-medium">Bảo trì và Update kiến thức trọn đời</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-200">Full Seri Giáo án bài bản A-Z</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-200">Thư viện Case Study & Ngách Win 100%</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105 transition-all"
                >
                  Mua Ngay Gói Trọn Đời
                </button>
              </div>

              {/* TIER 3: Mastery (Coaching) */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-500/50 rounded-2xl p-8 transition-all flex flex-col group">
                <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                  <Star className="w-7 h-7 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">SeenYT Mastery</h3>
                <p className="text-yellow-500 text-sm font-medium mb-6 uppercase tracking-wider">Kèm Cặp Cá Nhân (Coaching 1-1)</p>
                <p className="text-gray-400 mb-6 flex-grow">
                  Chương trình huấn luyện 1 kèm 1 cường độ cao cùng Mr. Seen. Khai phá tiềm năng vô hạn và scale up quy mô không giới hạn.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Review & Fix kênh hàng tuần 1-1</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Tìm & Cấp riêng Nguồn Ngách Xanh Độc Quyền</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Support Zalo mâm riêng 24/7 (Ưu Tiên)</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAction('coaching')}
                  className="w-full py-4 rounded-xl bg-transparent border-2 border-yellow-600/50 hover:border-yellow-500 hover:bg-yellow-500/10 text-yellow-500 font-bold transition-all"
                >
                  Hẹn Lịch Phỏng Vấn Kín
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- UX/UI: TÍNH NĂNG TĂNG TỶ LỆ HỌC --- */}
        <div id="featured-series" className="max-w-6xl mx-auto px-4 py-12 pt-24">

          {/* Progress Bar */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 mb-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-gray-800 flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-800" />
                    <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175" strokeDashoffset="146" className="text-green-500" />
                  </svg>
                  <span className="text-white font-bold text-lg">16%</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Tiến độ khóa học của bạn</h3>
                  <p className="text-green-400 font-medium text-sm">Bạn đã hoàn thành 5/30 ngày thực chiến</p>
                </div>
              </div>

              <div className="w-full md:w-auto text-left md:text-right">
                <p className="text-gray-400 text-sm mb-2">Bài học tiếp theo cần hoàn thành:</p>
                <button className="bg-white/10 hover:bg-white/20 border border-white/5 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
                  <Play className="w-4 h-4 text-green-400" /> Bài 6: Chiến lược Thumbnail
                </button>
              </div>
            </div>
          </div>

          {/* LỘ TRÌNH BÀI HỌC (Có Nút Tool & Quiz) */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              Series Độc Quyền <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">YouTube 2026</span>
            </h2>
            <p className="text-gray-400 mb-8">Trọn bộ bí kíp từ A-Z dành cho người mới bắt đầu. Áp dụng thực hành ngay sau mỗi bài học.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {VIDEO_SERIES_2026.map((video, idx) => {
                // Intro video is always free. Others require Masterclass tier
                const isLocked = idx > 0 && !hasMasterclass;

                return (
                  <div
                    key={video.id}
                    className="bg-[#111] border border-gray-800 hover:border-white/20 rounded-2xl overflow-hidden transition-colors flex flex-col group cursor-pointer relative"
                    onClick={() => {
                      if (isLocked) {
                        setShowUpgradeModal(true);
                      } else {
                        setSelectedVideo(video.youtubeId);
                      }
                    }}
                  >
                    <div className="aspect-video bg-black relative">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover transition-all opacity-80 group-hover:opacity-100 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                          <Play className="w-5 h-5 text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2">{video.description}</span>
                      <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">{video.title}</h3>

                      <div className="mt-auto pt-4 border-t border-white/5">
                        {/* Interactive Buttons based on Content Type */}
                        {idx === 1 && (
                          <button onClick={(e) => { e.stopPropagation(); router.push('/dashboard?tool=t1'); }} className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <Zap className="w-4 h-4" /> Dùng Tool Săn Ngách
                          </button>
                        )}
                        {(idx === 2 || idx === 3) && (
                          <button onClick={(e) => { e.stopPropagation(); router.push('/dashboard'); }} className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-400 text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <Cpu className="w-4 h-4" /> Bật Tool AI Ngay
                          </button>
                        )}
                        {idx === 0 && (
                          <button onClick={(e) => { e.stopPropagation(); alert('Tính năng Nộp bài đang phát triển!'); }} className="w-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <CheckCircle2 className="w-4 h-4" /> Nộp Bài Review
                          </button>
                        )}
                        {[4, 5, 6, 7].includes(idx) && (
                          <span className="text-gray-500 text-xs flex items-center gap-1"><Play className="w-3 h-3" /> Video Lý Thuyết</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- KNOWLEDGE LIBRARY (Custom Grid with CTA) --- */}
        <section className="py-24 px-4 bg-black/50 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-red-500" />
                  Thư Viện Kiến Thức Chuyên Sâu
                </h2>
                <p className="text-gray-400">Các bài viết chuyên sâu về Tư duy, Kỹ thuật và Cập nhật Thuật toán mới.</p>
              </div>
              <Link href="/blog" className="mt-4 md:mt-0 text-red-400 hover:text-red-300 font-medium flex items-center space-x-1 group">
                <span>Xem tất cả bài viết</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Blog Card 1 */}
              <div className="bg-[#0f0f12] rounded-2xl border border-white/5 overflow-hidden flex flex-col group">
                <div className="aspect-[16/9] bg-gray-800 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=800&auto=format&fit=crop" alt="Tư Duy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-purple-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">TƯ DUY</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">Lộ trình 6 tháng xây kênh Review Phim tự động hóa</h3>
                  <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">Quy trình chi tiết lên kịch bản, làm video và quản lý nhân sự để xây hệ thống thu nhập thụ động.</p>

                  {/* Conversion CTA */}
                  <Link href="/coaching" className="w-full text-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-yellow-500 text-sm font-bold transition-colors">
                    Tìm Hiểu Khóa Coaching
                  </Link>
                </div>
              </div>

              {/* Blog Card 2 */}
              <div className="bg-[#0f0f12] rounded-2xl border border-white/5 overflow-hidden flex flex-col group">
                <div className="aspect-[16/9] bg-gray-800 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1620712948601-7ed7a342ec67?q=80&w=800&auto=format&fit=crop" alt="Kỹ Thuật" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">KỸ THUẬT</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">Cách dùng AI lồng tiếng "thở" tự nhiên như thật</h3>
                  <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">Bí quyết setup file audio và dùng tag trong tool SeenYT để giọng có hồn, giữ chân người xem.</p>

                  {/* Conversion CTA */}
                  <Link href="/dashboard" className="w-full text-center py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" /> Truy Cập Tools
                  </Link>
                </div>
              </div>

              {/* Blog Card 3 */}
              <div className="bg-[#0f0f12] rounded-2xl border border-white/5 overflow-hidden flex flex-col group">
                <div className="aspect-[16/9] bg-gray-800 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=800&auto=format&fit=crop" alt="Case Study" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">CASE STUDY</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-green-400 transition-colors line-clamp-2">Case Study: 100K Subs mảng truyện Ma với số vốn 0đ</h3>
                  <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">Anh bạn T.A chia sẻ cách dùng thư viện hình ảnh và prompt AI để sinh kịch bản.</p>

                  {/* Conversion CTA */}
                  <Link href="/coaching" className="w-full text-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-yellow-500 text-sm font-bold transition-colors">
                    Học 1-1 Cùng Chuyên Gia
                  </Link>
                </div>
              </div>

              {/* Blog Card 4 */}
              <div className="bg-[#0f0f12] rounded-2xl border border-white/5 overflow-hidden flex flex-col group">
                <div className="aspect-[16/9] bg-gray-800 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop" alt="Thuật Toán" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">CẬP NHẬT</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-red-400 transition-colors line-clamp-2">YouTube 2026: Ưu tiên Short hay Long videos?</h3>
                  <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">Phân tích chuyên sâu về chỉ số phụ thuộc thời gian xem và cách YouTube phân phối nội dung.</p>

                  {/* Conversion CTA */}
                  <Link href="/dashboard" className="w-full text-center py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" /> Dùng Tool Săn Keyword
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* --- VIDEO PLAYER MODAL --- */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in">
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 text-white hover:text-red-500 bg-black/50 p-2 rounded-full z-10 transition-colors"
            >
              ✕
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                title="Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* --- UPSELL POPUP MODAL --- */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans animate-fade-in">
          <div className="bg-[#111] max-w-lg w-full rounded-3xl border border-red-500/30 overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.2)] text-center relative border-t-2 border-t-red-500">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center">✕</button>
            <div className="p-10">
              <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/30 border border-red-400/50">
                <Crown className="w-12 h-12 text-white fill-white/20" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Bạn Chưa Đăng Ký</h2>
              <p className="text-gray-400 text-xl md:text-[1.1rem] leading-relaxed mb-10 max-w-sm mx-auto">
                Vui lòng nâng cấp lên gói <strong className="text-white">Creator Masterclass</strong> để học và cập nhật toàn bộ kiến thức YouTube mới nhất!
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => { setShowUpgradeModal(false); setShowCheckoutModal(true); }}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-lg py-5 rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-red-600/20"
                >
                  Nâng Cấp Masterclass Ngay
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-4 text-gray-500 font-bold hover:text-white transition-colors"
                >
                  Để sau vậy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CHECKOUT MODAL --- */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans animate-fade-in">
          <div className="bg-[#0D0D10] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-800">

            {/* Left Column - Image Hero */}
            <div className="hidden md:flex w-1/2 relative bg-black flex-col p-8">
              <div className="absolute inset-0 z-0">
                <img
                  src="/images/academy_masterclass_checkout.png"
                  alt="Giảng dạy YouTube"
                  className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-black/80 to-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0D10]"></div>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-8">
                  <div className="inline-flex bg-[#CDAD5A] text-black text-sm font-bold px-4 py-2 rounded-full shadow-lg items-center gap-2">
                    <Star className="w-4 h-4" /> Dịch Vụ Cao Cấp
                  </div>
                </div>

                <div className="mt-auto mb-10 w-full px-4 text-center">
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group mb-6 aspect-video max-h-56 mx-auto">
                    <img
                      src="/images/academy_masterclass_checkout.png"
                      alt="Lớp học Masterclass"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 leading-tight">Creator Masterclass</h3>
                  <p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto">Sở hữu vĩnh viễn khóa học thực chiến và tham gia cộng đồng VIP đồng hành cùng Mr. Seen.</p>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="w-full md:w-1/2 p-10 relative bg-[#0D0D10]">
              <button onClick={() => setShowCheckoutModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center transition-colors">✕</button>

              <h2 className="text-2xl font-black text-white mb-2">Thanh Toán An Toàn</h2>
              <p className="text-gray-500 text-sm mb-8">Kích hoạt tài khoản Masterclass tự động bằng PayOS mã QR.</p>

              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8 transform transition-all hover:border-red-500/30 hover:bg-gray-900/80">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-300 font-bold tracking-wide uppercase text-sm">Gói Trọn Đời (Lifetime)</span>
                  <span className="text-white font-black text-2xl">849.000 đ</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 line-through decoration-gray-600 decoration-2">Giá gốc: 2.999.000 đ</span>
                  <span className="text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded">Tiết kiệm siêu khủng</span>
                </div>
              </div>

              <div className="mb-8">
                <label className="text-xs text-gray-400 font-bold mb-3 block tracking-wide uppercase">Email nhận khoá học</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Nhập địa chỉ email của bạn..."
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    className="w-full bg-black border-2 border-gray-800 text-white font-medium rounded-xl px-4 py-4 focus:border-red-500 outline-none transition-colors"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">Bắt buộc</div>
                </div>
              </div>

              <button
                onClick={handleCheckoutCourse}
                disabled={loadingCheckout}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-lg py-5 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-red-900/20 hover:-translate-y-1"
              >
                {loadingCheckout ? 'Đang xử lý kết nối...' : 'Tiến Hành Mua Qua PayOS'}
                {!loadingCheckout && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-center text-xs text-gray-600 mt-6 font-medium">🔒 Giao dịch mã hóa an toàn • Auto-kích hoạt sau 1 phút</p>
            </div>
          </div>
        </div>
      )}

    </AcademyLayout>
  );
}
