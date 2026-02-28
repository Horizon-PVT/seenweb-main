// AI Coach Chat Widget - Floating at bottom of dashboard
// Quick prompts fill input, buttons work, only arrow/Enter redirects
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_PROMPTS = [
    { icon: '📈', label: 'Get more views' },
    { icon: '🎬', label: 'Review my video' },
    { icon: '📊', label: 'Channel audit' },
    { icon: '🖼️', label: 'New thumbnail' },
    { icon: '💡', label: 'Video ideas' },
];

const TOOLS_LIST = [
    { id: 'scriptwriter', name: 'Viết Kịch Bản', icon: '✍️' },
    { id: 'seo-tool', name: 'SEO & Từ Khóa', icon: '🔍' },
    { id: 'micro-niche-miner', name: 'Đào Ngách CPM', icon: '💎' },
    { id: 'image-forge', name: 'Tạo Ảnh Bìa', icon: '🖼️' },
    { id: 'rival-scanner', name: 'Phân Tích Kênh', icon: '📊' },
];

const THINKING_MODES = [
    { id: 'fast', label: 'Fast', icon: '⚡', desc: 'Quick drafts' },
    { id: 'deep', label: 'Deep thinking', icon: '✨', desc: 'Best for creators' },
    { id: 'max', label: 'MAX', icon: '🔥', desc: 'Advanced reasoning' },
];

export default function AICoachChat() {
    const router = useRouter();
    const [isFocused, setIsFocused] = useState(false);
    const [input, setInput] = useState('');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [thinkingMode, setThinkingMode] = useState('deep');
    const [attachment, setAttachment] = useState<{ type: string, name: string } | null>(null);
    const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null);
    const [isVisible, setIsVisible] = useState(true); // Default to true (expanded)
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch usage on mount
    useEffect(() => {
        fetch('/api/ai-coach/usage')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsage({ remaining: data.data.remaining, limit: data.data.limit });
                }
            })
            .catch(() => { }); // Ignore errors
    }, []);

    const handleSend = () => {
        if (!input.trim() && !attachment) return;
        // Save to localStorage and redirect
        localStorage.setItem('ai-coach-pending', input.trim());
        router.push('/dashboard/ai-coach');
    };

    const handlePromptClick = (label: string) => {
        // Just fill the input, don't redirect
        setInput(label);
        inputRef.current?.focus();
    };

    const handleClose = () => {
        setIsFocused(false);
        setActiveDropdown(null);
    };

    const toggleDropdown = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const type = file.type.startsWith('image') ? 'Hình ảnh' : file.type.startsWith('video') ? 'Video' : 'File';
            setAttachment({ type, name: file.name });
        }
        e.target.value = '';
        setActiveDropdown(null);
    };

    const isActive = isFocused || activeDropdown !== null;
    const currentMode = THINKING_MODES.find(m => m.id === thinkingMode) || THINKING_MODES[1];

    return (
        <>
            <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf" onChange={handleFileChange} className="hidden" />

            {/* BACKDROP */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 9990 }}
                    />
                )}
            </AnimatePresence>

            {/* TOGGLE BUTTON */}
            <AnimatePresence>
                {!isVisible && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsVisible(true)}
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 9999,
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #9333ea, #3b82f6)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 25px -5px rgba(147, 51, 234, 0.5)',
                            transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* CHAT WIDGET */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', paddingBottom: 24, paddingLeft: '256px' }}
                    >
                        <div style={{ width: '100%', maxWidth: 760, padding: '0 16px', position: 'relative' }}>
                            <button
                                onClick={() => setIsVisible(false)}
                                style={{
                                    position: 'absolute',
                                    top: -12,
                                    right: 24,
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: '#1a1a20',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#1a1a20'; e.currentTarget.style.color = '#9ca3af'; }}
                            >
                                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Attachment Preview */}
                            {attachment && (
                                <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, background: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 20 }}>{attachment.type === 'Video' ? '🎬' : attachment.type === 'Hình ảnh' ? '🖼️' : '📄'}</span>
                                    <span style={{ flex: 1, fontSize: 14, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</span>
                                    <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16 }}>✕</button>
                                </div>
                            )}

                            {/* Quick Prompts - Only when focused */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}
                                    >
                                        {QUICK_PROMPTS.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handlePromptClick(q.label)}
                                                style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                                    padding: '12px 20px', borderRadius: 12, background: '#1a1a20',
                                                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s',
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)'; e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = '#1a1a20'; }}
                                            >
                                                <span style={{ fontSize: 18, opacity: 0.7 }}>{q.icon}</span>
                                                <span style={{ fontSize: 12, color: '#9ca3af' }}>{q.label}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Tip */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: 14, color: '#9ca3af' }}>
                                            💡 <span style={{ color: '#eab308' }}>Mẹo:</span> Hoàn thành Bước 1 để khám phá ý tưởng video phù hợp với bạn!
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Input Box */}
                            <div style={{ background: '#1a1a20', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', overflow: 'visible', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative' }}>
                                <div style={{ padding: '16px 20px' }}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        onFocus={() => setIsFocused(true)}
                                        placeholder="How can I help you grow?"
                                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: 14, outline: 'none' }}
                                    />
                                </div>

                                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {/* Tools Dropdown */}
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleDropdown('tools'); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: activeDropdown === 'tools' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeDropdown === 'tools' ? 'white' : '#9ca3af', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Công cụ
                                            </button>
                                            {activeDropdown === 'tools' && (
                                                <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 8, width: 200, background: '#0d0d10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', overflow: 'hidden', zIndex: 100 }} onClick={(e) => e.stopPropagation()}>
                                                    {TOOLS_LIST.map(t => (
                                                        <button key={t.id} onClick={() => { router.push(`/dashboard?tool=${t.id}`); setActiveDropdown(null); }}
                                                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', color: '#d1d5db', fontSize: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <span>{t.icon}</span> {t.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Attach Dropdown */}
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleDropdown('attach'); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: activeDropdown === 'attach' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeDropdown === 'attach' ? 'white' : '#9ca3af', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Attach
                                            </button>
                                            {activeDropdown === 'attach' && (
                                                <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 8, width: 160, background: '#0d0d10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', overflow: 'hidden', zIndex: 100 }} onClick={(e) => e.stopPropagation()}>
                                                    {[{ id: 'video', name: 'Video', icon: '🎬' }, { id: 'image', name: 'Hình ảnh', icon: '🖼️' }, { id: 'doc', name: 'Document', icon: '📄' }].map(opt => (
                                                        <button key={opt.id} onClick={() => { fileInputRef.current?.click(); }}
                                                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', color: '#d1d5db', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}
                                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <span>{opt.icon}</span> {opt.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Deep Thinking Dropdown */}
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleDropdown('thinking'); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: activeDropdown === 'thinking' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeDropdown === 'thinking' ? 'white' : '#9ca3af', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                {currentMode.icon} {currentMode.label}
                                            </button>
                                            {activeDropdown === 'thinking' && (
                                                <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 8, width: 200, background: '#0d0d10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', overflow: 'hidden', zIndex: 100 }} onClick={(e) => e.stopPropagation()}>
                                                    {THINKING_MODES.map(m => (
                                                        <button key={m.id} onClick={() => { setThinkingMode(m.id); setActiveDropdown(null); }}
                                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: thinkingMode === m.id ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: '#d1d5db', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}
                                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                            onMouseOut={(e) => e.currentTarget.style.background = thinkingMode === m.id ? 'rgba(255,255,255,0.05)' : 'transparent'}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <span>{m.icon}</span>
                                                                <div>
                                                                    <div style={{ fontWeight: 500 }}>{m.label}</div>
                                                                    <div style={{ fontSize: 10, color: '#6b7280' }}>{m.desc}</div>
                                                                </div>
                                                            </div>
                                                            {thinkingMode === m.id && <span style={{ color: '#a855f7' }}>✓</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {/* Usage Counter */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                padding: '4px 10px',
                                                borderRadius: 20,
                                                background: usage && usage.remaining <= 2 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                                                border: `1px solid ${usage && usage.remaining <= 2 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                                                fontSize: 11,
                                                color: usage && usage.remaining <= 2 ? '#f87171' : '#9ca3af',
                                            }}
                                            title={usage ? `Còn ${usage.remaining}/${usage.limit} lượt chat hôm nay` : 'Đang tải...'}
                                        >
                                            <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span style={{ fontWeight: 600 }}>
                                                {usage ? `${usage.remaining}/${usage.limit}` : '...'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleSend}
                                            disabled={!input.trim() && !attachment}
                                            style={{
                                                padding: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                                background: (input.trim() || attachment) ? 'linear-gradient(135deg, #9333ea, #3b82f6)' : 'rgba(255,255,255,0.05)',
                                                color: (input.trim() || attachment) ? 'white' : '#6b7280',
                                                opacity: (!input.trim() && !attachment) ? 0.5 : 1
                                            }}
                                        >
                                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
