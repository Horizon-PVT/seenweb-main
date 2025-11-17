import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Chính Sách Bảo Mật</h1>

        <p className="text-gray-300 mb-4">
          SeenYT, vận hành bởi CÔNG TY CỔ PHẦN DỊCH VỤ QUỐC TẾ NTC, cam kết tôn
          trọng và bảo vệ quyền riêng tư của người dùng. Chính sách này giải
          thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Dữ Liệu Chúng Tôi Thu Thập
        </h2>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Email đăng ký tài khoản.</li>
          <li>Thông tin gói dịch vụ và lịch sử thanh toán (mã giao dịch).</li>
          <li>
            Lịch sử sử dụng công cụ (mục đích: chống spam, tối ưu chất lượng
            dịch vụ).
          </li>
          <li>
            Nội dung bạn nhập vào khi sử dụng các công cụ AI (script, mô tả,
            từ khóa...).
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Mục Đích Sử Dụng Dữ Liệu
        </h2>
        <p className="text-gray-300 mb-4">
          Chúng tôi sử dụng dữ liệu để:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Cung cấp và duy trì hoạt động của dịch vụ.</li>
          <li>Phát hiện và ngăn chặn hành vi lạm dụng hoặc gian lận.</li>
          <li>Cải thiện chất lượng công cụ và trải nghiệm người dùng.</li>
          <li>Hỗ trợ kỹ thuật và chăm sóc khách hàng.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Chia Sẻ Dữ Liệu Với Bên Thứ Ba
        </h2>
        <p className="text-gray-300 mb-4">
          Chúng tôi không bán hoặc trao đổi dữ liệu người dùng cho bên thứ ba
          vì mục đích thương mại. Dữ liệu chỉ có thể được chia sẻ trong các
          trường hợp sau:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Theo yêu cầu hợp pháp từ cơ quan chức năng có thẩm quyền.</li>
          <li>Khi cần thiết để bảo vệ quyền lợi hợp pháp của SeenYT.</li>
          <li>Khi có sự đồng ý rõ ràng từ phía người dùng.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. Lưu Trữ & Bảo Mật
        </h2>
        <p className="text-gray-300 mb-4">
          Dữ liệu được lưu trữ trên máy chủ an toàn, áp dụng các biện pháp bảo
          mật kỹ thuật và tổ chức nhằm giảm thiểu rủi ro truy cập trái phép,
          mất mát hoặc lạm dụng dữ liệu.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          5. Thời Gian Lưu Trữ
        </h2>
        <p className="text-gray-300 mb-4">
          Dữ liệu được lưu trữ trong thời gian cần thiết để phục vụ mục đích
          cung cấp dịch vụ và tuân thủ nghĩa vụ pháp lý. Một số dữ liệu có thể
          được ẩn danh để phục vụ phân tích dài hạn.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          6. Quyền Của Người Dùng
        </h2>
        <p className="text-gray-300 mb-4">
          Bạn có quyền liên hệ với chúng tôi để:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Cập nhật thông tin tài khoản.</li>
          <li>Yêu cầu xoá tài khoản trong trường hợp hợp lý.</li>
          <li>Đặt câu hỏi liên quan đến việc bảo vệ dữ liệu cá nhân.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">7. Liên Hệ</h2>
        <p className="text-gray-300 mb-8">
          Mọi thắc mắc liên quan đến quyền riêng tư, vui lòng liên hệ:<br />
          Email: <span className="text-blue-400">ntcgroup90@gmail.com</span>
        </p>

        <Link href="/" className="text-blue-400 hover:underline text-lg">
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
