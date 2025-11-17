import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Điều Khoản Dịch Vụ</h1>

        <p className="mb-4 text-gray-300">
          SeenYT được vận hành bởi CÔNG TY CỔ PHẦN DỊCH VỤ QUỐC TẾ NTC
          (&quot;chúng tôi&quot;). Khi truy cập và sử dụng SeenYT, bạn
          (&quot;người dùng&quot;) đồng ý tuân thủ toàn bộ điều khoản dưới đây.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Chấp Nhận Điều Khoản
        </h2>
        <p className="text-gray-300 mb-4">
          Bằng việc sử dụng SeenYT, bạn xác nhận rằng bạn đã đọc, hiểu và đồng
          ý tuân thủ các điều khoản này. Nếu không đồng ý, bạn phải ngừng sử
          dụng dịch vụ ngay lập tức.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Bản Chất Dịch Vụ
        </h2>
        <p className="text-gray-300 mb-4">
          SeenYT cung cấp các công cụ AI hỗ trợ sáng tạo nội dung, nghiên cứu
          và tối ưu hoá chiến lược nội dung YouTube. SeenYT chỉ đóng vai trò
          hỗ trợ, không thay thế cho quyết định chuyên môn hoặc pháp lý của bạn.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Trách Nhiệm Của Người Dùng
        </h2>
        <p className="text-gray-300 mb-2">
          Bạn đồng ý rằng bạn hoàn toàn chịu trách nhiệm đối với:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Nội dung được tạo bởi AI dựa trên dữ liệu bạn cung cấp.</li>
          <li>
            Việc tuân thủ pháp luật, quy định của YouTube và các nền tảng khác.
          </li>
          <li>
            Mọi thông tin, tài liệu, script, video được xuất bản dựa trên gợi ý
            từ SeenYT.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. Giới Hạn Trách Nhiệm
        </h2>
        <p className="text-gray-300 mb-4">
          SeenYT được cung cấp &quot;nguyên trạng&quot; (as-is) và
          &quot;theo khả năng&quot; (as-available). Chúng tôi không đảm bảo:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
          <li>Tính chính xác tuyệt đối của mọi nội dung do AI tạo ra.</li>
          <li>
            Khả năng video của bạn được duyệt, đề xuất hoặc đạt kết quả như kỳ
            vọng.
          </li>
          <li>Không bị thay đổi thuật toán từ phía YouTube hoặc nền tảng khác.</li>
        </ul>
        <p className="text-gray-300 mb-4">
          Chúng tôi không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp,
          mất doanh thu, mất dữ liệu hoặc tổn thất phát sinh từ việc sử dụng
          SeenYT.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          5. Quyền Sở Hữu Trí Tuệ
        </h2>
        <p className="text-gray-300 mb-4">
          Thương hiệu, giao diện, mã nguồn và mọi tài sản trí tuệ liên quan đến
          SeenYT thuộc sở hữu của CÔNG TY CỔ PHẦN DỊCH VỤ QUỐC TẾ NTC. Người
          dùng không được sao chép, bán lại, cho thuê hoặc khai thác dịch vụ vì
          mục đích thương mại khi chưa được sự đồng ý bằng văn bản.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          6. Thanh Toán & Hoàn Tiền
        </h2>
        <p className="text-gray-300 mb-4">
          Các gói dịch vụ đã kích hoạt không được hoàn tiền, trừ trường hợp hệ
          thống không thể cung cấp dịch vụ cơ bản như mô tả. Hành vi nhập sai
          mã giao dịch thanh toán với mục đích gian lận có thể dẫn tới khoá tài
          khoản ngay lập tức.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          7. Chấm Dứt & Khoá Tài Khoản
        </h2>
        <p className="text-gray-300 mb-4">
          Chúng tôi có quyền khoá tài khoản, giới hạn tính năng hoặc chấm dứt
          cung cấp dịch vụ đối với bất kỳ tài khoản nào vi phạm điều khoản này
          hoặc có dấu hiệu lạm dụng hệ thống. Quyết định của chúng tôi là cuối
          cùng.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          8. Thay Đổi Điều Khoản
        </h2>
        <p className="text-gray-300 mb-8">
          Chúng tôi có thể cập nhật điều khoản này theo thời gian. Phiên bản
          mới sẽ được công bố trên website. Việc bạn tiếp tục sử dụng SeenYT
          đồng nghĩa với việc bạn chấp nhận điều khoản cập nhật.
        </p>

        <Link href="/" className="text-blue-400 hover:underline text-lg">
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
