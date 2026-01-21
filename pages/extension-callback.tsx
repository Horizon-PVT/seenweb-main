// pages/extension-callback.tsx - Callback page after login to sync with extension
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';

export default function ExtensionCallback() {
    const { data: session, status } = useSession();
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (session?.user?.email && !sent) {
            const email = session.user.email;
            const role = (session.user as any).role || 'FREE';

            // Save to localStorage - this persists across tabs
            try {
                localStorage.setItem('seenyt_email', email);
                localStorage.setItem('seenyt_role', role);
                localStorage.setItem('seenyt_name', session.user.name || '');
                localStorage.setItem('seenyt_auth_timestamp', Date.now().toString());
            } catch { }

            // Broadcast to all tabs via BroadcastChannel
            try {
                const channel = new BroadcastChannel('seenyt_auth');
                channel.postMessage({ type: 'AUTH_UPDATE', email, role });
                channel.close();
            } catch { }

            setSent(true);

            // Auto close after 3 seconds
            setTimeout(() => {
                window.close();
            }, 3000);
        }
    }, [session, status, sent]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Head>
                    <title>Đang xử lý... - SeenYT</title>
                </Head>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Đang xác thực...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Head>
                    <title>Lỗi - SeenYT</title>
                </Head>
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="text-5xl mb-4">😢</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Chưa đăng nhập</h1>
                    <p className="text-slate-400 mb-6">
                        Vui lòng đăng nhập trước khi quay lại trang này.
                    </p>
                    <a
                        href="/login"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl"
                    >
                        Đăng nhập
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Head>
                <title>Đã kết nối Extension - SeenYT</title>
            </Head>
            <div className="text-center max-w-md mx-auto p-8">
                <div className="text-5xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold text-white mb-2">Đã kết nối!</h1>
                <p className="text-slate-400 mb-4">
                    Extension đã nhận thông tin tài khoản của bạn.
                </p>
                <div className="bg-slate-800 rounded-xl p-4 mb-6">
                    <p className="text-white font-medium">{session.user?.name}</p>
                    <p className="text-slate-400 text-sm">{session.user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded-full">
                        {(session.user as any).role || 'FREE'}
                    </span>
                </div>
                <p className="text-slate-500 text-sm">
                    Tab này sẽ tự đóng trong vài giây...
                </p>
                <button
                    onClick={() => window.close()}
                    className="mt-4 text-blue-400 hover:underline text-sm"
                >
                    Đóng ngay
                </button>
            </div>
        </div>
    );
}
