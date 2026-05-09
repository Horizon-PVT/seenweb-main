import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { GraduationCap, Users, Rocket, User, Link as LinkIcon, Gift, Flame } from "lucide-react";

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation('common');
  const router = useRouter();

  // QUAN TRỌNG: tránh trạng thái "vừa redirect xong nhưng session đang hydrate"
  const isLoadingSession = status === "loading";
  const isLoggedIn = status === "authenticated";
  const user = session?.user;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (router.pathname === '/') {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      router.push('/' + targetId);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const changeLanguage = (locale: string) => {
    // Set cookie for persistence (optional but good for production)
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;

    // Use window.location as last resort fallback if router fails, but try router first
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, { locale, scroll: false })
      .catch((err) => {
        // Fallback for some dynamic route edge cases
        console.error('Language switch failed via router, trying window.location', err);
        window.location.href = `/${locale}${router.asPath}`;
      });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] flex flex-col">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 py-1.5 px-4 text-center text-white text-[11px] sm:text-xs md:text-sm font-bold shadow-md shadow-red-900/20 relative z-[61]">
        <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
          <span className="animate-pulse text-yellow-300"><Flame size={14} /></span>
          <span>{t('header.announcement_1', 'Ưu đãi gói Setup chỉ dành cho')} <span className="text-yellow-300 text-base md:text-lg">10</span> {t('header.announcement_2', 'người đăng ký sớm nhất tuần này!')}</span>
          <Link href="/services" className="underline text-yellow-100 hover:text-white transition-colors ml-2 bg-white/20 px-2 py-0.5 rounded-full border border-white/30 truncate max-w-full">
            {t('header.announcement_cta', 'Khám phá ngay')}
          </Link>
        </span>
      </div>

      <div className="bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] w-full">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/#hero" className="flex items-center gap-2 sm:gap-3 group select-none flex-shrink-0">
            <Image
              src="/seenyt-mark.png"
              alt="SeenYT Logo"
              width={32}
              height={32}
              priority
              className="seenyt-logo-icon w-7 h-7 sm:w-9 sm:h-9"
            />
            <span className="seenyt-wordmark text-base sm:text-lg">
              Seen<span>YT</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav id="desktop-nav" className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* 0. Newbie */}
            <Link
              href="/new-youtuber"
              className="text-[#00ffb4] hover:text-[#CDAD5A] transition-colors duration-300 font-bold text-xs lg:text-sm flex items-center gap-1 whitespace-nowrap"
            >
              {t('header.youtube_new', 'YouTube Mới')}
              <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">HOT</span>
            </Link>
            {/* 1. Hệ sinh thái Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm py-2 whitespace-nowrap">
                {t('header.ecosystem', 'Hệ sinh thái')}
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div className="absolute top-full left-0 mt-0 w-56 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <Link
                  href="/academy"
                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-[#CDAD5A] transition-colors flex items-center gap-2"
                >
                  <span className="text-purple-400"><GraduationCap size={16} /></span> Academy
                </Link>
                <Link
                  href="/coaching"
                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-[#CDAD5A] transition-colors flex items-center gap-2"
                >
                  <span className="text-purple-400"><Users size={16} /></span> Huấn luyện 1-1
                </Link>
                <Link
                  href="/services"
                  className="block px-4 py-3 text-sm text-[#CDAD5A] hover:bg-white/10 hover:text-yellow-300 transition-colors font-bold flex items-center gap-2"
                >
                  <span className="text-orange-400"><Rocket size={16} /></span> Dịch vụ
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-[#CDAD5A] transition-colors flex items-center gap-2"
                >
                  <span className="text-blue-400"><User size={16} /></span> Cá nhân
                </Link>
                <Link
                  href="/affiliate"
                  className="block px-4 py-3 text-sm text-[#00a3a3] hover:bg-white/10 hover:text-[#4ddcdc] transition-colors font-semibold flex items-center gap-2"
                >
                  <span className="text-green-400"><LinkIcon size={16} /></span> Affiliate
                </Link>
              </div>
            </div>

            {/* 3. Tính năng Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm py-2 whitespace-nowrap">
                {t('header.features', 'Tính năng')}
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div className="absolute top-full left-0 mt-0 w-48 bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <a
                  href="#bang-cong-cu-seenyt"
                  onClick={(e) => handleNavClick(e, "#bang-cong-cu-seenyt")}
                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-[#CDAD5A] transition-colors"
                >
                  {t('header.tools_board', 'Bảng công cụ')}
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => handleNavClick(e, "#pricing")}
                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-[#CDAD5A] transition-colors"
                >
                  {t('header.pricing', 'Bảng giá')}
                </a>
              </div>
            </div>

            {/* 4. Khám phá Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm py-2 whitespace-nowrap">
                {t('header.explore', 'Khám phá')}
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div className="absolute top-full left-0 mt-0 w-56 bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <Link
                  href="/tuyendung"
                  className="block px-4 py-3 text-sm text-cyan-400 hover:bg-white/10 hover:text-cyan-300 transition-colors font-bold tracking-wide"
                >
                  {t('header.hiring', 'TUYỂN DỤNG')}
                </Link>
                <Link
                  href="/promotions"
                  className="block px-4 py-3 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors font-bold tracking-wide flex items-center gap-2"
                >
                  <span className="text-yellow-400"><Gift size={16} /></span> {t('header.promotions', 'KHUYẾN MẠI')}
                </Link>
              </div>
            </div>

            {/* 5. Hỗ trợ (Support) Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm py-2 whitespace-nowrap">
                {t('header.support', 'Hỗ trợ')}
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div className="absolute top-full left-0 mt-0 w-48 bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <a
                  href="https://zalo.me/g/lhxazc331"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm text-blue-400 hover:bg-white/10 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  💬 Zalo Hỗ Trợ
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61585796132941"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm text-blue-600 hover:bg-white/10 hover:text-blue-500 transition-colors flex items-center gap-2"
                >
                  📘 Facebook
                </a>
                <a
                  href="https://t.me/AdSeenYT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm text-sky-400 hover:bg-white/10 hover:text-sky-300 transition-colors flex items-center gap-2"
                >
                  ✈️ Telegram
                </a>
                <Link href="/guides">
                  <span className="block px-4 py-3 text-sm text-[#CDAD5A] hover:bg-white/10 hover:text-yellow-300 transition-colors flex items-center gap-2 cursor-pointer">
                    📚 Hướng dẫn sử dụng
                  </span>
                </Link>
              </div>
            </div>

            {/* LANGUAGE SWITCHER MOVED HERE */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm py-2 whitespace-nowrap border-l border-white/10 pl-4 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                <span>{router.locale === 'en' ? 'EN' : 'VI'}</span>
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div className="absolute top-full right-0 mt-0 w-36 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <button
                  onClick={() => changeLanguage('vi')}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${router.locale === 'vi' ? 'bg-white/15 text-white font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="w-5 h-auto rounded-sm border border-white/10" /> Tiếng Việt
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${router.locale === 'en' ? 'bg-white/15 text-white font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-5 h-auto rounded-sm border border-white/10" /> English
                </button>
              </div>
            </div>

            {/* THEME TOGGLE */}
            <div className="border-l border-white/10 pl-4 ml-2">
              <ThemeToggle />
            </div>
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4">

            {isLoadingSession ? (
              <span className="text-white/60 text-xs sm:text-sm font-semibold">
                Đang kiểm tra...
              </span>
            ) : isLoggedIn && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[#4ddcdc] text-xs sm:text-sm font-semibold hidden sm:inline truncate max-w-[150px] lg:max-w-none">
                  👋 {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 border border-red-500/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-red-500 text-xs sm:text-sm hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
                >
                  ĐĂNG XUẤT
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm hidden sm:inline font-bold uppercase"
                >
                  {t('menu.login', 'ĐĂNG NHẬP')}
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-purple-600 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-5 border border-purple-500 rounded-lg transition-all duration-300 hover:bg-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] text-xs sm:text-sm uppercase"
                >
                  {t('header.register', 'ĐĂNG KÍ')}
                </button>
              </>
            )}

            {/* HAMBURGER BUTTON - mobile only */}
            <button
              id="mobile-hamburger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 ml-1"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* MOBILE MENU OVERLAY */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={() => setIsMobileMenuOpen(false)}></div>
            {/* Menu */}
            <div ref={mobileMenuRef} className="md:hidden fixed top-[52px] sm:top-[60px] left-0 right-0 bg-[#0a0f1e]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto z-[9999]">
              <nav className="px-6 py-4 space-y-1">
                {/* User email on mobile */}
                {isLoggedIn && user && (
                  <div className="text-[#4ddcdc] text-sm font-semibold pb-3 mb-3 border-b border-white/10 truncate sm:hidden">
                    👋 {user.email}
                  </div>
                )}

                {/* Mobile Language Switcher */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 mb-2">
                  <span className="text-gray-400 text-sm font-semibold mr-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe inline-block mr-1"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Ngôn ngữ
                  </span>
                  <button onClick={() => changeLanguage('vi')} className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${router.locale === 'vi' ? 'bg-[#CDAD5A] text-black font-bold' : 'bg-gray-800 text-white'}`}>VN</button>
                  <button onClick={() => changeLanguage('en')} className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${router.locale === 'en' ? 'bg-[#CDAD5A] text-black font-bold' : 'bg-gray-800 text-white'}`}>EN</button>
                </div>

                <Link
                  href="/new-youtuber"
                  className="flex items-center gap-2 px-3 py-3 text-[#00ffb4] hover:bg-white/5 rounded-xl font-bold text-sm transition-colors"
                >
                  YouTube Mới
                  <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">HOT</span>
                </Link>

                <Link
                  href="/coaching"
                  className="block px-3 py-3 text-white/80 hover:bg-white/5 hover:text-[#CDAD5A] rounded-xl font-semibold text-sm transition-colors"
                >
                  Huấn luyện
                </Link>

                <Link
                  href="/dashboard"
                  className="block px-3 py-3 text-white/80 hover:bg-white/5 hover:text-[#CDAD5A] rounded-xl font-semibold text-sm transition-colors"
                >
                  Cá nhân
                </Link>

                {/* Hệ sinh thái section */}
                <div className="border-t border-white/5 pt-2 mt-2">
                  <span className="block px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hệ sinh thái</span>
                  <Link
                    href="/academy"
                    className="block px-3 py-3 text-white/70 hover:bg-white/5 hover:text-[#CDAD5A] rounded-xl text-sm transition-colors pl-6"
                  >
                    🎓 Academy
                  </Link>
                  <Link
                    href="/coaching"
                    className="block px-3 py-3 text-white/70 hover:bg-white/5 hover:text-[#CDAD5A] rounded-xl text-sm transition-colors pl-6"
                  >
                    🧑‍🏫 Huấn luyện 1-1
                  </Link>
                  <Link
                    href="/services"
                    className="block px-3 py-3 text-[#CDAD5A] hover:bg-white/5 hover:text-yellow-300 rounded-xl text-sm font-bold transition-colors pl-6"
                  >
                    🚀 Dịch vụ
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-3 text-white/70 hover:bg-white/5 hover:text-[#CDAD5A] rounded-xl text-sm transition-colors pl-6"
                  >
                    👤 Cá nhân
                  </Link>
                  <Link
                    href="/affiliate"
                    className="block px-3 py-3 text-[#00a3a3] hover:bg-white/5 hover:text-[#4ddcdc] rounded-xl text-sm font-semibold transition-colors pl-6"
                  >
                    🤝 Affiliate
                  </Link>
                </div>

                {/* Tính năng section */}
                <div className="border-t border-white/5 pt-2 mt-2">
                  <span className="block px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tính năng</span>
                  <a
                    href="#bang-cong-cu-seenyt"
                    onClick={(e) => handleNavClick(e, "#bang-cong-cu-seenyt")}
                    className="block px-3 py-3 text-white/70 hover:bg-white/5 hover:text-[#CDAD5A] rounded-xl text-sm transition-colors pl-6"
                  >
                    Bảng công cụ
                  </a>
                  <a
                    href="#pricing"
                    onClick={(e) => handleNavClick(e, "#pricing")}
                    className="block px-3 py-3 text-white/70 hover:bg-white/5 hover:text-[#CDAD5A] rounded-xl text-sm transition-colors pl-6"
                  >
                    Bảng giá
                  </a>
                </div>

                {/* Khám phá section */}
                <div className="border-t border-white/5 pt-2 mt-2">
                  <span className="block px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Khám phá</span>
                  <Link
                    href="/tuyendung"
                    className="block px-3 py-3 text-cyan-400 hover:bg-white/5 hover:text-cyan-300 rounded-xl text-sm font-bold transition-colors pl-6"
                  >
                    TUYỂN DỤNG
                  </Link>
                  <Link
                    href="/promotions"
                    className="block px-3 py-3 text-red-400 hover:bg-white/5 hover:text-red-300 rounded-xl text-sm font-bold transition-colors pl-6"
                  >
                    🎁 KHUYẾN MẠI
                  </Link>
                </div>

                {/* Hỗ trợ section */}
                <div className="border-t border-white/5 pt-2 mt-2">
                  <span className="block px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hỗ trợ</span>
                  <a
                    href="https://zalo.me/g/lhxazc331"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-3 text-blue-400 hover:bg-white/5 hover:text-blue-300 rounded-xl text-sm transition-colors pl-6"
                  >
                    💬 Zalo Hỗ Trợ
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61585796132941"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-3 text-blue-600 hover:bg-white/5 hover:text-blue-500 rounded-xl text-sm transition-colors pl-6"
                  >
                    📘 Facebook
                  </a>
                  <a
                    href="https://t.me/AdSeenYT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-3 text-sky-400 hover:bg-white/5 hover:text-sky-300 rounded-xl text-sm transition-colors pl-6"
                  >
                    ✈️ Telegram
                  </a>
                  <Link href="/guides">
                    <span className="block px-3 py-3 text-[#CDAD5A] hover:bg-white/5 hover:text-yellow-300 rounded-xl text-sm transition-colors pl-6 cursor-pointer">
                      📚 Hướng dẫn sử dụng
                    </span>
                  </Link>
                </div>

                {/* Login/Signup on mobile for guests */}
                {!isLoggedIn && !isLoadingSession && (
                  <div className="border-t border-white/5 pt-4 mt-3 flex gap-3">
                    <button
                      onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }}
                      className="flex-1 text-gray-300 border border-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors"
                    >
                      ĐĂNG NHẬP
                    </button>
                    <button
                      onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }}
                      className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-purple-500 transition-colors"
                    >
                      ĐĂNG KÍ
                    </button>
                  </div>
                )}
              </nav>
            </div>
          </>
        )}

      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header >
  );
};

export default Header;

