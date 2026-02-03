import React from 'react';
import Tab4Learning from './dashboard/Tab4Learning';
import { useTranslation } from 'next-i18next';

interface YouTubeTeacherToolProps {
    onBack?: () => void;
    onToolSelect?: (id: string) => void;
}

// Wrapper for the Learning Tab content to behave like a Tool
const YouTubeTeacherTool: React.FC<YouTubeTeacherToolProps> = ({ onBack, onToolSelect }) => {
    const { t } = useTranslation('common');

    return (
        <div className="h-full flex flex-col text-white overflow-hidden">
            {/* Header wrapper if needed, or rely on Tab4Learning's internal header if appropriate. 
            However, Tab4Learning might just be the content cards. Let's check. 
            Actually, the user wants "Thầy YouTube" which implies the "Course" or "Mentor" UI. 
            For now, reusing Tab4Learning is the safest bet to show CONTENT, but wrapped to look like a tool page.
        */}
            <div className="flex justify-between items-center px-6 py-4 bg-[#111] border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-900/30 rounded-lg">
                        <span className="text-2xl">🎓</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{t('tools.teacher.title')}</h2>
                    </div>
                </div>
                {onBack && (
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm">
                        {t('tools.teacher.back')}
                    </button>
                )}
            </div>

            <div className="flex-grow overflow-y-auto bg-[#0a0a0a]">
                {/* We pass a dummy onOpenTool because inside the Teacher tool we might not navigate away, or self-reference. */}
                <Tab4Learning onOpenTool={onToolSelect || (() => { })} />
            </div>
        </div>
    );
};

export default YouTubeTeacherTool;
