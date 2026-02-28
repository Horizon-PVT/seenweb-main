// pages/dashboard/settings.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { User, Phone, Mail, Camera, Loader2, Save, ShieldAlert } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
    });

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || '',
                // @ts-ignore - Custom property potentially
                phoneNumber: (session.user as any).phoneNumber || '',
            });
        }
    }, [session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi cập nhật hồ sơ');
            }

            // Force session update to reflect changes immediately
            await update({ name: formData.name });

            toast.success('Đã cập nhật thông tin thành công!');
        } catch (error: any) {
            console.error('Update profile error:', error);
            toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    // Determine initials for Avatar placeholder
    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    // @ts-ignore
    const userRole = session?.user?.role || 'FREE';

    return (
        <DashboardLayout userRole={userRole}>
            <Head>
                <title>Cài đặt tài khoản | SeenYT Studio</title>
            </Head>
            <Toaster position="top-center" />

            <div className="max-w-3xl mx-auto py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Cài Đặt Tài Khoản</h1>
                    <p className="text-gray-400">Quản lý thông tin cá nhân và định danh của bạn trên hệ thống.</p>
                </div>

                <div className="bg-[#14161B]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="relative z-10">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-10 border-b border-gray-800/60">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden border-4 border-[#14161B]">
                                    {/* Placeholder for uploaded image */}
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        getInitials(formData.name)
                                    )}
                                </div>
                                <button
                                    type="button"
                                    title="Tính năng upload ảnh đang phát triển"
                                    className="absolute bottom-0 right-0 p-2 bg-gray-800 border border-gray-600 rounded-full text-white hover:bg-gray-700 transition-colors shadow-lg cursor-not-allowed opacity-80"
                                >
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold text-white mb-1">{formData.name || 'Người dùng mới'}</h3>
                                <p className="text-sm font-mono text-purple-400 uppercase tracking-widest bg-purple-500/10 inline-block px-3 py-1 rounded-full border border-purple-500/20">{userRole} PLAN</p>
                                <p className="text-xs text-gray-500 mt-3 font-light">Ảnh đại diện kích thước 256x256px. Tối đa 2MB. (Chức năng tải lên sắp ra mắt)</p>
                            </div>
                        </div>

                        {/* Form Fields Section */}
                        <div className="space-y-6">
                            {/* Name Field */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                    <User size={16} className="text-purple-400" />
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Nhập họ và tên của bạn"
                                    className="w-full bg-[#0a0a0c] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            {/* Email Field (Readonly) */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                    <Mail size={16} className="text-blue-400" />
                                    Email đăng nhập
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={session?.user?.email || ''}
                                        disabled
                                        className="w-full bg-[#0a0a0c] border border-gray-800 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed opacity-70"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wide bg-gray-900 border border-gray-800 px-2 py-1 rounded">
                                        <ShieldAlert size={10} /> Read-only
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Email được liên kết với tài khoản xác thực của bạn và không thể tự thay đổi.</p>
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                    <Phone size={16} className="text-green-400" />
                                    Số điện thoại (Zalo)
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số điện thoại của bạn"
                                    className="w-full bg-[#0a0a0c] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-10 pt-8 border-t border-gray-800/60 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white font-medium transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
