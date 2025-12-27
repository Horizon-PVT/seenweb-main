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

      setTimeout(() => router.push('/dashboard'), 3000); // Auto về dashboard 3s
    } else {
      setStatus('error');
    }
  }, [router.isReady, code, payStatus, orderCode, desc, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Đang xử lý...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-green-100">
      <div className="text-center p-8 bg-white rounded-lg shadow">
        {status === 'success' ? (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">Nâng cấp thành công!</h1>
            <p>Đơn {String(orderCode || '')}: {String(desc || '')}</p>
            <p className="text-sm text-gray-500 mt-4">Chuyển về dashboard...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Thanh toán thất bại</h1>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Thử lại
            </button>
          </>
        )}
      </div>
    </div>
  );
}
