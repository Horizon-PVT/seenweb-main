// UsageBanner.tsx - Banner hiển thị lượt còn lại và upsell nhẹ nhàng
interface Props {
    remaining: number;
    total: number;
    onUpgrade: () => void;
    darkMode?: boolean;
    lang?: 'VI' | 'EN';
}

const UsageBanner = ({ remaining, total, onUpgrade, darkMode = false, lang = 'VI' }: Props) => {
    const t = {
        VI: {
            out: 'Hết lượt hôm nay!',
            low: 'Còn',
            upgrade: 'Nâng cấp',
            unlimited: 'Không giới hạn →'
        },
        EN: {
            out: 'Daily limit reached!',
            low: 'Remaining',
            upgrade: 'Upgrade',
            unlimited: 'Unlimited →'
        }
    };
    const text = t[lang];

    if (remaining <= 0) { // Depleted
        return (
            <div className={`text-[10px] py-1 px-2 rounded-lg flex items-center justify-between ${darkMode ? 'bg-red-900/30 text-red-200 border border-red-800' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                <span className="font-medium mr-1">{text.out}</span>
                <button onClick={onUpgrade} className="font-bold underline ml-1 hover:text-red-500">{text.upgrade}</button>
            </div>
        );
    }

    if (remaining <= 1) { // Low usage
        return (
            <div className={`text-[10px] py-1 px-2 rounded-lg flex items-center justify-between ${darkMode ? 'bg-orange-900/30 text-orange-200 border border-orange-800' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                <span className="font-medium mr-1">{text.low} {remaining}</span>
                <button onClick={onUpgrade} className="font-bold ml-1 hover:underline">{text.unlimited}</button>
            </div>
        );
    }

    // Normal usage
    return (
        <div className={`text-[10px] py-1 px-2 rounded-lg text-center ${darkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
            {text.low} <span className={darkMode ? 'text-slate-200 font-bold' : 'text-slate-700 font-bold'}>{remaining}/{total}</span>
        </div>
    );
};

export default UsageBanner;
