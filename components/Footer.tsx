import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslation } from "next-i18next";

const CodeRain = dynamic(
  () => import("./CodeRain"),
  { ssr: false }
);

const Footer: React.FC = () => {
  const { t } = useTranslation("common");

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
            <p className="text-gray-500 max-w-xl whitespace-pre-line">
              {t("footer.mission", "Sứ mệnh của SeenYT là trao quyền cho mọi creator Việt Nam – đặc biệt là những bạn mới bắt đầu, không cần kinh nghiệm, không cần vốn lớn – có thể tạo nội dung chất lượng, tìm được ngách kiếm tiền cao, tối ưu SEO, thumbnail, kịch bản… để biến đam mê YouTube thành nguồn thu nhập thực sự và bền vững.\nChúng tôi tin rằng: Ai cũng xứng đáng có cơ hội tỏa sáng trên YouTube, không phân biệt xuất phát điểm. Và SeenYT sẽ luôn đồng hành cùng các bạn trên hành trình đó.")}
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <Link href="/affiliate" className="text-[#CDAD5A] hover:text-yellow-400 font-semibold">
                💰 {t("footer.become_partner", "Trở thành đối tác")}
              </Link>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400 text-sm">{t("footer.company", "Sản phẩm của Công Ty CP Dịch Vụ Quốc Tế NTC")}</span>
            </div>
          </div>

          {/* Cột 2 – Điều hướng */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">{t("footer.navigation", "Điều Hướng")}</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleNavClick(e, "#about")}
                  className="hover:text-[#CDAD5A]"
                >
                  {t("footer.info", "Thông Tin")}
                </a>
              </li>
              <li>
                <a
                  href="#bang-cong-cu-seenyt"
                  onClick={(e) => handleNavClick(e, "#bang-cong-cu-seenyt")}
                  className="hover:text-[#CDAD5A]"
                >
                  {t("footer.tools_board", "Bảng Công Cụ")}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleNavClick(e, "#pricing")}
                  className="hover:text-[#CDAD5A]"
                >
                  {t("footer.pricing_link", "Bảng Giá")}
                </a>
              </li>
              <li>
                <Link href="/coaching" className="hover:text-[#CDAD5A]">
                  {t("footer.coaching", "Huấn luyện 1-1")}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#CDAD5A]">
                  {t("footer.services", "Dịch vụ Solutions")}
                </Link>
              </li>

            </ul>
          </div>

          {/* Cột 3 – Pháp lý */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">{t("footer.legal", "Pháp Lý")}</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/legal" className="hover:text-[#CDAD5A]">
                  {t("footer.legal_info", "Thông Tin Pháp Lý")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#CDAD5A]">
                  {t("footer.terms", "Điều Khoản Dịch Vụ")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#CDAD5A]">
                  {t("footer.privacy", "Chính Sách Bảo Mật")}
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[#CDAD5A]">
                  {t("footer.disclaimer", "Tuyên Bố Miễn Trừ")}
                </Link>
              </li>
              <li>
                <Link href="/aup" className="hover:text-[#CDAD5A]">
                  {t("footer.aup", "Chính Sách Sử Dụng Hợp Lệ")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#CDAD5A]">
                  {t("footer.contact", "Liên Hệ")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="mt-12 border-t border-gray-800/50 pt-6 text-center text-gray-600">
          <p>
            {t("footer.copyright", "© 2025 SeenYT. Bảo lưu mọi quyền.")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
