import React, { useState } from "react";
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

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const changeLanguage = (locale: string) => {
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, { locale });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/55 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/#bang-cong-cu-seenyt" className="flex items-center gap-3 group select-none">
          <Image
            src="/seenyt-mark.png"
            alt="SeenYT Logo"
            width={36}
            height={36}
            priority
            className="seenyt-logo-icon"
          />
          <span className="seenyt-wordmark">
            Seen<span>YT</span>
          </span>
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* 0. Newbie */}
          <Link
            href="/new-youtuber"
            className="text-[#00ffb4] hover:text-[#CDAD5A] transition-colors duration-300 font-bold text-sm flex items-center gap-1"
          >
            {t('menu.newbie', 'YouTube Mới')}
            <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">HOT</span>
          </Link>

          {/* 1. Huấn luyện */}
          <Link
            href="/coaching"
            className="text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-sm"
          >
            {t('menu.coaching', 'Huấn luyện')}
          </Link>

          {/* 2. Cá nhân */}
          <Link
            href="/dashboard"
            className="text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-sm"
          >
            {t('menu.personal', 'Cá nhân')}
          </Link>

          {/* 3. Tính năng Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-sm py-2">
              {t('menu.features', 'Tính năng')}
              <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-full left-0 mt-0 w-48 bg-[#18181b] border border-white/10 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0 overflow-hidden">
              <a
                href="#bang-cong-cu-seenyt"
                onClick={(e) => handleNavClick(e, "#bang-cong-cu-seenyt")}
                className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#CDAD5A] transition-colors"
              >
                {t('menu.tools', 'Bảng công cụ')}
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleNavClick(e, "#pricing")}
                className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#CDAD5A] transition-colors"
              >
                {t('menu.pricing', 'Bảng giá')}
              </a>
            </div>
          </div>

          {/* 4. Khám phá Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-sm py-2">
              {t('menu.explore', 'Khám phá')}
              <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-full left-0 mt-0 w-56 bg-[#18181b] border border-white/10 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0 overflow-hidden">
              <Link
                href="/affiliate"
                className="block px-4 py-3 text-sm text-[#00a3a3] hover:bg-white/5 hover:text-[#4ddcdc] transition-colors uppercase font-semibold"
              >
                {t('menu.affiliate', 'Trở thành đối tác')}
              </Link>
              <Link
                href="/tuyendung"
                className="block px-4 py-3 text-sm text-cyan-400 hover:bg-white/5 hover:text-cyan-300 transition-colors font-bold tracking-wide"
              >
                {t('menu.hiring', 'TUYỂN DỤNG')}
              </Link>
            </div>
          </div>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center space-x-4">

          {/* Language Selector - Globe Icon Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 p-2 rounded-md hover:bg-white/5">
              {/* Globe Icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-xs font-semibold uppercase">{router.locale}</span>
              <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-1 w-48 bg-[#18181b] border border-white/10 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
              <button
                onClick={() => changeLanguage('vi')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${router.locale === 'vi' ? 'bg-[#CDAD5A]/20 text-[#CDAD5A] font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="text-lg">🇻🇳</span>
                <span>Tiếng Việt</span>
                {router.locale === 'vi' && <span className="ml-auto text-xs">✓</span>}
              </button>

              <button
                onClick={() => changeLanguage('en')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${router.locale === 'en' ? 'bg-[#CDAD5A]/20 text-[#CDAD5A] font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="text-lg">🇬🇧</span>
                <span>English</span>
                {router.locale === 'en' && <span className="ml-auto text-xs">✓</span>}
              </button>

              <button
                onClick={() => changeLanguage('ja')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${router.locale === 'ja' ? 'bg-[#CDAD5A]/20 text-[#CDAD5A] font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="text-lg">🇯🇵</span>
                <span>日本語</span>
                {router.locale === 'ja' && <span className="ml-auto text-xs">✓</span>}
              </button>

              <button
                onClick={() => changeLanguage('ko')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${router.locale === 'ko' ? 'bg-[#CDAD5A]/20 text-[#CDAD5A] font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="text-lg">🇰🇷</span>
                <span>한국어</span>
                {router.locale === 'ko' && <span className="ml-auto text-xs">✓</span>}
              </button>

              <button
                onClick={() => changeLanguage('th')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${router.locale === 'th' ? 'bg-[#CDAD5A]/20 text-[#CDAD5A] font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="text-lg">🇹🇭</span>
                <span>ไทย</span>
                {router.locale === 'th' && <span className="ml-auto text-xs">✓</span>}
              </button>

              <button
                onClick={() => changeLanguage('id')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${router.locale === 'id' ? 'bg-[#CDAD5A]/20 text-[#CDAD5A] font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="text-lg">🇮🇩</span>
                <span>Bahasa Indonesia</span>
                {router.locale === 'id' && <span className="ml-auto text-xs">✓</span>}
              </button>

              <button
                onClick={() => changeLanguage('es')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${router.locale === 'es' ? 'bg-[#CDAD5A]/20 text-[#CDAD5A] font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="text-lg">🇪🇸</span>
                <span>Español</span>
                {router.locale === 'es' && <span className="ml-auto text-xs">✓</span>}
              </button>
            </div>
          </div>

          {isLoadingSession ? (
            <span className="text-white/60 text-sm font-semibold">
              {t('header.checking')}
            </span>
          ) : isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <span className="text-[#4ddcdc] text-sm font-semibold">
                👋 {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded-sm text-white text-sm hover:bg-red-600 transition-all"
              >
                {t('menu.logout', 'ĐĂNG XUẤT')}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                {t('header.login')}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#008080] text-white font-bold py-2 px-5 border border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] hover:shadow-[0_0_15px_#008080]"
              >
                {t('header.register')}
              </button>
            </>
          )}
        </div>
      </div>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Header;
