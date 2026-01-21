// TitleTester.tsx - A/B Title Comparison Tool
import { useState } from 'react';

interface TitleScore {
    total: number;
    breakdown: {
        length: number;
        hook: number;
        emotion: number;
        numbers: number;
        keywords: number;
    };
    tips: string[];
}

const TitleTester = () => {
    const [titleA, setTitleA] = useState('');
    const [titleB, setTitleB] = useState('');
    const [scoreA, setScoreA] = useState<TitleScore | null>(null);
    const [scoreB, setScoreB] = useState<TitleScore | null>(null);
    const [winner, setWinner] = useState<'A' | 'B' | 'tie' | null>(null);

    const analyzeTitle = (title: string): TitleScore => {
        const tips: string[] = [];
        let lengthScore = 0;
        let hookScore = 0;
        let emotionScore = 0;
        let numbersScore = 0;
        let keywordsScore = 0;

        // Length (Optimal: 40-60 chars)
        if (title.length >= 40 && title.length <= 60) {
            lengthScore = 100;
        } else if (title.length >= 30 && title.length <= 70) {
            lengthScore = 80;
        } else if (title.length < 30) {
            lengthScore = 60;
            tips.push('Title hơi ngắn');
        } else {
            lengthScore = 50;
            tips.push('Title quá dài, có thể bị cắt');
        }

        // Hook words
        const hookPatterns = [
            /\?/,
            /^(how|why|what|when|cách|tại sao|thế nào|bao giờ)/i,
            /(secret|bí mật|hidden|ẩn)/i,
            /(must|cần|phải)/i,
            /(never|không bao giờ|đừng)/i,
        ];
        const hookCount = hookPatterns.filter(p => p.test(title)).length;
        hookScore = Math.min(100, hookCount * 30 + 40);
        if (hookCount === 0) tips.push('Thiếu hook gợi tò mò');

        // Emotion triggers
        const emotionPatterns = [
            /(amazing|tuyệt vời|incredible|kinh ngạc)/i,
            /(shocking|sốc|unbelievable)/i,
            /(best|tốt nhất|top|hay nhất)/i,
            /(worst|tệ nhất|sai lầm|mistake)/i,
            /(easy|dễ|simple|đơn giản)/i,
            /(free|miễn phí)/i,
        ];
        const emotionCount = emotionPatterns.filter(p => p.test(title)).length;
        emotionScore = Math.min(100, emotionCount * 25 + 50);
        if (emotionCount === 0) tips.push('Thêm từ gợi cảm xúc');

        // Numbers
        const hasNumbers = /\d+/.test(title);
        const hasYear = /(202[4-9]|2030)/.test(title);
        numbersScore = hasNumbers ? (hasYear ? 100 : 85) : 50;
        if (!hasNumbers) tips.push('Thêm số liệu cụ thể');

        // Keyword optimization (first 5 words count)
        const words = title.split(' ');
        const firstFiveWords = words.slice(0, 5).join(' ').length;
        keywordsScore = firstFiveWords >= 25 ? 90 : 70;

        const total = Math.round(
            lengthScore * 0.15 +
            hookScore * 0.30 +
            emotionScore * 0.25 +
            numbersScore * 0.15 +
            keywordsScore * 0.15
        );

        return {
            total,
            breakdown: {
                length: lengthScore,
                hook: hookScore,
                emotion: emotionScore,
                numbers: numbersScore,
                keywords: keywordsScore,
            },
            tips: tips.slice(0, 2),
        };
    };

    const compare = () => {
        if (!titleA.trim() || !titleB.trim()) return;

        const a = analyzeTitle(titleA);
        const b = analyzeTitle(titleB);

        setScoreA(a);
        setScoreB(b);

        if (a.total > b.total + 5) setWinner('A');
        else if (b.total > a.total + 5) setWinner('B');
        else setWinner('tie');
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getBarColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-3">
            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                <p className="text-[9px] text-blue-700 flex items-center gap-1">
                    <span>🔀</span> So sánh 2 title để xem cái nào có CTR tiềm năng cao hơn
                </p>
            </div>

            {/* Input A */}
            <div>
                <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                    <span className="w-4 h-4 bg-red-500 text-white rounded text-[8px] flex items-center justify-center font-black">A</span>
                    Title A
                </label>
                <input
                    type="text"
                    value={titleA}
                    onChange={(e) => setTitleA(e.target.value)}
                    placeholder="Nhập title thứ nhất..."
                    className="w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-red-400"
                />
            </div>

            {/* Input B */}
            <div>
                <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                    <span className="w-4 h-4 bg-blue-500 text-white rounded text-[8px] flex items-center justify-center font-black">B</span>
                    Title B
                </label>
                <input
                    type="text"
                    value={titleB}
                    onChange={(e) => setTitleB(e.target.value)}
                    placeholder="Nhập title thứ hai..."
                    className="w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                />
            </div>

            {/* Compare Button */}
            <button
                onClick={compare}
                disabled={!titleA.trim() || !titleB.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-xs rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                <span>⚔️</span> So sánh Title
            </button>

            {/* Results */}
            {winner && scoreA && scoreB && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                    {/* Winner Banner */}
                    <div className={`p-3 rounded-xl text-center ${winner === 'A' ? 'bg-red-100 border border-red-300' :
                            winner === 'B' ? 'bg-blue-100 border border-blue-300' :
                                'bg-slate-100 border border-slate-300'
                        }`}>
                        {winner === 'tie' ? (
                            <p className="text-sm font-bold text-slate-700">🤝 Ngang điểm!</p>
                        ) : (
                            <p className="text-sm font-bold">
                                🏆 <span className={winner === 'A' ? 'text-red-600' : 'text-blue-600'}>Title {winner}</span> thắng!
                            </p>
                        )}
                    </div>

                    {/* Score Comparison */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Score A */}
                        <div className={`p-3 rounded-xl border-2 ${winner === 'A' ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="w-5 h-5 bg-red-500 text-white rounded text-[10px] flex items-center justify-center font-black">A</span>
                                <span className={`text-xl font-black ${getScoreColor(scoreA.total)}`}>{scoreA.total}</span>
                            </div>
                            {/* Breakdown */}
                            <div className="space-y-1.5">
                                {Object.entries(scoreA.breakdown).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                                            <span className="capitalize">{key}</span>
                                            <span>{value}%</span>
                                        </div>
                                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                                            <div className={`h-full ${getBarColor(value)} transition-all`} style={{ width: `${value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Score B */}
                        <div className={`p-3 rounded-xl border-2 ${winner === 'B' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="w-5 h-5 bg-blue-500 text-white rounded text-[10px] flex items-center justify-center font-black">B</span>
                                <span className={`text-xl font-black ${getScoreColor(scoreB.total)}`}>{scoreB.total}</span>
                            </div>
                            {/* Breakdown */}
                            <div className="space-y-1.5">
                                {Object.entries(scoreB.breakdown).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                                            <span className="capitalize">{key}</span>
                                            <span>{value}%</span>
                                        </div>
                                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                                            <div className={`h-full ${getBarColor(value)} transition-all`} style={{ width: `${value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    {(scoreA.tips.length > 0 || scoreB.tips.length > 0) && (
                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <p className="text-[10px] font-bold text-yellow-800 mb-1 flex items-center gap-1">
                                <span>💡</span> Tips cải thiện:
                            </p>
                            <ul className="text-[9px] text-yellow-700 space-y-0.5">
                                {[...new Set([...scoreA.tips, ...scoreB.tips])].map((tip, i) => (
                                    <li key={i}>• {tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TitleTester;
