import { useState } from "react";

export default function PaymentModal({
  plan,
  onClose,
}: {
  plan: string;
  onClose: () => void;
}) {
  const qrMap: Record<string, string> = {
    ARCHIVE: "/payqr/qr-archive.png",
    MAGISTRATE: "/payqr/qr-magistrate.png",
    "TOÀN TRI": "/payqr/qr-toantri.png",
  };

  const amountMap: Record<string, string> = {
    ARCHIVE: "399,000 VNĐ",
    MAGISTRATE: "649,000 VNĐ",
    "TOÀN TRI": "1,299,000 VNĐ",
  };

  const [email, setEmail] = useState("");
  const [txn, setTxn] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !txn) {
      setMessage("❌ Vui lòng nhập đầy đủ email và mã giao dịch.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          txn: txn.trim(),
          plan, // ✅ gửi đủ 3 trường email, txn, plan
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setMessage("✅ Gửi xác nhận thành công! Anh/chị sẽ được nâng cấp sau khi kiểm tra.");
        setEmail("");
        setTxn("");
      } else {
        setMessage("❌ Lỗi khi gửi, vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px] text-center">
        <h2 className="text-xl font-bold mb-2">Thanh toán gói {plan}</h2>
        <p className="text-gray-600 mb-2">Số tiền: {amountMap[plan]}</p>
        <img
          src={qrMap[plan]}
          alt="QR Code"
          className="mx-auto w-56 mb-4 rounded-xl shadow"
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
        <p className="text-sm text-gray-500 mb-4">
          Quét mã QR bằng ứng dụng ngân hàng Vietcombank để thanh toán. Sau khi chuyển, nhập email và mã giao dịch bên dưới:
        </p>

        <input
          type="email"
          placeholder="Email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-2 mb-2 text-black"
        />
        <input
          type="text"
          placeholder="Mã giao dịch (hoặc nội dung CK)"
          value={txn}
          onChange={(e) => setTxn(e.target.value)}
          className="w-full border rounded-lg p-2 mb-3 text-black"
        />
        <button
          onClick={submit}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {loading ? "Đang gửi..." : "Gửi xác nhận"}
        </button>

        {message && (
          <p
            className={`mt-3 text-sm ${
              message.startsWith("✅")
                ? "text-green-700"
                : "text-red-600 font-medium"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={onClose}
          className="text-gray-500 mt-4 underline hover:text-gray-700"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
