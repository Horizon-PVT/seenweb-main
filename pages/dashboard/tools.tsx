// pages/dashboard/tools.tsx - ADMIN ONLY backdoor for ToolsGrid
// Giữ lại ToolsGrid cũ cho dev/admin debug

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession } from "next-auth/react";
import ToolsGrid from "@/components/ToolsGrid";

export default function AdminToolsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const userRole = (session?.user as any)?.role || 'FREE';
    const isAdmin = userRole === 'ADMIN';

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (status === "authenticated") {
            if (!isAdmin) {
                // Non-admin users get redirected to main dashboard
                router.push("/dashboard");
            } else {
                setLoading(false);
            }
        }
    }, [status, router, isAdmin]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-[#CDAD5A] text-2xl">Đang xác thực quyền admin...</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Admin Tools - SeenYT</title>
                <meta name="robots" content="noindex" />
            </Head>

            <div className="min-h-screen bg-black text-white">
                {/* Admin header */}
                <div className="bg-red-900/30 border-b border-red-500/50 p-4">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div>
                            <p className="text-red-400 text-sm font-bold">⚠️ ADMIN ONLY</p>
                            <p className="text-white">Legacy Tools Grid (Dev Backdoor)</p>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Legacy ToolsGrid */}
                <div className="py-10">
                    <ToolsGrid />
                </div>
            </div>
        </>
    );
}
