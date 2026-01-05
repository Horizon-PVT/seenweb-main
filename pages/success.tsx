import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function SuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const { code, desc, status: payStatus, orderCode } = router.query;

  // Chặn bắn event lặp (do router/query thay đổi nhiều lần)
  const firedRef = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;

    const isPaid = code === '00' && payStatus === 'PAID';

    if (isPaid) {
      setStatus('success');

      // BẮN EVENT VÀO DATALAYER ĐỂ GTM BẮT CHẮC
      if (!firedRef.current) {
        firedRef.current = true;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w: any = window;
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({
          event: 'purchase_success',          // custom event cho GTM
          event_name: 'purchase',             // để mapping GA4 cho chuẩn
          transaction_id: String(orderCode || ''),
          order_code: String(orderCode || ''),
          description: String(desc || ''),
          // Nếu em có giá trị gói thì mở comment:
          // value: 649000,
          // currency: 'VND',
        });
      }

      setTimeout(() => router.push('/dashboard'), 5000); // Auto về dashboard 5s
    } else {
      setStatus('error');
    }
  }, [router.isReady, code, payStatus, orderCode, desc, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Đang xử lý...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">🎉 Nâng cấp thành công!</h1>
            <p className="text-gray-600 mb-2">Mã đơn: <span className="font-mono font-bold">{String(orderCode || '')}</span></p>
            <p className="text-gray-500 mb-6">{String(desc || 'Gói của bạn đã được kích hoạt tự động')}</p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition"
              >
                🚀 Vào Dashboard ngay
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition"
              >
                ← Về trang chủ
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">Tự động chuyển về dashboard sau 5 giây...</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Thanh toán không thành công</h1>
            <p className="text-gray-500 mb-6">Vui lòng thử lại hoặc liên hệ hỗ trợ</p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition"
              >
                Thử lại
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition"
              >
                ← Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
