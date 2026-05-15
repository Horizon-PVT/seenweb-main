// AI Coach - Full Page Chat (VidIQ Style) with Streaming
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, ChevronDown, ChevronRight, Paperclip, Sparkles, Clock, ArrowRight, Trash2, Home, Settings, ExternalLink, Zap, LayoutTemplate, Mic, Download, X, Crown, Check, CreditCard, PlayCircle } from 'lucide-react';
import { VISIBLE_TOOLS } from '@/lib/tool-config';
import { PROMPT_TEMPLATES } from '@/lib/ai-coach-templates';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    thinking?: string[];
    attachment?: { type: string; name: string; url: string };
}

interface Conversation {
    id: string;
    title: string;
    updatedAt: Date;
    messages: Message[];
}

type ThinkingMode = 'fast' | 'deep' | 'max';

const QUICK_PROMPTS = [
    { icon: '📈', label: 'Get more views' },
    { icon: '🎬', label: 'Review my video' },
    { icon: '📊', label: 'Channel audit' },
    { icon: '🖼️', label: 'New thumbnail' },
    { icon: '💡', label: 'Video ideas' },
];

export default function AICoachPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingMode, setThinkingMode] = useState<ThinkingMode>('deep');
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [showToolsDropdown, setShowToolsDropdown] = useState(false);
    const [showAttachDropdown, setShowAttachDropdown] = useState(false);
    const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);
    const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
    const [showThinking, setShowThinking] = useState(true);
    const [attachment, setAttachment] = useState<{ type: string; name: string; url: string } | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConvId, setCurrentConvId] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [aiSettings, setAISettings] = useState<{
        nickname?: string;
        channelInfo?: string;
        personality?: string;
        personalityTags?: string[];
        helpStyle?: string;
        additionalInfo?: string;
        enabled?: boolean;
    }>({});

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const userRole = (session?.user as any)?.role || 'FREE';

    // Usage tracking
    const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null);

    // Fetch usage on mount and after each message
    useEffect(() => {
        fetch('/api/ai-coach/usage')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsage({ remaining: data.data.remaining, limit: data.data.limit });
                }
            })
            .catch(() => { });
    }, [messages.length]);

    // Auth check
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    // Load pending message from widget
    useEffect(() => {
        const pending = localStorage.getItem('ai-coach-pending');
        if (pending) {
            setInput(pending);
            localStorage.removeItem('ai-coach-pending');
            // Auto-focus and optionally auto-send
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, []);

    // Load history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('ai-coach-history');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConversations(parsed);
            } catch { }
        }
    }, []);

    // Save history
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('ai-coach-history', JSON.stringify(conversations));
        }
    }, [conversations]);

    // Load AI Coach settings from API
    useEffect(() => {
        fetch('/api/ai-coach/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setAISettings(data.data);
                }
            })
            .catch(() => { });
    }, []);

    // Scroll to bottom whenever messages, thinking steps, or loading state changes
    useEffect(() => {
        // Use setTimeout to ensure DOM has updated before scrolling
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, [messages, thinkingSteps, isLoading]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't close if clicking inside a dropdown container
            if (target.closest('.dropdown-container')) {
                return;
            }
            setShowToolsDropdown(false);
            setShowAttachDropdown(false);
            setShowModeDropdown(false);
            setShowTemplatesDropdown(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleSend = async (directMessage?: string) => {
        const messageContent = directMessage || input.trim();
        if ((!messageContent && !attachment) || isLoading) return;

        // Check if quota is exhausted before making API call
        if (usage && usage.remaining <= 0) {
            setShowUpgradeModal(true);
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageContent || `[Đính kèm: ${attachment?.name}]`,
            attachment: attachment || undefined,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setAttachment(null);
        setIsLoading(true);
        setThinkingSteps(['Đang kết nối với AI Coach...']);
        setStreamingContent('');

        // Scroll to bottom immediately when sending
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);

        try {
            const steps = [
                'Đang kết nối với AI Coach...',
                'Đang tìm kiếm trong knowledge base...',
                'Đang phân tích câu hỏi...',
                'Đang tạo câu trả lời...',
            ];

            // Show thinking steps progressively
            for (let i = 0; i < steps.length; i++) {
                await new Promise(r => setTimeout(r, 500));
                setThinkingSteps(prev => [...prev.slice(0, i), steps[i]]);
            }

            // Use streaming API
            const res = await fetch('/api/ai-coach/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
                    mode: thinkingMode,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Có lỗi xảy ra');
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let buffer = '';

            if (!reader) throw new Error('No stream available');

            // Stop showing thinking steps once streaming starts
            setThinkingSteps([]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'chunk' && data.content) {
                                fullContent += data.content;
                                setStreamingContent(fullContent);
                                // Auto scroll as content comes in
                                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                            } else if (data.type === 'done') {
                                // Stream complete
                            } else if (data.type === 'error') {
                                throw new Error(data.error);
                            }
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            // Create final assistant message
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullContent || 'Không nhận được phản hồi',
                thinking: steps,
            };

            setMessages(prev => [...prev, assistantMessage]);
            setStreamingContent('');

            // Save to conversation
            const title = userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? '...' : '');
            if (!currentConvId) {
                const newConv: Conversation = {
                    id: Date.now().toString(),
                    title,
                    updatedAt: new Date(),
                    messages: [...messages, userMessage, assistantMessage],
                };
                setConversations(prev => [newConv, ...prev]);
                setCurrentConvId(newConv.id);
            } else {
                setConversations(prev => prev.map(c =>
                    c.id === currentConvId
                        ? { ...c, messages: [...messages, userMessage, assistantMessage], updatedAt: new Date() }
                        : c
                ));
            }
        } catch (err: any) {
            // Check if quota exceeded - show upgrade modal
            if (err.message?.includes('hết') || err.message?.includes('lượt')) {
                setShowUpgradeModal(true);
            }
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: err.message || 'Không thể kết nối. Vui lòng thử lại.',
            }]);
        } finally {
            setIsLoading(false);
            setThinkingSteps([]);
            setStreamingContent('');
        }
    };

    // Extract follow-up suggestions from message content
    const extractSuggestions = (content: string): { mainContent: string; suggestions: string[] } => {
        // Look for the suggestions block that starts with "💡 Câu hỏi gợi ý:" or similar
        const suggestionsMatch = content.match(/---\s*\n\*?\*?💡\s*Câu hỏi gợi ý:?\*?\*?\s*\n([\s\S]*?)$/i);

        if (suggestionsMatch) {
            const mainContent = content.slice(0, suggestionsMatch.index).trim();
            const suggestionsText = suggestionsMatch[1];

            // Parse numbered list items like "1. Question here"
            const suggestions = suggestionsText
                .split('\n')
                .map(line => line.replace(/^\d+\.\s*\[?\]?/, '').trim())
                .filter(line => line.length > 5 && !line.startsWith('('));

            return { mainContent, suggestions: suggestions.slice(0, 3) };
        }

        return { mainContent: content, suggestions: [] };
    };

    // Handle clicking a suggestion
    const handleSuggestionClick = (suggestion: string) => {
        handleSend(suggestion);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const type = file.type.startsWith('image') ? 'Hình ảnh' : file.type.startsWith('video') ? 'Video' : 'File';
            setAttachment({ type, name: file.name, url: URL.createObjectURL(file) });
        }
        e.target.value = '';
    };

    // Voice Input using Web Speech API
    const handleVoiceInput = () => {
        // Check browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Trình duyệt không hỗ trợ nhận dạng giọng nói. Vui lòng sử dụng Chrome.');
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInput(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
                alert('Vui lòng cho phép truy cập microphone để sử dụng tính năng này.');
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    };

    // Export Chat to text file
    const handleExportChat = () => {
        if (messages.length === 0) {
            alert('Không có tin nhắn để xuất.');
            return;
        }

        const content = messages.map(msg => {
            const role = msg.role === 'user' ? '👤 Bạn' : '🤖 AI Coach';
            return `${role}:\n${msg.content}\n`;
        }).join('\n---\n\n');

        const header = `=== AI Coach Conversation ===\nNgày: ${new Date().toLocaleString('vi-VN')}\nSố tin nhắn: ${messages.length}\n\n---\n\n`;
        const fullContent = header + content;

        const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-coach-chat-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleNewChat = () => {
        setMessages([]);
        setCurrentConvId(null);
        setThinkingSteps([]);
    };

    const loadConversation = (conv: Conversation) => {
        setMessages(conv.messages);
        setCurrentConvId(conv.id);
    };

    const deleteConversation = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentConvId === id) {
            handleNewChat();
        }
    };

    const getModeLabel = (m: ThinkingMode) => m === 'fast' ? 'Fast' : m === 'deep' ? 'Deep thinking' : 'MAX';
    const getModeIcon = (m: ThinkingMode) => m === 'fast' ? '⚡' : m === 'deep' ? '✨' : '🔥';

    if (status === 'loading') {
        return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <>
            <Head>
                <title>AI Coach - SeenYT</title>
                <meta name="robots" content="noindex" />
            </Head>

            <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf" onChange={handleFileChange} className="hidden" />

            <div className="min-h-screen bg-[#0a0a0c] text-white flex">
                {/* LEFT SIDEBAR */}
                <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0d0d10] border-r border-white/5 flex flex-col transition-all duration-300 flex-shrink-0`}>
                    {/* Logo */}
                    <div className="p-4 flex items-center gap-3 border-b border-white/5">
                        <img src="/seenyt-logo.jpg" alt="SeenYT" className="w-8 h-8 rounded-lg" />
                        {!sidebarCollapsed && <span className="font-bold text-lg">SeenYT</span>}
                        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="ml-auto text-gray-500 hover:text-white">
                            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                        </button>
                    </div>

                    {/* Nav - Scrollable */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                        {/* Home */}
                        <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                            <Home size={18} />
                            {!sidebarCollapsed && <span className="text-sm">Home</span>}
                        </button>

                        {/* New Chat */}
                        <button onClick={handleNewChat} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-all">
                            <Plus size={18} />
                            {!sidebarCollapsed && <span className="text-sm font-medium">New Chat</span>}
                        </button>

                        {/* Upgrade Pro */}
                        {!sidebarCollapsed && (
                            <button
                                onClick={() => router.push('/pricing')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-400 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/20 transition-all mt-2"
                            >
                                <Zap size={18} />
                                <span className="text-sm font-bold">Nâng cấp Pro</span>
                            </button>
                        )}

                        {/* Extension */}
                        {!sidebarCollapsed && (
                            <a
                                href="https://chromewebstore.google.com/detail/seenyt-youtube-seo-ai-gro/ajjimohhpmkhgagldoegomjobgpkffdc"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/20 transition-all"
                            >
                                <ExternalLink size={18} />
                                <span className="text-sm font-medium">Cài Extension</span>
                            </a>
                        )}

                        {/* AI Coach Settings */}
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <Settings size={18} />
                            {!sidebarCollapsed && <span className="text-sm">Cá nhân hóa</span>}
                        </button>

                        {/* CÔNG CỤ CỦA TÔI section removed as requested */}

                        {/* Creator workspace links */}
                        {!sidebarCollapsed && (
                            <>
                                <div className="h-px bg-white/5 my-4 mx-3"></div>

                                <button
                                    onClick={() => router.push('/dashboard?workflow=launch-channel')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 group mb-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                    <LayoutTemplate size={18} />
                                    <span className="text-sm font-medium">Workflow làm kênh</span>
                                </button>

                                <button
                                    onClick={() => router.push('/dashboard/subscription')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 group mb-1 text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    <CreditCard size={18} className="group-hover:text-emerald-400 transition-colors" />
                                    <span className="text-sm font-medium">Gói và thanh toán</span>
                                </button>

                                <button
                                    onClick={() => router.push('/guides')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 group mb-1 text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    <PlayCircle size={18} className="group-hover:text-red-400 transition-colors" />
                                    <span className="text-sm font-medium">Hướng dẫn sử dụng</span>
                                </button>
                            </>
                        )}

                        {/* History Section */}
                        {!sidebarCollapsed && conversations.length > 0 && (
                            <>
                                <div className="pt-4 pb-2 border-t border-white/5 mt-3">
                                    <span className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider">History</span>
                                </div>
                                <div className="space-y-0.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                                    {conversations.slice(0, 10).map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => loadConversation(conv)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group ${currentConvId === conv.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <MessageSquare size={14} className="flex-shrink-0" />
                                            <span className="truncate flex-1 text-left">{conv.title}</span>
                                            <button onClick={(e) => deleteConversation(conv.id, e)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400">
                                                <Trash2 size={12} />
                                            </button>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </nav>

                    {/* User */}
                    <div className="p-3 border-t border-white/5">
                        <div className="flex items-center gap-3 px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${userRole === 'PRO' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-700'}`}>
                                {userRole.charAt(0)}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-white truncate">{(session?.user as any)?.email?.split('@')[0] || 'User'}</p>
                                    <p className="text-[10px] text-gray-500">{userRole} Plan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* MAIN CHAT AREA */}
                <main className="flex-1 flex flex-col min-w-0">
                    {/* Top bar */}
                    <div className="p-4 flex justify-end">
                        {messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                            <div className="px-4 py-2 rounded-full bg-purple-600/20 text-purple-300 text-sm border border-purple-500/30">
                                {messages[messages.length - 1].content.slice(0, 40)}...
                            </div>
                        )}
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 pb-40 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        <div className="max-w-3xl mx-auto">
                            {/* Empty State */}
                            {messages.length === 0 && !isLoading && (
                                <div className="pt-20 text-center">
                                    <h1 className="text-2xl font-light text-gray-300 mb-8">How can I help you grow?</h1>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {QUICK_PROMPTS.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setInput(q.label); inputRef.current?.focus(); }}
                                                className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-[#1a1a20] border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                                            >
                                                <span className="text-2xl">{q.icon}</span>
                                                <span className="text-xs text-gray-400">{q.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Thinking Indicator - removed from here, moved to after messages */}

                            {/* Messages */}
                            {messages.map((msg) => (
                                <div key={msg.id} className="mb-6">
                                    {msg.role === 'user' ? (
                                        <div className="flex justify-end">
                                            <div className="max-w-[70%] rounded-2xl px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                                {msg.attachment && <div className="text-xs opacity-70 mb-1">📎 {msg.attachment.name}</div>}
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {msg.thinking && msg.thinking.length > 0 && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Sparkles size={12} />
                                                    <span>Thinking about the answer...</span>
                                                </div>
                                            )}
                                            <div className="ai-coach-message">
                                                {(() => {
                                                    const { mainContent, suggestions } = extractSuggestions(msg.content);
                                                    return (
                                                        <>
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-4 mt-6 pb-2 border-b border-white/10">{children}</h1>,
                                                                    h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-3 mt-5">{children}</h2>,
                                                                    h3: ({ children }) => <h3 className="text-base font-semibold text-white mb-2 mt-4">{children}</h3>,
                                                                    h4: ({ children }) => <h4 className="text-sm font-semibold text-purple-400 mb-2 mt-3">{children}</h4>,
                                                                    p: ({ children }) => <p className="text-gray-200 mb-3 leading-relaxed">{children}</p>,
                                                                    ul: ({ children }) => <ul className="space-y-2 mb-4 pl-1">{children}</ul>,
                                                                    ol: ({ children }) => <ol className="space-y-2 mb-4 pl-1 list-decimal list-inside">{children}</ol>,
                                                                    li: ({ children }) => (
                                                                        <li className="text-gray-200 flex items-start gap-2">
                                                                            <span className="text-purple-400 mt-1.5">•</span>
                                                                            <span className="flex-1">{children}</span>
                                                                        </li>
                                                                    ),
                                                                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                                                    em: ({ children }) => <em className="text-purple-300 not-italic">{children}</em>,
                                                                    code: ({ children, className }) => {
                                                                        const isBlock = className?.includes('language-');
                                                                        return isBlock ? (
                                                                            <pre className="bg-[#1a1a25] rounded-lg p-4 overflow-x-auto mb-4 border border-white/5">
                                                                                <code className="text-sm text-green-400">{children}</code>
                                                                            </pre>
                                                                        ) : (
                                                                            <code className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-sm">{children}</code>
                                                                        );
                                                                    },
                                                                    blockquote: ({ children }) => (
                                                                        <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-500/5 rounded-r-lg">
                                                                            {children}
                                                                        </blockquote>
                                                                    ),
                                                                    a: ({ href, children }) => (
                                                                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
                                                                            {children}
                                                                        </a>
                                                                    ),
                                                                    hr: () => <hr className="border-white/10 my-6" />,
                                                                }}
                                                            >
                                                                {mainContent}
                                                            </ReactMarkdown>

                                                            {/* Clickable Follow-up Suggestions */}
                                                            {suggestions.length > 0 && (
                                                                <div className="mt-6 pt-4 border-t border-white/10">
                                                                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                                                                        <span>💡</span> Câu hỏi gợi ý:
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {suggestions.map((suggestion, idx) => (
                                                                            <button
                                                                                key={idx}
                                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                                                disabled={isLoading}
                                                                                className="px-4 py-2 text-sm text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                                                            >
                                                                                {suggestion}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Thinking Indicator - NOW AFTER MESSAGES */}
                            <AnimatePresence>
                                {isLoading && thinkingSteps.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mb-6 bg-[#1a1a20] rounded-2xl border border-white/10 overflow-hidden"
                                    >
                                        <button onClick={() => setShowThinking(!showThinking)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm text-gray-300">Đang suy nghĩ...</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showThinking ? '' : '-rotate-90'}`} />
                                        </button>

                                        <AnimatePresence>
                                            {showThinking && (
                                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                    <div className="px-5 pb-4 space-y-2">
                                                        {thinkingSteps.map((step, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                                {i === thinkingSteps.length - 1 ? (
                                                                    <div className="w-3 h-3 mt-1 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <div className="w-3 h-3 mt-1 rounded-full bg-blue-400"></div>
                                                                )}
                                                                <span className="text-gray-400">{step}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Streaming Content Display */}
                            {streamingContent && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs text-purple-400">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                                            <span>AI Coach đang phản hồi...</span>
                                        </div>
                                        <div className="ai-coach-message">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ children }) => <p className="text-gray-200 mb-3 leading-relaxed">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                                    h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-3 mt-5">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-base font-semibold text-white mb-2 mt-4">{children}</h3>,
                                                    ul: ({ children }) => <ul className="space-y-2 mb-4 pl-1">{children}</ul>,
                                                    li: ({ children }) => (
                                                        <li className="text-gray-200 flex items-start gap-2">
                                                            <span className="text-purple-400 mt-1.5">•</span>
                                                            <span className="flex-1">{children}</span>
                                                        </li>
                                                    ),
                                                }}
                                            >
                                                {streamingContent}
                                            </ReactMarkdown>
                                            <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1"></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* INPUT BAR */}
                    <div className="fixed bottom-0 left-64 right-0 p-6 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent z-50">
                        <div className="max-w-3xl mx-auto">
                            {attachment && (
                                <div className="mb-3 p-3 rounded-xl bg-[#1a1a20] border border-white/10 flex items-center gap-3">
                                    {attachment.type === 'Hình ảnh' ? (
                                        <img src={attachment.url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                                            {attachment.type === 'Video' ? '🎬' : '📄'}
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-300 flex-1 truncate">{attachment.name}</span>
                                    <button onClick={() => setAttachment(null)} className="text-gray-500 hover:text-white">✕</button>
                                </div>
                            )}

                            <div className="bg-[#1a1a20] rounded-2xl border border-white/10 overflow-visible shadow-2xl">
                                <div className="px-5 py-4">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="How can I help you grow?"
                                        className="w-full bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
                                    />
                                </div>

                                <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {/* Tools */}
                                        <div className="relative dropdown-container">
                                            <button
                                                onClick={() => { console.log('Tools clicked!', !showToolsDropdown); setShowToolsDropdown(!showToolsDropdown); setShowAttachDropdown(false); setShowModeDropdown(false); }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${showToolsDropdown ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                <Settings size={14} /> Công cụ
                                            </button>
                                            {showToolsDropdown && (
                                                <div className="absolute bottom-full left-0 mb-2 w-56 max-h-64 overflow-y-auto bg-[#0d0d10] border border-white/10 rounded-xl shadow-2xl z-[100] custom-scrollbar">
                                                    {VISIBLE_TOOLS.map(t => {
                                                        const Icon = t.icon;
                                                        return (
                                                            <button key={t.id} onClick={() => { router.push(t.route || `/dashboard?tool=${t.id}`); setShowToolsDropdown(false); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 transition-all">
                                                                <Icon size={16} className={t.color || ''} /> {t.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Attach */}
                                        <div className="relative dropdown-container">
                                            <button
                                                onClick={() => { setShowAttachDropdown(!showAttachDropdown); setShowToolsDropdown(false); setShowModeDropdown(false); }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${showAttachDropdown ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                <Paperclip size={14} /> Attach
                                            </button>
                                            {showAttachDropdown && (
                                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#0d0d10] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                                                    {/* Image - Available */}
                                                    <button onClick={() => { fileInputRef.current?.setAttribute('accept', 'image/*'); fileInputRef.current?.click(); setShowAttachDropdown(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-all">
                                                        <span>🖼️</span> Hình ảnh
                                                    </button>
                                                    {/* Document - Available */}
                                                    <button onClick={() => { fileInputRef.current?.setAttribute('accept', '.pdf,.doc,.docx,.txt'); fileInputRef.current?.click(); setShowAttachDropdown(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-all">
                                                        <span>📄</span> Document
                                                    </button>
                                                    {/* Link - Available */}
                                                    <button onClick={() => {
                                                        const url = prompt('Nhập link YouTube hoặc URL:');
                                                        if (url) {
                                                            setInput(prev => prev + (prev ? '\n' : '') + `[Link: ${url}]`);
                                                            inputRef.current?.focus();
                                                        }
                                                        setShowAttachDropdown(false);
                                                    }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-all">
                                                        <span>🔗</span> Link / URL
                                                    </button>
                                                    {/* Video - Disabled */}
                                                    <div className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-500 opacity-50 cursor-not-allowed border-t border-white/5">
                                                        <span>🎬</span> Video <span className="ml-auto text-[10px] bg-gray-700 px-1.5 py-0.5 rounded">Sắp ra mắt</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Mode */}
                                        <div className="relative dropdown-container">
                                            <button
                                                onClick={() => { setShowModeDropdown(!showModeDropdown); setShowToolsDropdown(false); setShowAttachDropdown(false); }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${showModeDropdown ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                {getModeIcon(thinkingMode)} {getModeLabel(thinkingMode)}
                                            </button>
                                            {showModeDropdown && (
                                                <div className="absolute bottom-full left-0 mb-2 w-52 bg-[#0d0d10] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                                    {([
                                                        { m: 'fast' as ThinkingMode, d: 'Quick drafts' },
                                                        { m: 'deep' as ThinkingMode, d: 'Best for creators' },
                                                        { m: 'max' as ThinkingMode, d: 'Advanced reasoning' },
                                                    ]).map(x => (
                                                        <button key={x.m} onClick={() => { setThinkingMode(x.m); setShowModeDropdown(false); }}
                                                            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all ${thinkingMode === x.m ? 'bg-white/5' : ''}`}>
                                                            <div className="flex items-center gap-2">
                                                                <span>{getModeIcon(x.m)}</span>
                                                                <div>
                                                                    <p className="text-sm text-white">{getModeLabel(x.m)}</p>
                                                                    <p className="text-[10px] text-gray-500">{x.d}</p>
                                                                </div>
                                                            </div>
                                                            {thinkingMode === x.m && <span className="text-purple-400">✓</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Templates */}
                                        <div className="relative dropdown-container">
                                            <button
                                                onClick={() => { setShowTemplatesDropdown(!showTemplatesDropdown); setShowToolsDropdown(false); setShowAttachDropdown(false); setShowModeDropdown(false); }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${showTemplatesDropdown ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                <LayoutTemplate size={14} /> Mẫu
                                            </button>
                                            {showTemplatesDropdown && (
                                                <div className="absolute bottom-full left-0 mb-2 w-72 max-h-80 overflow-y-auto bg-[#0d0d10] border border-white/10 rounded-xl shadow-2xl z-[100] custom-scrollbar">
                                                    <div className="p-2 border-b border-white/5">
                                                        <p className="text-xs text-gray-500 px-2">Quick Templates</p>
                                                    </div>
                                                    {PROMPT_TEMPLATES.map(t => (
                                                        <button key={t.id} onClick={() => {
                                                            setInput(t.prompt);
                                                            setShowTemplatesDropdown(false);
                                                            inputRef.current?.focus();
                                                        }}
                                                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all group">
                                                            <span className="text-lg">{t.icon}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-white group-hover:text-purple-400 transition-colors">{t.title}</p>
                                                                <p className="text-[10px] text-gray-500 truncate">{t.description}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Voice Input */}
                                        <button
                                            onClick={handleVoiceInput}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                                            title={isRecording ? 'Đang ghi âm... Click để dừng' : 'Nhập bằng giọng nói'}
                                        >
                                            <Mic size={14} /> {isRecording ? 'Đang ghi...' : 'Giọng nói'}
                                        </button>

                                        {/* Export Chat */}
                                        {messages.length > 0 && (
                                            <button
                                                onClick={handleExportChat}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
                                                title="Xuất cuộc hội thoại"
                                            >
                                                <Download size={14} /> Xuất
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Usage Counter */}
                                        <div
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${usage && usage.remaining <= 2
                                                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                                } border`}
                                            title={usage ? `Còn ${usage.remaining}/${usage.limit} lượt chat hôm nay` : 'Đang tải...'}
                                        >
                                            <Clock size={12} />
                                            <span className="font-medium">
                                                {usage ? `${usage.remaining}/${usage.limit}` : '...'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleSend()}
                                            disabled={(!input.trim() && !attachment) || isLoading}
                                            className="p-2 rounded-full bg-white/5 text-gray-400 hover:bg-purple-600 hover:text-white disabled:opacity-30 transition-all"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(showToolsDropdown || showAttachDropdown || showModeDropdown) && (
                        <div className="fixed inset-0 z-40" onClick={() => { setShowToolsDropdown(false); setShowAttachDropdown(false); setShowModeDropdown(false); }} />
                    )}
                </main>
            </div>

            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgradeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                        onClick={() => setShowUpgradeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-[#1a1a25] to-[#0d0d12] rounded-3xl border border-white/10 max-w-lg w-full overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-center">
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                                    <Crown size={32} className="text-yellow-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Nâng cấp AI Coach Pro
                                </h2>
                                <p className="text-white/80 text-sm">
                                    Tiếp tục chat với AI Coach không giới hạn
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="px-6 py-6 space-y-4">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                                    <p className="text-red-400 text-sm">
                                        😢 Bạn đã sử dụng hết <strong>{usage?.limit || 5} lượt</strong> chat miễn phí hôm nay
                                    </p>
                                </div>

                                <p className="text-gray-400 text-sm text-center">
                                    Nâng cấp để nhận:
                                </p>

                                <div className="space-y-3">
                                    {[
                                        { text: 'Chat không giới hạn với AI Coach', highlight: true },
                                        { text: 'Truy cập Deep Thinking & Max mode', highlight: false },
                                        { text: 'Phân tích video & kênh YouTube', highlight: false },
                                        { text: 'Hỗ trợ ưu tiên 24/7', highlight: false },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${item.highlight ? 'bg-purple-500/10 border border-purple-500/20' : ''}`}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.highlight ? 'bg-purple-500' : 'bg-green-500/20'}`}>
                                                <Check size={12} className={item.highlight ? 'text-white' : 'text-green-400'} />
                                            </div>
                                            <span className={`text-sm ${item.highlight ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                {item.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing */}
                                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                                    <p className="text-gray-400 text-xs mb-1">Chỉ từ</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-3xl font-bold text-white">199K</span>
                                        <span className="text-gray-400">/tháng</span>
                                    </div>
                                    <p className="text-green-400 text-xs mt-1">Tiết kiệm 50% so với mua lẻ</p>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="px-6 pb-6 space-y-3">
                                <button
                                    onClick={() => { router.push('/pricing'); setShowUpgradeModal(false); }}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-[1.02]"
                                >
                                    🚀 Nâng cấp ngay
                                </button>
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="w-full py-3 rounded-xl text-gray-400 hover:text-white text-sm transition-colors"
                                >
                                    Để sau, tiếp tục dùng miễn phí
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettingsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                        onClick={() => setShowSettingsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-[#1a1a25] to-[#0d0d12] rounded-3xl border border-white/10 max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-xl px-6 py-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Cá nhân hóa AI Coach</h2>
                                    <p className="text-white/70 text-sm">Thiết lập để AI hiểu bạn hơn</p>
                                </div>
                                <button onClick={() => setShowSettingsModal(false)} className="text-white/70 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-6 space-y-5">
                                {/* Nickname */}
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">AI Coach nên gọi bạn là gì?</label>
                                    <input
                                        type="text"
                                        value={aiSettings.nickname || ''}
                                        onChange={e => setAISettings({ ...aiSettings, nickname: e.target.value })}
                                        placeholder="VD: Anh Tùng, Boss, Bạn..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                                        maxLength={50}
                                    />
                                </div>

                                {/* Channel Info */}
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Thông tin kênh & khán giả</label>
                                    <textarea
                                        value={aiSettings.channelInfo || ''}
                                        onChange={e => setAISettings({ ...aiSettings, channelInfo: e.target.value })}
                                        placeholder="VD: Kênh về công nghệ, 2 video/tuần, target 18-35 tuổi, đang có 50K subs..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 min-h-[80px] resize-none"
                                        maxLength={500}
                                    />
                                    <p className="text-right text-xs text-gray-500 mt-1">{(aiSettings.channelInfo || '').length}/500</p>
                                </div>

                                {/* Personality */}
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Tính cách AI Coach</label>
                                    <textarea
                                        value={aiSettings.personality || ''}
                                        onChange={e => setAISettings({ ...aiSettings, personality: e.target.value })}
                                        placeholder="VD: Thân thiện, nói thẳng, humor nhẹ, data-driven..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 min-h-[60px] resize-none"
                                        maxLength={300}
                                    />
                                </div>

                                {/* Personality Tags */}
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Phong cách giao tiếp</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Thẳng thắn', 'Khuyến khích', 'Dí dỏm', 'Chi tiết', 'Ngắn gọn', 'Gen Z'].map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    const tags = aiSettings.personalityTags || [];
                                                    if (tags.includes(tag)) {
                                                        setAISettings({ ...aiSettings, personalityTags: tags.filter(t => t !== tag) });
                                                    } else {
                                                        setAISettings({ ...aiSettings, personalityTags: [...tags, tag] });
                                                    }
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${(aiSettings.personalityTags || []).includes(tag)
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                + {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Help Style */}
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">AI Coach nên giúp bạn như thế nào?</label>
                                    <textarea
                                        value={aiSettings.helpStyle || ''}
                                        onChange={e => setAISettings({ ...aiSettings, helpStyle: e.target.value })}
                                        placeholder="VD: Focus SEO, viết script ngắn gọn, giọng văn như MrBeast..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 min-h-[60px] resize-none"
                                        maxLength={500}
                                    />
                                </div>

                                {/* Additional Info */}
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Thông tin khác AI Coach cần biết</label>
                                    <textarea
                                        value={aiSettings.additionalInfo || ''}
                                        onChange={e => setAISettings({ ...aiSettings, additionalInfo: e.target.value })}
                                        placeholder="VD: Đang chuẩn bị launch channel mới, mục tiêu 100K subs trong 6 tháng..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 min-h-[60px] resize-none"
                                        maxLength={500}
                                    />
                                </div>

                                {/* Enable Toggle */}
                                <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                                    <span className="text-sm text-gray-300">Bật cho các chat mới</span>
                                    <button
                                        onClick={() => setAISettings({ ...aiSettings, enabled: !aiSettings.enabled })}
                                        className={`w-12 h-6 rounded-full transition-all ${aiSettings.enabled ? 'bg-purple-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${aiSettings.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-[#0d0d12] border-t border-white/5 px-6 py-4 flex gap-3">
                                <button
                                    onClick={() => setAISettings({})}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/ai-coach/settings', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(aiSettings)
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                setShowSettingsModal(false);
                                            } else {
                                                alert(data.error || 'Lỗi lưu cài đặt');
                                            }
                                        } catch {
                                            alert('Không thể lưu cài đặt');
                                        }
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                >
                                    Lưu & Áp dụng
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
        </>
    );
}
