import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "./AuthModal";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/55 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <Link href="/#bang-cong-cu-seenyt" className="flex items-center gap-2 sm:gap-3 group select-none flex-shrink-0">
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
            YouTube Mới
            <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">HOT</span>
          </Link>

          {/* 1. Huấn luyện */}
          <Link
            href="/coaching"
            className="text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm whitespace-nowrap"
          >
            Huấn luyện
          </Link>

          {/* 2. Cá nhân */}
          <Link
            href="/dashboard"
            className="text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm whitespace-nowrap"
          >
            Cá nhân
          </Link>

          {/* 3. Tính năng Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm py-2 whitespace-nowrap">
              Tính năng
              <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-full left-0 mt-0 w-48 bg-[#18181b] border border-white/10 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0 overflow-hidden">
              <a
                href="#bang-cong-cu-seenyt"
                onClick={(e) => handleNavClick(e, "#bang-cong-cu-seenyt")}
                className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#CDAD5A] transition-colors"
              >
                Bảng công cụ
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleNavClick(e, "#pricing")}
                className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#CDAD5A] transition-colors"
              >
                Bảng giá
              </a>
            </div>
          </div>

          {/* 4. Khám phá Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm py-2 whitespace-nowrap">
              Khám phá
              <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-full left-0 mt-0 w-56 bg-[#18181b] border border-white/10 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0 overflow-hidden">
              <Link
                href="/affiliate"
                className="block px-4 py-3 text-sm text-[#00a3a3] hover:bg-white/5 hover:text-[#4ddcdc] transition-colors uppercase font-semibold"
              >
                Trở thành đối tác
              </Link>
              <Link
                href="/tuyendung"
                className="block px-4 py-3 text-sm text-cyan-400 hover:bg-white/5 hover:text-cyan-300 transition-colors font-bold tracking-wide"
              >
                TUYỂN DỤNG
              </Link>
              {/* New Promotion Link */}
              <Link
                href="/promotions"
                className="block px-4 py-3 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors font-bold tracking-wide flex items-center gap-2"
              >
                <span className="text-yellow-400">🎁</span> KHUYẾN MẠI
              </Link>
            </div>
          </div>

          {/* 5. Hỗ trợ (Support) Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-xs lg:text-sm py-2 whitespace-nowrap">
              Hỗ trợ
              <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-full left-0 mt-0 w-48 bg-[#18181b] border border-white/10 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0 overflow-hidden">
              <a
                href="https://zalo.me/g/lhxazc331"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-blue-400 hover:bg-white/5 hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                💬 Zalo Hỗ Trợ
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61585796132941"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-blue-600 hover:bg-white/5 hover:text-blue-500 transition-colors flex items-center gap-2"
              >
                📘 Facebook
              </a>
              <a
                href="https://t.me/AdSeenYT"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-sky-400 hover:bg-white/5 hover:text-sky-300 transition-colors flex items-center gap-2"
              >
                ✈️ Telegram
              </a>
              <Link href="/guides">
                <span className="block px-4 py-3 text-sm text-[#CDAD5A] hover:bg-white/5 hover:text-yellow-300 transition-colors flex items-center gap-2 cursor-pointer">
                  📚 Hướng dẫn sử dụng
                </span>
              </Link>
            </div>
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
                className="bg-red-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm text-white text-xs sm:text-sm hover:bg-red-600 transition-all whitespace-nowrap"
              >
                ĐĂNG XUẤT
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm hidden sm:inline"
              >
                ĐĂNG NHẬP
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#008080] text-white font-bold py-1.5 sm:py-2 px-3 sm:px-5 border border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] hover:shadow-[0_0_15px_#008080] text-xs sm:text-sm"
              >
                ĐĂNG KÍ
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
          <div className="md:hidden fixed inset-0 bg-black/60 z-[9998]" onClick={() => setIsMobileMenuOpen(false)}></div>
          {/* Menu */}
          <div ref={mobileMenuRef} className="md:hidden fixed top-[52px] sm:top-[60px] left-0 right-0 bg-[#0a0f1e] border-b border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto z-[9999]">
            <nav className="px-6 py-4 space-y-1">
              {/* User email on mobile */}
              {isLoggedIn && user && (
                <div className="text-[#4ddcdc] text-sm font-semibold pb-3 mb-3 border-b border-white/10 truncate sm:hidden">
                  👋 {user.email}
                </div>
              )}

              <Link
                href="/new-youtuber"
                className="flex items-center gap-2 px-3 py-3 text-[#00ffb4] hover:bg-white/5 rounded-lg font-bold text-sm transition-colors"
              >
                YouTube Mới
                <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">HOT</span>
              </Link>

              <Link
                href="/coaching"
                className="block px-3 py-3 text-white/80 hover:bg-white/5 hover:text-[#CDAD5A] rounded-lg font-semibold text-sm transition-colors"
              >
                Huấn luyện
              </Link>

              <Link
                href="/dashboard"
                className="block px-3 py-3 text-white/80 hover:bg-white/5 hover:text-[#CDAD5A] rounded-lg font-semibold text-sm transition-colors"
              >
                Cá nhân
              </Link>

              {/* Tính năng section */}
              <div className="border-t border-white/5 pt-2 mt-2">
                <span className="block px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tính năng</span>
                <a
                  href="#bang-cong-cu-seenyt"
                  onClick={(e) => handleNavClick(e, "#bang-cong-cu-seenyt")}
                  className="block px-3 py-3 text-white/70 hover:bg-white/5 hover:text-[#CDAD5A] rounded-lg text-sm transition-colors pl-6"
                >
                  Bảng công cụ
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => handleNavClick(e, "#pricing")}
                  className="block px-3 py-3 text-white/70 hover:bg-white/5 hover:text-[#CDAD5A] rounded-lg text-sm transition-colors pl-6"
                >
                  Bảng giá
                </a>
              </div>

              {/* Khám phá section */}
              <div className="border-t border-white/5 pt-2 mt-2">
                <span className="block px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Khám phá</span>
                <Link
                  href="/affiliate"
                  className="block px-3 py-3 text-[#00a3a3] hover:bg-white/5 hover:text-[#4ddcdc] rounded-lg text-sm font-semibold transition-colors pl-6"
                >
                  Trở thành đối tác
                </Link>
                <Link
                  href="/tuyendung"
                  className="block px-3 py-3 text-cyan-400 hover:bg-white/5 hover:text-cyan-300 rounded-lg text-sm font-bold transition-colors pl-6"
                >
                  TUYỂN DỤNG
                </Link>
                <Link
                  href="/promotions"
                  className="block px-3 py-3 text-red-400 hover:bg-white/5 hover:text-red-300 rounded-lg text-sm font-bold transition-colors pl-6"
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
                  className="block px-3 py-3 text-blue-400 hover:bg-white/5 hover:text-blue-300 rounded-lg text-sm transition-colors pl-6"
                >
                  💬 Zalo Hỗ Trợ
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61585796132941"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-3 text-blue-600 hover:bg-white/5 hover:text-blue-500 rounded-lg text-sm transition-colors pl-6"
                >
                  📘 Facebook
                </a>
                <a
                  href="https://t.me/AdSeenYT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-3 text-sky-400 hover:bg-white/5 hover:text-sky-300 rounded-lg text-sm transition-colors pl-6"
                >
                  ✈️ Telegram
                </a>
                <Link href="/guides">
                  <span className="block px-3 py-3 text-[#CDAD5A] hover:bg-white/5 hover:text-yellow-300 rounded-lg text-sm transition-colors pl-6 cursor-pointer">
                    📚 Hướng dẫn sử dụng
                  </span>
                </Link>
              </div>

              {/* Login/Signup on mobile for guests */}
              {!isLoggedIn && !isLoadingSession && (
                <div className="border-t border-white/5 pt-4 mt-3 flex gap-3">
                  <button
                    onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex-1 text-gray-300 border border-gray-600 py-2.5 rounded text-sm font-semibold hover:bg-white/5 transition-colors"
                  >
                    ĐĂNG NHẬP
                  </button>
                  <button
                    onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex-1 bg-[#008080] text-white font-bold py-2.5 rounded text-sm hover:bg-[#006666] transition-colors"
                  >
                    ĐĂNG KÍ
                  </button>
                </div>
              )}
            </nav>
          </div>
        </>
      )}

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Header;
