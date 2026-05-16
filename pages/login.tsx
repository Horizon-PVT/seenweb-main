// pages/login.tsx
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const callbackUrl = (router.query.callbackUrl as string) || "/";

    useEffect(() => {
        if (status === "authenticated") {
            router.push(callbackUrl);
        }
    }, [status, callbackUrl, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        );
    }

    if (status === "authenticated") {
        return null;
    }

    return (
        <>
            <Head>
                <title>Đăng nhập — SeenYT</title>
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Đăng nhập</h1>
                        <p className="text-gray-300">
                            Vui lòng đăng nhập để tiếp tục
                        </p>
                    </div>

                    <button
                        onClick={() => signIn("google", { callbackUrl })}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Đăng nhập với Google
                    </button>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            ← Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
