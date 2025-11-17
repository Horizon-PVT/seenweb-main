import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Tuyên Bố Miễn Trừ Trách Nhiệm</h1>

        <p className="text-gray-300 mb-4">
          SeenYT (vận hành bởi CÔNG TY CỔ PHẦN DỊCH VỤ QUỐC TẾ NTC) cung cấp công cụ
          AI phục vụ mục đích hỗ trợ sáng tạo nội dung. Chúng tôi KHÔNG chịu trách
          nhiệm cho mọi hậu quả phát sinh từ việc sử dụng các công cụ này.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Nội Dung Do AI Tạo Ra
        </h2>
        <p className="text-gray-300 mb-4">
          Nội dung được tạo bởi AI dựa trên dữ liệu người dùng nhập vào. Chúng tôi
          không đảm bảo:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Tính chính xác hoặc phù hợp pháp luật trong mọi trường hợp.</li>
          <li>Khả năng được YouTube hoặc nền tảng khác chấp thuận.</li>
          <li>Sự an toàn, trung thực hoặc độ tin cậy tuyệt đối.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Không Chịu Trách Nhiệm Cho Thiệt Hại
        </h2>
        <p className="text-gray-300 mb-4">
          SeenYT không chịu trách nhiệm đối với:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Thiệt hại tài chính, kinh doanh hoặc uy tín cá nhân.</li>
          <li>
            Việc YouTube từ chối video, hạn chế phân phối hoặc áp dụng hình
            phạt với kênh.
          </li>
          <li>
            Bất kỳ tranh chấp nào liên quan đến bản quyền, nội dung, thương
            hiệu hoặc quyền cá nhân.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Tự Chịu Trách Nhiệm
        </h2>
        <p className="text-gray-300 mb-8">
          Khi sử dụng SeenYT, bạn đồng ý rằng bạn hoàn toàn chịu trách nhiệm
          cho:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-8">
          <li>Cách bạn chỉnh sửa, sử dụng hoặc xuất bản nội dung do AI tạo.</li>
          <li>Việc tuân thủ pháp luật và quy định nền tảng bên thứ ba.</li>
          <li>Mọi quyết định chiến lược nội dung, tài chính và kinh doanh.</li>
        </ul>

        <Link href="/" className="text-blue-400 hover:underline text-lg">
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
