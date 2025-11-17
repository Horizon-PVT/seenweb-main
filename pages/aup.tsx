import Link from "next/link";

export default function AUPPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Chính Sách Sử Dụng Hợp Lệ (AUP)
        </h1>

        <p className="text-gray-300 mb-4">
          Chính sách này nhằm đảm bảo SeenYT được sử dụng đúng mục đích, tránh
          lạm dụng, bảo vệ nền tảng và cộng đồng người dùng.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Hành Vi Bị Cấm</h2>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>
            Tạo nội dung vi phạm pháp luật Việt Nam hoặc quốc tế, bao gồm nhưng
            không giới hạn: kích động bạo lực, thù hằn, phân biệt đối xử.
          </li>
          <li>
            Sử dụng công cụ để lừa đảo, giả mạo danh tính, quấy rối hoặc gây
            tổn hại tới cá nhân/tổ chức khác.
          </li>
          <li>
            Spam nội dung, quét dữ liệu hàng loạt hoặc sử dụng bot/script trái
            phép để gọi dịch vụ.
          </li>
          <li>
            Cố tình phá hoại, tấn công, thử nghiệm bảo mật trái phép với hệ
            thống.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Nội Dung Bản Quyền
        </h2>
        <p className="text-gray-300 mb-4">
          Bạn phải đảm bảo rằng mọi nội dung bạn tải lên, nhập vào hoặc yêu cầu
          AI xử lý không vi phạm bản quyền, nhãn hiệu, quyền riêng tư hoặc các
          quyền khác của bên thứ ba.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Hành Vi Gian Lận & Lách Hệ Thống
        </h2>
        <p className="text-gray-300 mb-2">
          Các hành vi sau có thể dẫn đến khoá tài khoản ngay lập tức:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>
            Tạo nhiều tài khoản chỉ nhằm mục đích lách giới hạn sử dụng hoặc
            chính sách giá.
          </li>
          <li>
            Cố ý nhập sai thông tin thanh toán nhằm giả mạo giao dịch hoặc kích
            hoạt gói trái phép.
          </li>
          <li>
            Dùng tool để cung cấp dịch vụ lại cho bên thứ ba mà không có thoả
            thuận với SeenYT.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. Quyền Xử Lý Của SeenYT
        </h2>
        <p className="text-gray-300 mb-8">
          SeenYT có toàn quyền tạm ngưng, giới hạn hoặc chấm dứt dịch vụ đối
          với bất kỳ tài khoản nào vi phạm AUP. Trong các trường hợp nghiêm
          trọng, chúng tôi có thể phối hợp với cơ quan chức năng nếu cần thiết.
        </p>

        <Link href="/" className="text-blue-400 hover:underline text-lg">
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
