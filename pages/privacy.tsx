import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sections = [
  ["Dữ liệu chúng tôi thu thập", "Email tài khoản, thông tin gói dịch vụ, lịch sử thanh toán, dữ liệu sử dụng công cụ và nội dung bạn nhập khi dùng các workflow AI."],
  ["Mục đích sử dụng", "Dữ liệu được dùng để vận hành dịch vụ, kích hoạt tài khoản, chống gian lận, cải thiện chất lượng sản phẩm và hỗ trợ người dùng."],
  ["Chia sẻ dữ liệu", "Chúng tôi không bán dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ khi cần xử lý thanh toán, vận hành dịch vụ, tuân thủ yêu cầu pháp lý hoặc khi có sự đồng ý phù hợp."],
  ["Lưu trữ và bảo mật", "Dữ liệu được lưu trữ trong thời gian cần thiết để cung cấp dịch vụ và tuân thủ nghĩa vụ pháp lý. Chúng tôi áp dụng biện pháp kỹ thuật và tổ chức để giảm rủi ro truy cập trái phép."],
  ["Quyền của người dùng", "Bạn có thể liên hệ để cập nhật thông tin, hỏi về dữ liệu cá nhân hoặc yêu cầu xử lý tài khoản trong trường hợp hợp lý."],
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Head>
        <title>Privacy - SeenYT</title>
        <meta name="description" content="SeenYT privacy policy." />
      </Head>
      <Header />
      <main className="px-4 pb-20 pt-32 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black">Chính sách bảo mật</h1>
          <p className="mt-4 leading-7 text-slate-400">
            SeenYT tôn trọng quyền riêng tư của người dùng và chỉ xử lý dữ liệu để cung cấp, bảo vệ và cải thiện dịch vụ.
          </p>
          <div className="mt-8 space-y-4">
            {sections.map(([title, body]) => (
              <section key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-xl font-black text-white">{title}</h2>
                <p className="mt-3 leading-7 text-slate-400">{body}</p>
              </section>
            ))}
          </div>
          <p className="mt-8 text-slate-400">Liên hệ về quyền riêng tư: <span className="text-cyan-300">ntcgroup90@gmail.com</span></p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
