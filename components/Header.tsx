// File: components/Header.tsx
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "./AuthModal";
import { useSession, signOut } from "next-auth/react";

const Header: React.FC = () => {
  const { data: session, status } = useSession();

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/55 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO + WORDMARK (click về bảng công cụ) */}
        <Link href="/#tools" className="flex items-center gap-3 group select-none">
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
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/coaching"
            className="text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-sm"
          >
            Coaching 1-1
          </Link>

          <a
            href="#tools"
            onClick={(e) => handleNavClick(e, "#tools")}
            className="text-white/70 hover:text-[#CDAD5A] transition-colors duration-300 font-semibold text-sm"
          >
            Bảng công cụ
          </a>






          <a
            href="#about"
            onClick={(e) => handleNavClick(e, "#about")}
            className="text-[#00a3a3] hover:text-[#4ddcdc] transition-colors duration-300 font-semibold text-sm"
          >
            Sản phẩm của Công Ty Cổ Phần Dịch Vụ Quốc Tế NTC
          </a>

          <Link
            href="/tuyendung"
            className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-bold text-sm tracking-wide bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 hover:border-cyan-500/50"
          >
            TUYỂN DỤNG
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center space-x-4">
          {isLoadingSession ? (
            <span className="text-white/60 text-sm font-semibold">
              Đang kiểm tra...
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
                ĐĂNG XUẤT
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                ĐĂNG NHẬP
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#008080] text-white font-bold py-2 px-5 border border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] hover:shadow-[0_0_15px_#008080]"
              >
                ĐĂNG KÍ
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
