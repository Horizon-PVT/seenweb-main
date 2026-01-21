// UsageBanner.tsx - Banner hiển thị lượt còn lại và upsell nhẹ nhàng
interface Props {
    remaining: number;
    total: number;
    feature: string;
    onUpgrade: () => void;
    darkMode?: boolean;
}

const UsageBanner = ({ remaining, total, onUpgrade, darkMode = false }: Props) => {
    const isLow = remaining <= 1;
    const isOut = remaining <= 0;

    if (isOut) {
        return (
            <div className={`${darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg p-3 mb-3`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">😢</span>
                        <div>
                            <p className={`text-xs font-bold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                                Hết lượt hôm nay!
                            </p>
                            <p className={`text-[10px] ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                                Nâng cấp để dùng không giới hạn
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onUpgrade}
                        className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-bold rounded-lg hover:shadow-md transition-all"
                    >
                        Nâng cấp
                    </button>
                </div>
            </div>
        );
    }

    if (isLow) {
        return (
            <div className={`${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-2 mb-3`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>⚠️</span>
                        <p className={`text-[10px] ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                            Còn <span className="font-bold">{remaining} lượt</span> hôm nay
                        </p>
                    </div>
                    <button
                        onClick={onUpgrade}
                        className={`text-[9px] font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} hover:underline`}
                    >
                        Không giới hạn →
                    </button>
                </div>
            </div>
        );
    }

    // Còn nhiều lượt → hiển thị nhẹ nhàng
    return (
        <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-lg p-2 mb-3 flex items-center justify-between`}>
            <span className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Còn {remaining}/{total} lượt hôm nay
            </span>
            <button
                onClick={onUpgrade}
                className={`text-[9px] ${darkMode ? 'text-blue-400' : 'text-blue-500'} hover:underline`}
            >
                Pro: Không giới hạn
            </button>
        </div>
    );
};

export default UsageBanner;
