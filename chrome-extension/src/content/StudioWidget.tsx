import { useEffect, useState, useCallback } from 'react';

interface SEOScore {
    overall: number;
    titleScore: number;
    descScore: number;
    tagsScore: number;
    suggestions: string[];
}

const StudioWidget = () => {
    const [score, setScore] = useState<SEOScore | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const analyzeSEO = useCallback(() => {
        // Get title input
        const titleInput = document.querySelector('#textbox[aria-label*="title"], #title-textarea .ytcp-social-suggestions-textbox') as HTMLInputElement | HTMLTextAreaElement;
        const title = titleInput?.value || titleInput?.textContent || '';

        // Get description
        const descInput = document.querySelector('#description-textarea .ytcp-social-suggestions-textbox, #textbox[aria-label*="description"]') as HTMLInputElement | HTMLTextAreaElement;
        const description = descInput?.value || descInput?.textContent || '';

        // Get tags
        const tagChips = document.querySelectorAll('.chip-text');
        const tags: string[] = [];
        tagChips.forEach(chip => {
            if (chip.textContent) tags.push(chip.textContent.trim());
        });

        // Calculate scores
        const suggestions: string[] = [];

        // Title Score (max 30)
        let titleScore = 0;
        if (title.length >= 30 && title.length <= 60) titleScore += 15;
        else if (title.length > 0) { titleScore += 5; suggestions.push('Title should be 30-60 characters'); }
        if (/[🔥🎯✅💡🚀]/.test(title)) titleScore += 5; // Emoji bonus
        else suggestions.push('Add an emoji to your title');
        if (/\d/.test(title)) titleScore += 5; // Number bonus
        if (title.includes('|') || title.includes('-')) titleScore += 5; // Separator bonus

        // Description Score (max 40)
        let descScore = 0;
        if (description.length >= 200) descScore += 20;
        else if (description.length > 0) { descScore += 5; suggestions.push('Description should be 200+ characters'); }
        if (description.includes('http')) descScore += 10; // Links
        if (description.includes('#')) descScore += 10; // Hashtags

        // Tags Score (max 30)
        let tagsScore = 0;
        if (tags.length >= 5) tagsScore += 15;
        else if (tags.length > 0) { tagsScore += 5; suggestions.push('Add at least 5 tags'); }
        if (tags.some(t => t.length > 10)) tagsScore += 10; // Long-tail keywords
        if (tags.length >= 10) tagsScore += 5;

        const overall = titleScore + descScore + tagsScore;

        setScore({ overall, titleScore, descScore, tagsScore, suggestions: suggestions.slice(0, 3) });
    }, []);

    useEffect(() => {
        // Initial analysis
        setTimeout(analyzeSEO, 1000);

        // Watch for changes
        const observer = new MutationObserver(() => {
            analyzeSEO();
        });

        const form = document.querySelector('#video-details-form, ytcp-video-metadata-editor');
        if (form) {
            observer.observe(form, { childList: true, subtree: true, characterData: true });
        }

        // Also listen for input events
        document.addEventListener('input', analyzeSEO);

        return () => {
            observer.disconnect();
            document.removeEventListener('input', analyzeSEO);
        };
    }, [analyzeSEO]);

    if (!score) return null;

    const getGrade = (s: number) => {
        if (s >= 80) return { letter: 'A', color: 'text-green-600' };
        if (s >= 60) return { letter: 'B', color: 'text-blue-600' };
        if (s >= 40) return { letter: 'C', color: 'text-yellow-600' };
        return { letter: 'D', color: 'text-red-600' };
    };

    const grade = getGrade(score.overall);

    return (
        <div className="fixed top-20 right-4 w-72 font-sans z-[9999]">
            <div className="bg-white rounded-xl border-2 border-red-600 shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-50 to-white px-4 py-2.5 border-b border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">S</span>
                        </div>
                        <div>
                            <span className="text-sm font-black text-slate-800">SEENYT<span className="text-red-600">.net</span></span>
                            <p className="text-[9px] text-red-500 font-bold uppercase">SEO Score</p>
                        </div>
                    </div>
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100">
                        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>

                {!isCollapsed && (
                    <div className="p-4">
                        {/* Main Score */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className={`text-5xl font-black ${grade.color}`}>{grade.letter}</div>
                            <div>
                                <p className="text-3xl font-black text-slate-800">{score.overall}<span className="text-lg text-slate-400">/100</span></p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Overall Score</p>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Title</span>
                                <span className="font-bold text-slate-800">{score.titleScore}/30</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 transition-all" style={{ width: `${(score.titleScore / 30) * 100}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Description</span>
                                <span className="font-bold text-slate-800">{score.descScore}/40</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 transition-all" style={{ width: `${(score.descScore / 40) * 100}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Tags</span>
                                <span className="font-bold text-slate-800">{score.tagsScore}/30</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 transition-all" style={{ width: `${(score.tagsScore / 30) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        {score.suggestions.length > 0 && (
                            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                                <p className="text-[10px] text-red-600 font-bold uppercase mb-2">💡 Suggestions</p>
                                <ul className="space-y-1">
                                    {score.suggestions.map((s, i) => (
                                        <li key={i} className="text-xs text-slate-700">• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudioWidget;
