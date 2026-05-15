import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sections = [
  ["1. Chấp nhận điều khoản", "Khi truy cập và sử dụng SeenYT, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ các điều khoản này."],
  ["2. Bản chất dịch vụ", "SeenYT cung cấp công cụ và workflow AI hỗ trợ nghiên cứu, sản xuất, tối ưu và review nội dung YouTube. SeenYT không đảm bảo kết quả view, doanh thu hoặc phê duyệt từ nền tảng bên thứ ba."],
  ["3. Trách nhiệm người dùng", "Bạn chịu trách nhiệm với dữ liệu nhập vào, nội dung do AI hỗ trợ tạo ra, việc xuất bản video và việc tuân thủ luật pháp, chính sách YouTube, bản quyền và quyền riêng tư."],
  ["4. Thanh toán", "Các gói trả phí được kích hoạt theo chu kỳ đã chọn. Yêu cầu hoàn tiền hoặc hỗ trợ thanh toán được xử lý theo từng trường hợp và theo dữ liệu giao dịch thực tế."],
  ["5. Giới hạn trách nhiệm", "SeenYT được cung cấp theo hiện trạng. Chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp, mất doanh thu, mất dữ liệu hoặc thay đổi thuật toán từ nền tảng bên thứ ba."],
  ["6. Thay đổi điều khoản", "Chúng tôi có thể cập nhật điều khoản theo thời gian. Phiên bản mới sẽ được công bố trên website."],
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Head>
        <title>Terms - SeenYT</title>
        <meta name="description" content="SeenYT terms of service." />
      </Head>
      <Header />
      <main className="px-4 pb-20 pt-32 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black">Điều khoản dịch vụ</h1>
          <p className="mt-4 leading-7 text-slate-400">
            SeenYT được vận hành bởi CÔNG TY CỔ PHẦN DỊCH VỤ QUỐC TẾ NTC. Các điều khoản dưới đây áp dụng cho việc sử dụng website, Studio, AI Coach và các workflow liên quan.
          </p>
          <div className="mt-8 space-y-4">
            {sections.map(([title, body]) => (
              <section key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-xl font-black text-white">{title}</h2>
                <p className="mt-3 leading-7 text-slate-400">{body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
