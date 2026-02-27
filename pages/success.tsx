import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function SuccessPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [status, setStatus] = useState<'loading' | 'activating' | 'success' | 'error'>('loading');

  const { code, desc, status: payStatus, orderCode } = router.query;

  // Prevent duplicate execution
  const firedRef = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;

    const checkPaymentStatus = async () => {
      if (!orderCode) return;
      if (firedRef.current) return;
      firedRef.current = true; // Mark as running

      try {
        console.log("Checking payment status for:", orderCode);

        // 1. Verify with API
        const res = await fetch('/api/payment/check-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderCode })
        });
        const data = await res.json();

        if (data.success && data.status === 'PAID') {
          console.log("Payment confirmed. Activating session...");
          setStatus('activating');

          // 2. Force Session Update & Retry Loop
          let attempt = 0;
          let updatedRole = (session?.user as any)?.role;

          // Try up to 3 times to get the updated role
          while (attempt < 3) {
            console.log(`Session update attempt ${attempt + 1}...`);
            const newSession = await update();
            updatedRole = (newSession?.user as any)?.role;

            console.log("Role after update:", updatedRole);

            // If we detect a role upgrade (anything other than FREE, assuming they bought something), break.
            // Adjust logic if user was already VIP extendng - verifying specific role match might be harder without passing it back, 
            // but usually 'FREE' -> 'PRO' is the case.
            if (updatedRole !== 'FREE') {
              // Determine redirect URL
              const redirectUrl = (updatedRole === 'MASTERCLASS' || (newSession?.user as any)?.hasMasterclass) ? '/academy' : '/dashboard';

              // 3. Final Success
              setStatus('success');

              // GTM Event
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const w: any = window;
              w.dataLayer = w.dataLayer || [];
              w.dataLayer.push({
                event: 'purchase_success',
                transaction_id: String(orderCode),
                order_code: String(orderCode),
                description: String(desc || ''),
                value: data.amount || 0, // It would be good if API returned amount
                currency: 'VND'
              });

              // Redirect after short delay
              setTimeout(() => {
                window.location.href = redirectUrl;
              }, 3000);

              break;
            }

            // Wait 1s before next try
            await new Promise(r => setTimeout(r, 1000));
            attempt++;
          }

          // If loop finishes without success state
          if (status !== 'success') {
            setStatus('success');
            // Fallback redirect
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 3000);
          }

        } else {
          // PayOS says not paid yet/failed
          console.warn("Payment not PAID:", data);
          setStatus('error');
        }
      } catch (err) {
        console.error("Payment check error:", err);
        setStatus('error');
      }
    };

    // Only run if basic signals are present
    if (code === '00' || payStatus === 'PAID' || orderCode) {
      checkPaymentStatus();
    } else {
      if (code && code !== '00') setStatus('error');
    }
  }, [router.isReady, code, payStatus, orderCode, desc, update, session]); // Dependencies

  if (status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Đang kiểm tra giao dịch...</p>
      </div>
    );
  }

  if (status === 'activating') {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-pulse rounded-full h-12 w-12 bg-green-200 mb-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </div>
        <p className="text-green-600 font-bold text-xl">Thanh toán thành công!</p>
        <p className="text-gray-500 mt-2">Đang kích hoạt gói cho bạn...</p>
      </div>
    );
  }

  const userHasMasterclass = (session?.user as any)?.hasMasterclass || (session?.user as any)?.role === 'MASTERCLASS';

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-fade-in-up">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">🎉 Nâng cấp hoàn tất!</h1>
            <p className="text-gray-600 mb-2">Mã đơn: <span className="font-mono font-bold">{String(orderCode || '')}</span></p>
            <p className="text-gray-500 mb-6">Tài khoản của bạn đã được nâng cấp.</p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = userHasMasterclass ? '/academy' : '/dashboard'}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition transform hover:scale-[1.02]"
              >
                🚀 Vào Dashboard ngay
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">Tự động chuyển sau 3 giây...</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Giao dịch chưa hoàn tất</h1>
            <p className="text-gray-500 mb-6">Có thể thanh toán đang được xử lý hoặc đã bị hủy.</p>

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
