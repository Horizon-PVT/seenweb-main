// UpgradeModal.tsx - Popup nâng cấp tài khoản
import { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    feature?: string;
    darkMode?: boolean;
}

const FEATURES_INFO: Record<string, { icon: string; title: string; description: string }> = {
    'ai': {
        icon: '✨',
        title: 'Gợi ý AI',
        description: 'Tạo tiêu đề, mô tả, tags viral bằng AI Gemini 2.5'
    },
    'spy': {
        icon: '🕵️',
        title: 'Soi kênh đối thủ',
        description: 'Phân tích chi tiết kênh YouTube bất kỳ'
    },
    'trends': {
        icon: '📈',
        title: 'Xu hướng đầy đủ',
        description: 'Xem toàn bộ keywords hot và videos trending'
    },
    'history': {
        icon: '📚',
        title: 'Lịch sử gợi ý',
        description: 'Lưu lại và dùng lại các gợi ý đã tạo'
    },
    'default': {
        icon: '🚀',
        title: 'Tính năng Pro',
        description: 'Mở khóa tất cả công cụ mạnh mẽ'
    }
};



const UpgradeModal = ({ isOpen, onClose, feature = 'default', darkMode = false }: Props) => {
    const [loading, setLoading] = useState(false);
    const info = FEATURES_INFO[feature] || FEATURES_INFO['default'];

    const handleUpgrade = (plan: string) => {
        setLoading(true);
        // Mở trang pricing trên seenyt.net
        window.open(`https://seenyt.net/pricing?source=extension&plan=${plan}`, '_blank');
        setTimeout(() => {
            setLoading(false);
            onClose();
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{info.icon}</span>
                        <div>
                            <h3 className="text-white font-bold text-lg">Mở khóa {info.title}</h3>
                            <p className="text-purple-200 text-xs">{info.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Benefits */}
                    <div className={`${darkMode ? 'bg-slate-800' : 'bg-purple-50'} p-3 rounded-xl`}>
                        <p className={`text-xs font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-2`}>
                            Bạn sẽ nhận được:
                        </p>
                        <ul className={`text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-600'} space-y-1`}>
                            <li>✅ {info.title} không giới hạn</li>
                            <li>✅ Gợi ý AI Tiêu đề, Mô tả, Tags</li>
                            <li>✅ Soi kênh đối thủ chi tiết</li>
                            <li>✅ Xem xu hướng trending</li>
                            <li>✅ 20+ công cụ Pro trên SeenYT</li>
                        </ul>
                    </div>

                    {/* Quick Upgrade Button */}
                    <button
                        onClick={() => handleUpgrade('STARTER')}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="animate-pulse">Đang mở...</span>
                        ) : (
                            <>
                                <span>🚀</span>
                                <span>Nâng cấp chỉ 149K/tháng</span>
                            </>
                        )}
                    </button>

                    {/* Other plans */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleUpgrade('PRO')}
                            className={`flex-1 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} rounded-lg text-[10px] font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} transition-colors`}
                        >
                            PRO 399K
                        </button>
                    </div>

                    {/* Login link */}
                    <p className={`text-center text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Đã có tài khoản Pro?{' '}
                        <button
                            onClick={() => window.open('https://seenyt.net/login?source=extension', '_blank')}
                            className="text-blue-500 hover:underline font-medium"
                        >
                            Đăng nhập
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
