import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { Bot, CreditCard, FileText, Globe2, LogOut, Menu, X } from "lucide-react";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isLoadingSession = status === "loading";
  const isLoggedIn = status === "authenticated";
  const user = session?.user;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  const changeLanguage = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, { locale, scroll: false });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navItems = [
    { label: "Studio", href: "/dashboard", icon: Globe2 },
    { label: "AI Coach", href: "/dashboard/ai-coach", icon: Bot },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
    { label: "Guides", href: "/guides", icon: FileText },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-[60] border-b border-white/10 bg-[#070b10]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/seenyt-mark.png" alt="SeenYT" width={36} height={36} priority className="rounded-lg" />
          <div>
            <div className="text-lg font-black leading-none text-white">SeenYT</div>
            <div className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:block">
              YouTube Content OS
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-cyan-300">
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-white/10 bg-white/5 p-1 text-xs font-black text-slate-400 sm:flex">
            {["vi", "en", "ja"].map((locale) => (
              <button
                key={locale}
                onClick={() => changeLanguage(locale)}
                className={`rounded-full px-2.5 py-1 uppercase ${router.locale === locale ? "bg-cyan-300 text-slate-950" : "hover:text-white"}`}
              >
                {locale}
              </button>
            ))}
          </div>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {isLoadingSession ? (
            <span className="hidden text-sm font-semibold text-slate-400 sm:inline">Checking...</span>
          ) : isLoggedIn && user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="max-w-[180px] truncate text-sm font-semibold text-cyan-200">{user.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:border-red-400/50 hover:text-red-300"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-200 sm:inline-flex"
            >
              Get started
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="border-t border-white/10 bg-[#070b10] px-4 py-4 md:hidden">
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-200">
                  <Icon size={17} className="text-cyan-300" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-xs font-black text-slate-400">
              {["vi", "en", "ja"].map((locale) => (
                <button
                  key={locale}
                  onClick={() => changeLanguage(locale)}
                  className={`rounded-full px-2.5 py-1 uppercase ${router.locale === locale ? "bg-cyan-300 text-slate-950" : "hover:text-white"}`}
                >
                  {locale}
                </button>
              ))}
            </div>

            {isLoggedIn ? (
              <button onClick={handleLogout} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-200">
                Log out
              </button>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">
                Get started
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Header;
