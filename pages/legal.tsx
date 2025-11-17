import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Thông Tin Pháp Lý</h1>

        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>Tên pháp nhân:</strong> CÔNG TY CỔ PHẦN DỊCH VỤ QUỐC TẾ NTC
          </p>
          <p>
            <strong>Mã số thuế:</strong> 0109947712
          </p>
          <p>
            <strong>Địa chỉ đăng ký doanh nghiệp:</strong>
            <br />
            V11-A04-102 Nguyễn Thanh Bình, Phường La Khê, Quận Hà Đông, Thành
            phố Hà Nội, Việt Nam
          </p>
          <p>
            <strong>Người đại diện pháp luật:</strong> PHẠM VĂN TÙNG
          </p>
          <p>
            <strong>Ngày thành lập:</strong> 30/03/2022
          </p>
          <p>
            <strong>Email liên hệ chính thức:</strong> ntcgroup90@gmail.com
          </p>
          <p>
            <strong>Số điện thoại:</strong> 0789 284 078
          </p>
        </div>

        <p className="mt-8 text-gray-400 text-base">
          Website được vận hành bởi CÔNG TY CỔ PHẦN DỊCH VỤ QUỐC TẾ NTC. Tất cả
          dịch vụ trên SeenYT tuân thủ theo quy định pháp luật Việt Nam hiện
          hành.
        </p>

        <div className="mt-10">
          <Link href="/" className="text-blue-400 hover:underline text-lg">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
