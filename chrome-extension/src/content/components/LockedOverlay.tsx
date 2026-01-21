// LockedOverlay.tsx - Overlay cho tính năng bị khóa
interface Props {
    feature: string;
    onUpgrade: () => void;
    darkMode?: boolean;
}

const FEATURE_INFO: Record<string, { icon: string; title: string; teaser: string }> = {
    'ai': {
        icon: '✨',
        title: 'Gợi ý AI',
        teaser: 'Tạo tiêu đề viral, mô tả SEO, tags trending tự động'
    },
    'spy': {
        icon: '🕵️',
        title: 'Soi Kênh Đối Thủ',
        teaser: 'Phân tích subscribers, views, upload frequency của kênh bất kỳ'
    },
    'trends': {
        icon: '📈',
        title: 'Xu Hướng Hot',
        teaser: 'Xem keywords đang trending và videos viral trong niche'
    },
    'history': {
        icon: '📚',
        title: 'Lịch Sử Gợi Ý',
        teaser: 'Lưu lại các tiêu đề, mô tả đã tạo để dùng sau'
    },
};

const LockedOverlay = ({ feature, onUpgrade, darkMode = false }: Props) => {
    const info = FEATURE_INFO[feature] || { icon: '🔒', title: 'Tính năng Pro', teaser: 'Mở khóa tính năng này' };

    return (
        <div className="relative w-full min-h-[250px]">
            {/* Blurred fake content behind */}
            <div className="absolute inset-0 opacity-30 blur-sm pointer-events-none">
                <div className={`p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl`}>
                    <div className={`h-4 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} rounded w-3/4 mb-3`}></div>
                    <div className={`h-3 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} rounded w-1/2 mb-2`}></div>
                    <div className={`h-3 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} rounded w-2/3 mb-4`}></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className={`h-16 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} rounded-lg`}></div>
                        <div className={`h-16 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} rounded-lg`}></div>
                    </div>
                </div>
            </div>

            {/* Lock overlay */}
            <div className={`absolute inset-0 ${darkMode ? 'bg-slate-900/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center`}>
                {/* Lock icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-3xl">{info.icon}</span>
                </div>

                {/* Title */}
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-2`}>
                    {info.title}
                </h3>

                {/* Teaser */}
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4 max-w-[250px]`}>
                    {info.teaser}
                </p>

                {/* Pro badge */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                        ✨ PRO
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Tính năng trả phí
                    </span>
                </div>

                {/* Upgrade button */}
                <button
                    onClick={onUpgrade}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <span>🚀</span>
                    <span>Mở khóa chỉ 149K</span>
                </button>

                {/* Sub text */}
                <p className={`text-[10px] ${darkMode ? 'text-slate-600' : 'text-slate-400'} mt-3`}>
                    Thanh toán 1 lần • Dùng cả tháng
                </p>
            </div>
        </div>
    );
};

export default LockedOverlay;
