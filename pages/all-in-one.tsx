import React from "react";
import Head from "next/head";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ArrowRight, Zap, Target, Sliders, CheckCircle2, MessageCircle, Gift } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "vi", ["common"])),
    },
  };
};

export default function AllInOnePage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white selection:bg-[#ff8e7f]/30">
      <Head>
        <title>KODA AUTO - All-in-One Studio | SeenYT</title>
        <meta
          name="description"
          content="Biến 1 ý tưởng thành hàng trăm video Short/Reels/Tiktok triệu view chỉ với 1 click. Tự động viết kịch bản, tự động lồng tiếng, tự động render 100%."
        />
      </Head>

      <Header />

      <main className="pt-24 overflow-hidden font-sans">
        
        {/* HERO SECTION - Kinetic Noir Atmospheric Depth */}
        <section className="relative pt-32 pb-40 flex items-center min-h-[85vh]">
          {/* Ambient Glows Instead of Shadows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff7260]/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#f8a018]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Left Column */}
            <div className="flex-1 text-center lg:text-left">
              {/* Micro-copy Label */}
              <div className="inline-block px-3 py-1 mb-8">
                 <span className="text-[#ff8e7f] text-sm font-bold uppercase tracking-[0.2em]">
                   AI VEO 3 ORCHESTRATION
                 </span>
              </div>

              {/* Display Headline */}
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.95] mb-8">
                <span className="text-white block">KODA AUTO</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8e7f] to-[#ff7260]">Cỗ Máy In Video</span>
              </h1>

              {/* Body Text */}
              <p className="text-[#adaaaa] text-lg md:text-xl mb-12 leading-[1.6] max-w-2xl mx-auto lg:mx-0 font-medium">
                Biến 1 ý tưởng thành hàng trăm video Short/Reels/Tiktok triệu view chỉ với 1 click. Tự động viết kịch bản, tự động lồng tiếng, tự động render 100%.
              </p>

              {/* Glowing CTA Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <a
                  href="https://drive.google.com/file/d/19ApQJY52zieN1sSGXHbIdwC6fsL5GVaC/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-br from-[#ff8e7f] to-[#ff7765] rounded-lg font-bold text-black text-lg transition-transform hover:scale-[1.02] shadow-[0_0_25px_rgba(255,142,127,0.3)] flex items-center justify-center gap-2 group"
                >
                  Kích Hoạt Hệ Thống <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right Column: Glassmorphic Panel overlapping space */}
            <div className="flex-1 w-full max-w-xl relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ff7260]/10 to-transparent blur-3xl" />
              <div className="relative bg-[#201f1f]/60 backdrop-blur-2xl border-t border-[#ffffff]/10 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform lg:-rotate-2 hover:rotate-0 transition-all duration-700">
                 
                 {/* Internal Dashboard Mockup */}
                 <div className="space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-[#ffffff]/5">
                       <span className="text-[#adaaaa] tracking-widest text-xs font-bold uppercase">Render Status</span>
                       <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f8a018] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f8a018]"></span>
                          </span>
                          <span className="text-[#f8a018] text-sm font-bold">LIVE</span>
                       </div>
                    </div>
                    {/* Simulated process lines */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 items-center">
                         <div className="w-12 h-12 rounded-lg bg-[#131313] border border-[#ffffff]/5 flex items-center justify-center">
                           <Zap className="w-5 h-5 text-[#ff8e7f]" />
                         </div>
                         <div className="flex-1">
                            <div className="h-3 bg-[#1a1919] rounded-full w-full overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-[#ff8e7f] to-[#ff7260] w-2/3 animate-pulse" />
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION - No lines, just a shift in surface tone */}
        <section className="py-32 bg-[#131313] relative z-10">
           <div className="max-w-7xl mx-auto px-4">
              <div className="mb-20 text-center lg:text-left">
                 <h2 className="text-[#ff8e7f] text-sm font-bold uppercase tracking-[0.2em] mb-4">Core Architecture</h2>
                 <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Công nghệ Đột phá</h3>
                 <p className="text-[#adaaaa] text-lg max-w-2xl">Vận hành một studio video khổng lồ ngay trong Background, tự động hoàn toàn.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                    { 
                      icon: Zap, 
                      title: "Kịch bản AI siêu tốc", 
                      desc: "Giọng văn đa dạng, tự động nghiên cứu xu hướng và tối ưu kịch bản để đạt khả năng viral cao nhất trên mọi nền tảng." 
                    },
                    { 
                      icon: Target, 
                      title: "Face-Lock thần thánh", 
                      desc: "Giữ chuẩn khuôn mặt nhân vật từ đầu đến cuối video bất kể góc quay. Giải quyết triệt để lỗi AI bị biến dạng nhân vật." 
                    },
                    { 
                      icon: Sliders, 
                      title: "Duyệt tay hoặc Auto", 
                      desc: "Kiểm soát 100% chất lượng từng phân cảnh trước khi kích hoạt chế độ render hàng loạt. Linh hoạt giữa tốc độ và tỉ mỉ." 
                    }
                 ].map((feat, idx) => (
                    <div key={idx} className="bg-[#201f1f] rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 relative group overflow-hidden">
                       {/* Pulse Border Effect on hover */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff8e7f]/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                       
                       <div className="relative z-10">
                         <div className="w-14 h-14 rounded-xl bg-[#2c2c2c] flex items-center justify-center mb-8 border-t border-[#ffffff]/10">
                            <feat.icon className="w-6 h-6 text-[#ff8e7f]" />
                         </div>
                         <h4 className="text-2xl font-bold tracking-tight mb-4 text-[#fcf8f8]">{feat.title}</h4>
                         <p className="text-[#adaaaa] leading-[1.6]">{feat.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-32 bg-[#0e0e0e] relative z-0">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-[#ff8e7f] text-sm font-bold uppercase tracking-[0.2em] mb-4">PRICING PLANS</h2>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-6">ĐẦU TƯ CHO <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#ff8e7f] to-white">SỰ TỰ ĐỘNG</span></h3>
                    <p className="text-[#adaaaa] text-lg max-w-2xl mx-auto">
                      Chọn gói phù hợp với nhu cầu sản xuất nội dung của bạn. Hoàn vốn cực nhanh chỉ sau vài video triệu view.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center max-w-5xl mx-auto relative z-10">
                   
                   {/* GÓI BASIC */}
                   <div className="flex-1 bg-[#131313] border border-[#201f1f] rounded-2xl p-8 shadow-xl flex flex-col hover:border-[#ffffff]/10 transition-colors">
                      <div className="mb-8">
                         <h4 className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-4">GÓI BASIC</h4>
                         <div className="flex items-baseline gap-2">
                           <span className="text-4xl md:text-5xl font-black text-white">1,990,000</span>
                           <span className="text-sm font-bold text-gray-400">VNĐ / TRỌN ĐỜI</span>
                         </div>
                      </div>

                      <div className="flex flex-col gap-4 mb-10 flex-1">
                         {[
                            "Dành cho \"pro\" đã có API keys riêng",
                            "Cập nhật tính năng trọn đời",
                            "Hỗ trợ kỹ thuật qua Telegram"
                         ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                               <CheckCircle2 className="w-5 h-5 text-[#00ffb4] shrink-0 mt-0.5" />
                               <span className="text-gray-300 font-medium text-sm md:text-base leading-snug">{item}</span>
                            </div>
                         ))}
                      </div>

                      <a 
                         href="https://zalo.me/0789284078"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full flex py-4 px-6 bg-[#1a1919] hover:bg-[#201f1f] border border-[#ffffff]/10 rounded-xl font-bold text-white text-sm transition-colors uppercase tracking-wider justify-center"
                      >
                         Đăng Ký Ngay
                      </a>
                   </div>

                   {/* GÓI VIP STATION */}
                   <div className="flex-1 bg-[#161111] border border-[#ff7260]/30 rounded-2xl p-8 relative flex flex-col shadow-[0_0_40px_rgba(255,114,96,0.1)]">
                      {/* Badge Khuyên Dùng */}
                      <div className="absolute top-0 right-8 -translate-y-1/2">
                         <span className="bg-gradient-to-r from-[#ff8e7f] to-[#ff7260] text-black text-xs font-black px-4 py-1.5 rounded-md uppercase tracking-widest shadow-[0_5px_15px_rgba(255,142,127,0.3)]">
                            Khuyên Dùng
                         </span>
                      </div>

                      <div className="mb-6">
                         <h4 className="text-[#ff8e7f] text-sm font-bold tracking-widest uppercase mb-4">GÓI VIP STATION</h4>
                      </div>

                      {/* Pricing Boxes */}
                      <div className="space-y-4 mb-8">
                         <div className="flex items-center justify-between p-4 rounded-xl border border-[#ffffff]/10 bg-[#131313] cursor-pointer hover:border-[#ff8e7f]/30 transition-colors">
                            <div>
                               <div className="font-bold text-white text-lg">1 Tháng</div>
                               <div className="text-xs text-gray-400">Trải nghiệm đầy đủ</div>
                            </div>
                            <div className="font-black text-[#ff8e7f] text-xl">459K</div>
                         </div>
                         
                         <div className="flex items-center justify-between p-4 rounded-xl border border-[#ffffff]/10 bg-[#131313] cursor-pointer hover:border-[#ff8e7f]/30 transition-colors">
                            <div>
                               <div className="font-bold text-white text-lg">6 Tháng</div>
                               <div className="text-xs text-gray-400">Tiết kiệm 31%</div>
                            </div>
                            <div className="font-black text-[#ff8e7f] text-xl">1.89M</div>
                         </div>

                         <div className="flex flex-col p-4 rounded-xl border border-[#ff7260] bg-[#ff7260]/5 cursor-pointer relative shadow-[inset_0_0_20px_rgba(255,142,127,0.1)] hover:bg-[#ff7260]/10 transition-colors">
                            <div className="flex items-center justify-between">
                               <div>
                                  <div className="font-bold text-white text-lg">1 Năm</div>
                                  <div className="text-xs text-gray-400">Tiết kiệm 50%</div>
                               </div>
                               <div className="text-right">
                                  <div className="font-black text-white text-xl">2.79M</div>
                                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">~232K/Tháng</div>
                               </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-[#ff7260]/20 flex items-center gap-2">
                               <Gift className="w-4 h-4 text-[#f8a018]" />
                               <span className="text-[11px] font-bold text-[#f8a018] uppercase tracking-wider">Tặng kèm Tài khoản Veo 3 Ultra</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col gap-4 mb-10 flex-1 pl-2">
                         {[
                            "Sử dụng AI Station nội bộ của Koda",
                            "Bao trọn toàn bộ chi phí API",
                            "Hỗ trợ đăng nhập trên 2 thiết bị"
                         ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4">
                               <Zap className="w-4 h-4 text-[#ff8e7f] shrink-0 fill-[#ff8e7f] mt-1" />
                               <span className="text-gray-300 font-medium text-sm md:text-base leading-snug">{item}</span>
                            </div>
                         ))}
                      </div>

                      <a 
                         href="https://zalo.me/0789284078"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full py-4 px-6 bg-gradient-to-br from-[#ff8e7f] to-[#ff7765] hover:scale-[1.02] border-none rounded-xl font-bold text-black text-sm transition-all shadow-[0_5px_20px_rgba(255,142,127,0.3)] flex items-center justify-center gap-2 uppercase tracking-wider"
                      >
                         <MessageCircle className="w-5 h-5 fill-black" /> Mua Qua Zalo Ngay
                      </a>
                   </div>
                </div>
            </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
