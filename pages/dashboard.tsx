import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Briefcase, CreditCard, Key, ArrowRight, Download, Search, Globe, PlayCircle, Database, ChevronLeft, ChevronRight, Copy, CheckCircle } from 'lucide-react';

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import YouTubeStatsCard from "@/components/dashboard/YouTubeStatsCard";

import KodaNicheRadar from "@/components/KodaNicheRadar";
import KodaScriptStudio from "@/components/KodaScriptStudio";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'home' | 'web-tools' | 'desktop-video' | 'desktop-novel' | 'billing'>('home');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // License key state
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [licenseTier, setLicenseTier] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const userRole = (session?.user as any)?.role || 'FREE';

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      setLoading(false);
      // Fetch real license key
      fetch('/api/user/license')
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setLicenseKey(data.licenseKey);
            setLicenseTier(data.tier);
          }
        })
        .catch(() => {});
    }
  }, [status, router]);

  useEffect(() => {
    if (!loading && router.isReady) {
      if (router.query.tool) setActiveTool(router.query.tool as string);
      if (router.query.tab) {
         if (router.query.tab === 'workflows') setActiveTab('home');
         else if (router.query.tab === 'license') setActiveTab('home'); // We don't use 'license' directly anymore, user must click from home
         else setActiveTab(router.query.tab as any);
      }
    }
  }, [loading, router.isReady, router.query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#00ffb4] text-2xl font-black tracking-widest animate-pulse">LOADING WORKSPACE...</p>
      </div>
    );
  }

  // --- RENDER TOOLS UI ---
  if (activeTool === 'niche-radar') {
    return (
      <DashboardLayout userRole={userRole} activeTool={activeTool} onToolSelect={setActiveTool}>
        <Head><title>Koda Niche Radar</title></Head>
        <KodaNicheRadar onBack={() => setActiveTool(null)} />
      </DashboardLayout>
    );
  }

  if (activeTool === 'script-studio') {
    return (
      <DashboardLayout userRole={userRole} activeTool={activeTool} onToolSelect={setActiveTool}>
        <Head><title>Koda Script Studio</title></Head>
        <KodaScriptStudio onBack={() => setActiveTool(null)} />
      </DashboardLayout>
    );
  }

  // --- MAIN DASHBOARD: THE 3 PILLARS ---
  return (
    <DashboardLayout userRole={userRole} activeTool={activeTool} onToolSelect={setActiveTool}>
      <Head>
        <title>Dashboard | Koda Systems</title>
      </Head>

      <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto py-8">
        
        {/* Welcome Section */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{session?.user?.name || "Creator"}</span>
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Hệ sinh thái tự động hoá khép kín: TÌM NGÁCH ➔ CONTENT ➔ RENDER ➔ AUTO POST.</p>
          </div>
          {activeTab !== 'home' && (
              <button 
                 onClick={() => setActiveTab('home')}
                 className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition"
              >
                 <ChevronLeft className="w-5 h-5"/> Trở về Menu chính
              </button>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* HOME VIEW: THE 3 MAGNIFICENT PILLARS                   */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'home' && (
          <>
            <YouTubeStatsCard userRole={userRole} userEmail={session?.user?.email || ''} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn perspective-1000 mt-8">
             
             {/* PILLAR 1: WEB TOOLS (CLOUD WORKSPACE) */}
             <div onClick={() => setActiveTab('web-tools')} className="cursor-pointer group flex flex-col h-[400px] bg-[#111] border border-pink-500/30 rounded-3xl p-8 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(236,72,153,0.3)] hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-transparent z-0 pointer-events-none"></div>
                <div className="absolute right-0 top-0 w-48 h-48 bg-pink-500/20 blur-[80px] pointer-events-none group-hover:bg-pink-500/40 transition-colors"></div>
                
                <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-6 relative z-10 border border-pink-500/50 group-hover:bg-pink-600 transition-colors">
                   <Globe className="w-8 h-8 text-pink-400 group-hover:text-white" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2 relative z-10 leading-tight">WORKFLOW 1:<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Trạm Nội Dung Web</span></h3>
                <p className="text-gray-400 relative z-10 font-medium leading-relaxed mb-4 text-sm">
                  Gộp 5 công cụ đình đám: Đào ngách CPM cao, bóc tách đối thủ, viết kịch bản AI, lồng tiếng Voice Studio & Tối ưu SEO kênh.
                </p>
                
                <div className="flex flex-wrap gap-2 relative z-10 mt-auto">
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-pink-500/20 text-pink-300 rounded-md">Cloud</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/10 text-gray-300 rounded-md">Không cần cài đặt</span>
                </div>
             </div>

             {/* PILLAR 2: VIDEO STUDIO (DESKTOP) */}
             <div onClick={() => setActiveTab('desktop-video')} className="cursor-pointer group flex flex-col h-[400px] bg-[#111] border border-cyan-500/30 rounded-3xl p-8 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent z-0 pointer-events-none"></div>
                <div className="absolute right-0 top-0 w-48 h-48 bg-cyan-500/20 blur-[80px] pointer-events-none group-hover:bg-cyan-500/40 transition-colors"></div>
                
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 relative z-10 border border-cyan-500/50 group-hover:bg-cyan-600 transition-colors">
                   <PlayCircle className="w-8 h-8 text-cyan-400 group-hover:text-white" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2 relative z-10 leading-tight">WORKFLOW 2:<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Koda Video Studio</span></h3>
                <p className="text-gray-400 relative z-10 font-medium leading-relaxed mb-4 text-sm">
                  Giải pháp công nghiệp: App cài trên PC (BYOK) tự động cào hàng nghìn ảnh, ghép nhạc, làm hiệu ứng lách bản quyền video 4K tốc độ cao.
                </p>
                
                <div className="flex flex-wrap gap-2 relative z-10 mt-auto">
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-md">BYOK (Máy trạm)</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/10 text-gray-300 rounded-md">Auto Render 4K</span>
                </div>
             </div>

             {/* PILLAR 3: NOVEL STUDIO (DESKTOP) */}
             <div onClick={() => setActiveTab('desktop-novel')} className="cursor-pointer group flex flex-col h-[400px] bg-[#111] border border-purple-500/30 rounded-3xl p-8 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent z-0 pointer-events-none"></div>
                <div className="absolute right-0 top-0 w-48 h-48 bg-purple-500/20 blur-[80px] pointer-events-none group-hover:bg-purple-500/40 transition-colors"></div>
                
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 relative z-10 border border-purple-500/50 group-hover:bg-purple-600 transition-colors">
                   <Database className="w-8 h-8 text-purple-400 group-hover:text-white" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2 relative z-10 leading-tight">WORKFLOW 3:<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Koda Web Novel</span></h3>
                <p className="text-gray-400 relative z-10 font-medium leading-relaxed mb-4 text-sm">
                  Studio Truyện Chữ & Trí tuệ AI: Cào truyện auto, thiết kế nhân vật, spin nội dung và xuất bản hàng loạt lên các nền tảng Novel trong 1 cú click.
                </p>
                
                <div className="flex flex-wrap gap-2 relative z-10 mt-auto">
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md">BYOK (Máy trạm)</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/10 text-gray-300 rounded-md">Mass Publish</span>
                 </div>
             </div>
          </div>
          </>
        )}

        {/* ---------------------------------------------------- */}
        {/* WORKFLOW 1 VIEW: WEB TOOLS INSIDE TAB                */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'web-tools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn relative">
             <div className="absolute top-0 right-0 p-4 bg-pink-500/10 text-pink-400 rounded-xl font-bold border border-pink-500/20 animate-pulse">
                WORKFLOW 1 ĐANG MỞ
             </div>
             
             {/* Card Niche Radar */}
             <div className="bg-[#111] border border-white/5 p-8 rounded-3xl hover:border-cyan-500/30 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] pointer-events-none" />
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">A. Koda Niche Radar</h3>
                <p className="text-gray-400 mb-8 h-12">Hệ thống phân tích rủi ro, đào ngách và bám sát kênh đối thủ.</p>
                <button onClick={() => setActiveTool('niche-radar')} className="w-full py-4 rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-transparent text-gray-300 font-bold flex items-center justify-center gap-2 transition-all">
                   Dò Dữ Liệu <ArrowRight className="w-4 h-4" />
                </button>
             </div>

             {/* Card Script Studio */}
             <div className="bg-[#111] border border-white/5 p-8 rounded-3xl hover:border-pink-500/30 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[50px] pointer-events-none" />
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">B. Koda Script Combo</h3>
                <p className="text-gray-400 mb-8 h-12">Luồng khép kín: Lên kịch bản ➔ Tối ưu chuẩn SEO ➔ Giọng nói AI.</p>
                <button onClick={() => setActiveTool('script-studio')} className="w-full py-4 rounded-xl bg-white/5 border border-white/10 group-hover:bg-pink-600 group-hover:text-white group-hover:border-transparent text-gray-300 font-bold flex items-center justify-center gap-2 transition-all">
                   Đẻ Nội Dung <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* WORKFLOW 2 & 3 VIEW: DESKTOP APP LICENSE             */}
        {/* ---------------------------------------------------- */}
        {(activeTab === 'desktop-video' || activeTab === 'desktop-novel') && (
           <div className={`
             border rounded-3xl p-10 animate-fadeIn relative overflow-hidden transition-colors duration-500
             ${activeTab === 'desktop-video' ? 'bg-gradient-to-b from-cyan-900/20 to-[#0a0a0c] border-cyan-500/30' : 'bg-gradient-to-b from-purple-900/20 to-[#0a0a0c] border-purple-500/30'}
           `}>
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>
             
             <div className="max-w-3xl relative z-10">
               <div className="inline-flex gap-2 bg-red-500/20 text-red-400 px-4 py-1.5 rounded-md font-bold mb-6 tracking-wide">
                  🔥 VŨ KHÍ HẠNG NẶNG (BYOK DESKTOP)
               </div>
               
               <h2 className="text-4xl font-black text-white mb-4">
                 {activeTab === 'desktop-video' ? 'Koda Video Studio Installer' : 'Koda Web Novel Installer'}
               </h2>
               
               <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                 Bạn cần tải bộ cài đặt (file .exe) về máy tính Windows của bạn để hệ thống tận dụng sức khoẻ Card Đồ Hoạ (VGA) render ngày đêm. Mã API License Key bên dưới dùng để kết nối App với tài khoản Web của bạn.
               </p>

               <div className="bg-black/50 border border-white/10 p-6 rounded-2xl mb-8 flex items-center justify-between group cursor-text">
                  <div className="flex-1">
                    <div className="text-gray-500 text-sm font-bold mb-2 uppercase tracking-widest flex items-center gap-2">
                       <Key className="w-4 h-4 text-emerald-400"/> API License Key Của Bạn
                    </div>
                    <div className="text-2xl font-mono text-emerald-400 blur-sm group-hover:blur-none transition-all duration-300 cursor-pointer" title="Hover để xem mã">
                       {licenseKey || 'Chưa có mã — Mua gói tại Pricing'}
                    </div>
                  </div>
                  <div className={`${licenseKey ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'} px-4 py-3 rounded-xl border font-bold uppercase tracking-wide flex flex-col items-center justify-center shrink-0`}>
                     <span className={`text-xs ${licenseKey ? 'text-emerald-500/60' : 'text-amber-500/60'} mb-0.5`}>Trạng thái</span>
                     {licenseKey ? '🟢 ACTIVE' : '🟡 CHƯA KÍCH HOẠT'}
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-4">
                 {activeTab === 'desktop-video' ? (
                     <a 
                       href="https://drive.google.com/file/d/19ApQJY52zieN1sSGXHbIdwC6fsL5GVaC/view?usp=sharing" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg px-6 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                     >
                       <Download className="w-6 h-6" /> TẢI FILE KỀNH CÀNG (.EXE)
                     </a>
                 ) : (
                     <a 
                       href="https://drive.google.com/file/d/19ApQJY52zieN1sSGXHbIdwC6fsL5GVaC/view?usp=sharing" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 hover:from-purple-500 hover:to-pink-500 text-white font-black text-lg px-6 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                     >
                       <Download className="w-6 h-6" /> TẢI APP WEB NOVEL (.EXE)
                     </a>
                 )}
                 <button 
                   onClick={(e) => {
                     navigator.clipboard.writeText(licenseKey || "");
                     const btn = e.currentTarget;
                     btn.innerText = "Đã sao chép ✓";
                     btn.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
                     btn.style.borderColor = "#22c55e";
                     setTimeout(() => {
                       btn.innerText = "Sao chép License Key";
                       btn.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                       btn.style.borderColor = "rgba(255, 255, 255, 0.1)";
                     }, 2000);
                   }}
                   className="px-6 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 flex items-center justify-center gap-2 transition-colors min-w-[200px]"
                 >
                    Sao chép License Key
                 </button>
               </div>

             </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'vi', ['common'])),
    },
  };
};