// pages/dashboard/settings.tsx
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { User, Phone, Mail, Camera, Loader2, Save, ShieldAlert, Upload, Check, Clock, CreditCard, Calendar } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<{
        plan: string;
        expiresAt: string | null;
        daysRemaining: number | null;
    } | null>(null);
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
            // Set avatar from session if exists
            if (session.user.image) {
                setAvatarPreview(session.user.image);
            }
        }
    }, [session]);

    // Fetch subscription info
    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await fetch('/api/user/subscription');
                const data = await res.json();
                if (data.success) {
                    setSubscription(data.subscription);
                }
            } catch (err) {
                console.error('Failed to fetch subscription:', err);
            }
        };
        fetchSubscription();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh!');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Kích thước ảnh tối đa 2MB!');
            return;
        }

        // Preview image
        const reader = new FileReader();
        reader.onload = (event) => {
            setAvatarPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setIsUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('avatar', file);

            const response = await fetch('/api/user/upload-avatar', {
                method: 'POST',
                body: formDataUpload,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi upload ảnh');
            }

            const data = await response.json();
            
            // Update session with new image
            await update({ image: data.imageUrl });
            
            toast.success('Đã cập nhật ảnh đại diện!');
        } catch (error: any) {
            console.error('Upload avatar error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi upload ảnh');
            // Revert preview if upload failed
            setAvatarPreview(session?.user?.image || null);
        } finally {
            setIsUploading(false);
        }
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

    // Get tier color
    const getTierColor = (tier: string) => {
        const colors: Record<string, string> = {
            'FREE': 'text-gray-400 bg-gray-400/10 border-gray-400/20',
            'STARTER': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
            'CREATOR': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
            'FACTORY': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
            'AGENCY': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
            'ENTERPRISE': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
        };
        return colors[tier] || colors.FREE;
    };

    // @ts-ignore
    const userRole = session?.user?.role || 'FREE';

    return (
        <DashboardLayout userRole={userRole}>
            <Head>
                <title>Cài đặt tài khoản | SeenYT Studio</title>
            </Head>
            <Toaster position="top-center" />

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Subscription Info Card */}
                {subscription && subscription.plan !== 'FREE' && (
                    <div className={`p-6 rounded-2xl border ${getTierColor(subscription.plan)} bg-current/5`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTierColor(subscription.plan)}`}>
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider opacity-70 mb-1"> Gói Subscription</p>
                                    <h3 className="text-xl font-bold">{subscription.plan} Plan</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                {subscription.expiresAt && (
                                    <div className="text-right">
                                        <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Ngày hết hạn</p>
                                        <p className="font-semibold flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(subscription.expiresAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                                {subscription.daysRemaining !== null && (
                                    <div className="text-right">
                                        <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Còn lại</p>
                                        <p className="font-bold text-2xl flex items-center gap-1">
                                            <Clock size={18} />
                                            {subscription.daysRemaining}
                                        </p>
                                        <p className="text-xs opacity-70">ngày</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-current/20">
                            <button
                                onClick={() => router.push('/pricing')}
                                className="text-sm hover:underline opacity-80 hover:opacity-100"
                            >
                                Gia hạn hoặc nâng cấp gói khác →
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div>
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
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        getInitials(formData.name)
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    disabled={isUploading}
                                    title="Tải lên ảnh đại diện"
                                    className="absolute bottom-0 right-0 p-2 bg-gray-800 border border-gray-600 rounded-full text-white hover:bg-gray-700 transition-colors shadow-lg"
                                >
                                    {isUploading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Camera size={14} />
                                    )}
                                </button>
                                {avatarPreview && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold text-white mb-1">{formData.name || 'Người dùng mới'}</h3>
                                <p className={`text-xs font-mono uppercase tracking-widest inline-block px-3 py-1 rounded-full border ${getTierColor(userRole)}`}>
                                    {userRole} PLAN
                                </p>
                                <p className="text-xs text-gray-500 mt-3 font-light">
                                    Ảnh đại diện kích thước 256x256px. Tối đa 2MB.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                >
                                    <Upload size={12} />
                                    Tải ảnh lên
                                </button>
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
