import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function SuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState('loading');

  const { code, desc, status: payStatus, orderCode } = router.query;

  useEffect(() => {
    if (code === '00' && payStatus === 'PAID') {
      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 3000);  // Auto về dashboard 3s
    } else {
      setStatus('error');
    }
  }, [code, payStatus, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Đang xử lý...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-green-100">
      <div className="text-center p-8 bg-white rounded-lg shadow">
        {status === 'success' ? (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">Nâng cấp thành công!</h1>
            <p>Đơn {orderCode}: {desc}</p>
            <p className="text-sm text-gray-500 mt-4">Chuyển về dashboard...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Thanh toán thất bại</h1>
            <button onClick={() => router.push('/pricing')} className="bg-blue-500 text-white px-4 py-2 rounded">Thử lại</button>
          </>
        )}
      </div>
    </div>
  );
}