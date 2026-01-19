import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslation } from 'next-i18next';

const CodeRain = dynamic(
  () => import("./CodeRain"),
  { ssr: false }
);

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
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

  return (
    <footer className="relative bg-black border-t border-gray-800/50 pt-16 pb-8 overflow-hidden">
      <CodeRain />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Cột 1 */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-2xl font-playfair font-bold text-[#CDAD5A] tracking-widest mb-4">
              SeenYT
            </h4>
            <p className="text-gray-500 max-w-md">
              {t('footer.tagline', 'Level the YouTube playing field with the power of advanced AI.')}
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <Link href="/affiliate" className="text-[#CDAD5A] hover:text-yellow-400 font-semibold">
                💰 {t('footer.affiliate_program', 'Affiliate Program')}
              </Link>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400 text-sm">{t('footer.company', 'A product of NTC International Services JSC')}</span>
            </div>
          </div>

          {/* Cột 2 – Điều hướng */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">{t('footer.navigation', 'Navigation')}</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleNavClick(e, "#about")}
                  className="hover:text-[#CDAD5A]"
                >
                  {t('footer.info', 'Information')}
                </a>
              </li>
              <li>
                <a
                  href="#bang-cong-cu-seenyt"
                  onClick={(e) => handleNavClick(e, "#bang-cong-cu-seenyt")}
                  className="hover:text-[#CDAD5A]"
                >
                  {t('footer.tools_board', 'Tools Board')}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleNavClick(e, "#pricing")}
                  className="hover:text-[#CDAD5A]"
                >
                  {t('footer.pricing_link', 'Pricing')}
                </a>
              </li>
              <li>
                <Link href="/coaching" className="hover:text-[#CDAD5A]">
                  {t('footer.coaching', '1-on-1 Coaching')}
                </Link>
              </li>

            </ul>
          </div>

          {/* Cột 3 – Pháp lý */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">{t('footer.legal', 'Legal')}</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/legal" className="hover:text-[#CDAD5A]">
                  {t('footer.legal_info', 'Legal Information')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#CDAD5A]">
                  {t('footer.terms', 'Terms of Service')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#CDAD5A]">
                  {t('footer.privacy', 'Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[#CDAD5A]">
                  {t('footer.disclaimer', 'Disclaimer')}
                </Link>
              </li>
              <li>
                <Link href="/aup" className="hover:text-[#CDAD5A]">
                  {t('footer.aup', 'Acceptable Use Policy')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#CDAD5A]">
                  {t('footer.contact', 'Contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="mt-12 border-t border-gray-800/50 pt-6 text-center text-gray-600">
          <p>
            {t('footer.copyright', '© 2025 SeenYT. All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
