import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Liên Hệ</h1>

        <p className="text-gray-300 mb-4">
          Nếu bạn cần hỗ trợ trong quá trình sử dụng SeenYT, vui lòng liên hệ
          qua các kênh sau:
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">📧 Email</h2>
        <p className="text-gray-300 mb-4">takeuchi999999999@gmail.com</p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">📱 Zalo</h2>
        <p className="text-gray-300 mb-4">0789 284 078</p>

        <p className="text-gray-300 mb-8">
          Chúng tôi sẽ cố gắng phản hồi trong thời gian sớm nhất có thể.
        </p>

        <Link href="/" className="text-blue-400 hover:underline text-lg">
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
