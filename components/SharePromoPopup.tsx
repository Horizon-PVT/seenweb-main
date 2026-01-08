// components/SharePromoPopup.tsx - Popup hướng dẫn share để nhận bonus
import React, { useState } from 'react';
import { X, Copy, CheckCircle, ExternalLink, MessageCircle, Facebook } from 'lucide-react';

interface SharePromoPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade?: () => void;
}

const SHARE_CONTENT = `🔥 Mình vừa khám phá công cụ AI làm video YouTube CỰC HAY!

✅ Viết script tự động bằng AI
✅ Phân tích đối thủ, tìm niche hot
✅ Tạo thumbnail thu hút click
✅ Lồng tiếng AI tiếng Việt

Dùng thử MIỄN PHÍ tại: https://seenyt.net

#SeenYT #AIVideo #YouTubeVietnam #ContentCreator`;

const FANPAGE_URL = 'https://www.facebook.com/profile.php?id=61585796132941';
const WEBSITE_URL = 'https://www.seenyt.net/';
const ZALO_URL = 'https://zalo.me/0789284078';

export default function SharePromoPopup({ isOpen, onClose, onUpgrade }: SharePromoPopupProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopyContent = async () => {
        try {
            await navigator.clipboard.writeText(SHARE_CONTENT);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (e) {
            alert('Không thể copy, vui lòng copy thủ công');
        }
    };

    const openInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        🎁 Nhận thêm 15 ngày MIỄN PHÍ!
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl p-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Intro */}
                    <div className="bg-gradient-to-r from-[#CDAD5A]/20 to-orange-500/20 border border-[#CDAD5A]/30 rounded-xl p-4">
                        <p className="text-white text-center">
                            Đăng ký <strong className="text-[#CDAD5A]">STARTER 149K</strong> + Nhận thêm <strong className="text-green-400">15 ngày</strong> miễn phí!
                        </p>
                        <p className="text-gray-400 text-sm text-center mt-1">
                            Tổng cộng 45 ngày chỉ với 149K 🔥
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">📌 Thực hiện 3 bước đơn giản:</h4>

                        {/* Step 1 */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#CDAD5A] flex items-center justify-center text-black font-bold">1</div>
                                <span className="text-white font-medium">Like + Follow Fanpage SeenYT</span>
                            </div>
                            <button
                                onClick={() => openInNewTab(FANPAGE_URL)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                            >
                                <Facebook size={18} />
                                Mở Fanpage SeenYT
                                <ExternalLink size={14} />
                            </button>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#CDAD5A] flex items-center justify-center text-black font-bold">2</div>
                                <span className="text-white font-medium">Share vào 5 group Facebook</span>
                            </div>

                            <p className="text-gray-400 text-sm mb-3">
                                Share 1 trong 2 link sau vào <strong className="text-white">5 group</strong> liên quan đến YouTube/Content Creator:
                            </p>

                            <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">📌 Fanpage:</span>
                                    <code className="bg-gray-700 px-2 py-1 rounded text-[#CDAD5A] text-xs flex-1 truncate">{FANPAGE_URL}</code>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">📌 Website:</span>
                                    <code className="bg-gray-700 px-2 py-1 rounded text-[#CDAD5A] text-xs flex-1 truncate">{WEBSITE_URL}</code>
                                </div>
                            </div>

                            <button
                                onClick={handleCopyContent}
                                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition ${copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Đã copy nội dung share!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        Copy nội dung share mẫu
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#CDAD5A] flex items-center justify-center text-black font-bold">3</div>
                                <span className="text-white font-medium">Chụp ảnh gửi Admin</span>
                            </div>

                            <p className="text-gray-400 text-sm mb-3">
                                Chụp ảnh màn hình đã share + gửi kèm <strong className="text-white">email đăng ký</strong> qua:
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => openInNewTab(ZALO_URL)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
                                >
                                    <MessageCircle size={18} />
                                    Zalo Admin
                                </button>
                                <button
                                    onClick={() => openInNewTab(FANPAGE_URL)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
                                >
                                    <Facebook size={18} />
                                    Messenger
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Result */}
                    <div className="bg-green-900/30 border border-green-600/30 rounded-xl p-4 text-center">
                        <p className="text-green-400 font-medium">
                            ✅ Sau khi Admin xác minh, bạn sẽ nhận mã <strong>+15 NGÀY</strong> ngay lập tức!
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-800 text-gray-400">hoặc</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => {
                            onClose();
                            if (onUpgrade) onUpgrade();
                            else window.location.href = '/pricing';
                        }}
                        className="w-full bg-gradient-to-r from-[#CDAD5A] to-orange-500 hover:opacity-90 text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        ⚡ Nâng cấp STARTER ngay - Chỉ 149K/tháng
                    </button>
                </div>
            </div>
        </div>
    );
}
