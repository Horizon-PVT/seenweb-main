import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Head>
        <title>Legal Info - SeenYT</title>
        <meta name="description" content="Legal information for SeenYT and the company operating the product." />
      </Head>
      <Header />
      <main className="px-4 pb-20 pt-32 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black">Thông tin pháp lý</h1>
          <div className="mt-8 space-y-5 rounded-xl border border-white/10 bg-white/[0.04] p-6 text-slate-300">
            <p><strong className="text-white">Tên pháp nhân:</strong> CÔNG TY CỔ PHẦN DỊCH VỤ QUỐC TẾ NTC</p>
            <p><strong className="text-white">Mã số thuế:</strong> 0109947712</p>
            <p><strong className="text-white">Địa chỉ:</strong> V11-A04-102 Nguyễn Thanh Bình, Phường La Khê, Quận Hà Đông, Thành phố Hà Nội, Việt Nam</p>
            <p><strong className="text-white">Người đại diện pháp luật:</strong> PHẠM VĂN TÙNG</p>
            <p><strong className="text-white">Ngày thành lập:</strong> 30/03/2022</p>
            <p><strong className="text-white">Email liên hệ:</strong> ntcgroup90@gmail.com</p>
            <p><strong className="text-white">Số điện thoại:</strong> 0789 284 078</p>
          </div>
          <p className="mt-6 leading-7 text-slate-400">
            Website được vận hành bởi CÔNG TY CỔ PHẦN DỊCH VỤ QUỐC TẾ NTC. Các dịch vụ trên SeenYT tuân thủ quy định pháp luật Việt Nam hiện hành.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
