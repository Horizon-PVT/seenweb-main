// components/dashboard/ConnectChannelModal.tsx
// Modal for connecting YouTube channel via OAuth

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Loader2, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ConnectChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ConnectChannelModal({ isOpen, onClose, onSuccess }: ConnectChannelModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // 1. Get OAuth URL from backend
            const res = await fetch('/api/youtube/auth-url');
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Không thể kết nối');
            }
            
            // 2. Redirect to Google OAuth
            window.location.href = data.url;
            
            // 3. Close modal (will redirect to callback)
            onClose();
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi');
            setIsLoading(false);
        }
    };

    const handleDisconnect = async (channelId: string) => {
        if (!confirm('Bạn có chắc muốn ngắt kết nối kênh này?')) return;
        
        try {
            const res = await fetch(`/api/youtube/channel/${channelId}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                toast.success('Đã ngắt kết nối kênh');
                onSuccess();
            }
        } catch {
            toast.error('Lỗi khi ngắt kết nối');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-[#0f0f0f] border border-gray-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <X size={20} className="text-gray-400" />
                </button>

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FF0000">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Kết Nối Kênh YouTube</h2>
                            <p className="text-gray-400 text-sm">Đăng nhập Google để liên kết kênh của bạn</p>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <AlertCircle size={20} className="text-red-400" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-white/5 rounded-xl p-4 mb-6 border border-gray-800">
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <Check size={16} className="text-green-400" />
                            Quyền lợi khi kết nối:
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</span>
                                Xem analytics chi tiết của kênh
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</span>
                                Quản lý và theo dõi video
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</span>
                                AI gợi ý nội dung video mới
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</span>
                                Lên lịch đăng video tự động
                            </li>
                        </ul>
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6">
                        <p className="text-amber-400 text-xs">
                            <strong>Lưu ý:</strong> SeenYT chỉ yêu cầu quyền đọc (read-only). Chúng tôi không bao giờ thay đổi nội dung kênh của bạn.
                        </p>
                    </div>

                    {/* Connect Button */}
                    <button
                        onClick={handleConnect}
                        disabled={isLoading}
                        className="w-full py-4 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Đang kết nối...
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Đăng nhập với Google
                            </>
                        )}
                    </button>

                    {/* Footer */}
                    <p className="text-center text-gray-500 text-xs mt-4">
                        Bằng cách tiếp tục, bạn đồng ý với Điều khoản sử dụng của SeenYT
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
