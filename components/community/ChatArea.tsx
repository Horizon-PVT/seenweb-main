import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import ReactConfetti from 'react-confetti';
import Image from 'next/image';
import FlexCard from './FlexCard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ChatAreaProps {
    channel: any;
}

export default function ChatArea({ channel }: ChatAreaProps) {
    const { data: session } = useSession();
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const isShowcase = channel?.type === 'SHOWCASE';

    // State for Flex Form
    const [flexData, setFlexData] = useState({ subCount: '', viewCount: '', topic: '' });
    const [showFlexModal, setShowFlexModal] = useState(false);

    // Confetti State
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const lastMessageIdRef = useRef<string | null>(null);

    // Auto-scroll ref
    const scrollRef = useRef<HTMLDivElement>(null);

    // Set window size for confetti
    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    // POLLING: Fetch messages every 2 seconds
    const { data: messages, mutate } = useSWR(
        channel ? `/api/community/messages?channelId=${channel.id}` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    // Handle Confetti & Scroll
    useEffect(() => {
        if (messages && messages.length > 0) {
            const latestMsg = messages[messages.length - 1];

            // Check for new message
            if (lastMessageIdRef.current && lastMessageIdRef.current !== latestMsg.id) {
                // Beep sound? (Optional)

                // If Flex Room -> TRIGGER CONFETTI
                if (channel.slug === 'flex') {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                }

                // Auto scroll on new message
                setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            } else if (!lastMessageIdRef.current) {
                // Initial load -> Scroll to bottom immediately
                setTimeout(() => scrollRef.current?.scrollIntoView(), 100);
            }

            lastMessageIdRef.current = latestMsg.id;
        }
    }, [messages, channel.slug]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        setIsSending(true);
        const content = input;
        setInput(''); // Optimistic clear

        try {
            await fetch('/api/community/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, channelId: channel.id }),
            });
            mutate(); // Trigger immediate refresh
        } catch (err) {
            console.error(err);
            setInput(content); // Restore on error
        } finally {
            setIsSending(false);
        }
    };

    const handleFlexSubmit = async () => {
        // ... (keep existing Logic)
    };

    // ADMIN: Toggle Auto Chat
    const [autoChatEnabled, setAutoChatEnabled] = useState(false);
    useEffect(() => {
        const role = (session?.user as any)?.role;
        if (role === 'ADMIN' || role === 'MOD') {
            fetch('/api/admin/toggle-chat')
                .then(res => res.json())
                .then(data => setAutoChatEnabled(data.enabled));
        }
    }, [session]);

    const toggleAutoChat = async () => {
        const newState = !autoChatEnabled;
        setAutoChatEnabled(newState);
        await fetch('/api/admin/toggle-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: newState })
        });
    };

    // Modals
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalData, setModalData] = useState('');

    const handleCodeSubmit = () => {
        if (!modalData.trim()) return;
        setInput(`\`\`\`\n${modalData}\n\`\`\``);
        setModalData('');
        setShowCodeModal(false);
    };

    const handleImageSubmit = () => {
        if (!modalData.trim()) return;
        const urlToCheck = modalData.trim();
        // Basic validation or just trusting input
        setInput(`![Image](${urlToCheck})`);
        setModalData('');
        setShowImageModal(false);
    };

    // Plus Menu State
    const [showPlusMenu, setShowPlusMenu] = useState(false);

    if (!channel) return <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#13111C]">Chọn một phòng...</div>;

    const userRole = (session?.user as any)?.role;
    // Debug helper for user:
    // console.log("Current User Role:", userRole);

    return (
        <div className="flex-1 flex flex-col h-full bg-[#13111C] relative overflow-hidden font-sans group">
            {/* WALLPAPER / GRID PATTERN */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* Confetti Overlay */}
            {showConfetti && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                    <ReactConfetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />
                </div>
            )}

            {/* Header */}
            <div className="h-14 border-b border-indigo-500/10 flex items-center justify-between px-4 bg-[#13111C]/95 backdrop-blur shadow-lg z-10 relative">
                <div className="flex items-center">
                    <span className="text-xl mr-3 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">{channel.icon}</span>
                    <div>
                        <h3 className="font-bold text-gray-100 text-sm flex items-center gap-2 tracking-wide">
                            {channel.name}
                            {channel.slug === 'flex' && <span className="text-[9px] bg-pink-500/20 text-pink-400 px-2 rounded border border-pink-500/30 animate-pulse">PARTY</span>}
                        </h3>
                        {/* <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase hidden md:block">{channel.description}</p> */}
                    </div>
                </div>

                {/* ADMIN CONTROL - MOVED & STYLED */}
                {(userRole === 'ADMIN' || userRole === 'MOD') ? (
                    <button
                        onClick={toggleAutoChat}
                        className={`text-[9px] px-3 py-1.5 rounded-full border font-mono font-bold uppercase transition-all tracking-wider z-50 flex items-center gap-2
                        ${autoChatEnabled
                                ? 'bg-green-500/10 text-green-400 border-green-500/40 hover:bg-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]'
                                : 'bg-red-500/10 text-red-50 text-red-400 border-red-500/40 hover:bg-red-500/20'}
                      `}
                        title="Bật/Tắt Bot Chat Tự Động"
                    >
                        <span className={`w-2 h-2 rounded-full ${autoChatEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        {autoChatEnabled ? 'BOT: ON' : 'BOT: OFF'}
                    </button>
                ) : (
                    // Show nothing if not admin
                    null
                )}
            </div>

            {/* Messages Area - Added padding bottom to account for absolute input */}
            <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar relative z-0 pb-20 ${isShowcase ? 'bg-[#0b101e]' : ''}`}>
                {!messages ? (
                    <p className="text-gray-500 text-center mt-10 font-mono text-xs">LOADING_DATA...</p>
                ) : messages.length === 0 ? (
                    <div className="text-center mt-10 opacity-50">
                        <div className="text-4xl mb-2 grayscale">👋</div>
                        <p className="text-gray-400 text-sm">Chưa có dữ liệu.</p>
                    </div>
                ) : isShowcase ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {messages.map((msg: any) => <FlexCard key={msg.id} message={msg} />)}
                    </div>
                ) : (
                    messages.map((msg: any) => (
                        <div key={msg.id} className="flex gap-3 group mb-1 hover:bg-white/5 px-2 py-1 rounded transition-all border border-transparent hover:border-white/5 -mx-2 items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                {msg.user.image ? (
                                    <Image src={msg.user.image} alt={msg.user.name} width={32} height={32} className="rounded-full bg-gray-800 ring-1 ring-white/10 object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold ring-1 ring-white/10 text-xs">
                                        {msg.user.name?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-gray-200 hover:text-indigo-400 cursor-pointer transition-colors text-[13px] hover:underline">
                                        {msg.user.name}
                                    </span>
                                    {msg.user.youtubeSubCount > 1000 && <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1 rounded font-mono">✓</span>}
                                    {(msg.user.role === 'ADMIN' || msg.user.role === 'MOD') && <span className="text-[9px] bg-red-500 text-white px-1 py-0.5 rounded font-bold uppercase tracking-wider">MOD</span>}
                                    <span className="text-[10px] text-gray-600 ml-auto font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-[14px] markdown-content break-words font-light">
                                    {/* Render Markdown Images/Links simplisticly if possible, or just text */}
                                    {msg.content.startsWith('![Image]') ? (
                                        <div className="mt-1 relative rounded overflow-hidden border border-white/10 shadow-lg inline-block max-w-sm">
                                            <img src={msg.content.match(/\((.*?)\)/)?.[1]} alt="User Image" className="max-h-60 object-contain bg-black" />
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area (Dynamic) - ABSOLUTE BOTTOM */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#13111C] p-4 border-t border-white/5 z-20">
                {isShowcase ? (
                    <button
                        onClick={() => setShowFlexModal(true)}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 border border-white/10 text-sm"
                    >
                        🏆 FLEX NGAY
                    </button>
                ) : (
                    <form onSubmit={handleSend} className="bg-[#1e293b] rounded-lg flex items-center px-2 py-2 border border-white/5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-lg relative">

                        {/* PLUS MENU */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowPlusMenu(!showPlusMenu)}
                                className={`text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all ${showPlusMenu ? 'rotate-45 text-white bg-white/10' : ''}`}
                            >
                                <span className="text-xl leading-none mb-0.5">+</span>
                            </button>

                            {/* Popover Menu */}
                            {showPlusMenu && (
                                <div className="absolute bottom-12 left-0 w-64 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50 ring-1 ring-white/10">
                                    <div className="p-2 space-y-1">
                                        <button
                                            type="button"
                                            onClick={() => { setShowImageModal(true); setShowPlusMenu(false); }}
                                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg text-sm flex items-center gap-3 transition-colors"
                                        >
                                            <span className="text-lg">🖼️</span>
                                            <div>
                                                <div className="font-bold">Gửi Ảnh</div>
                                                <div className="text-[10px] text-gray-500">Paste link ảnh vào đây</div>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowCodeModal(true); setShowPlusMenu(false); }}
                                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg text-sm flex items-center gap-3 transition-colors"
                                        >
                                            <span className="text-lg">💻</span>
                                            <div>
                                                <div className="font-bold">Gửi Code</div>
                                                <div className="text-[10px] text-gray-500">Chia sẻ đoạn code đẹp</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-2"></div>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Nhắn #${channel.name}...`}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-500 font-medium h-9 text-sm"
                        />

                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center z-50
                                ${input.trim()
                                    ? 'text-indigo-400 hover:bg-white/10 cursor-pointer hover:scale-110 active:scale-95'
                                    : 'text-gray-600 cursor-not-allowed opacity-50'}
                            `}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>

            {/* Flex Modal (Simple Overlay) */}
            {showFlexModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e2124] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl relative">
                        <h3 className="text-2xl font-bold text-white mb-1">Flex Thành Tích 🏆</h3>
                        <button onClick={() => setShowFlexModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                        <p className="text-sm text-gray-400 mb-6">Chia sẻ thành tích nào anh em!</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tên Kênh / Chủ Đề</label>
                                <input
                                    value={flexData.topic} onChange={e => setFlexData({ ...flexData, topic: e.target.value })}
                                    placeholder="VD: MMO, AI, Vlog..."
                                    className="w-full bg-[#2f3136] border border-white/5 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Subscribers</label>
                                    <input
                                        type="number" value={flexData.subCount} onChange={e => setFlexData({ ...flexData, subCount: e.target.value })}
                                        placeholder="0"
                                        className="w-full bg-[#2f3136] border border-white/5 rounded-lg px-3 py-2 text-white font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">View 7 Ngày</label>
                                    <input
                                        type="number" value={flexData.viewCount} onChange={e => setFlexData({ ...flexData, viewCount: e.target.value })}
                                        placeholder="0"
                                        className="w-full bg-[#2f3136] border border-white/5 rounded-lg px-3 py-2 text-white font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Insight / Bài học rút ra</label>
                                <textarea
                                    value={input} onChange={e => setInput(e.target.value)}
                                    placeholder="Chia sẻ ngắn gọn cách bạn đạt được thành tích này..."
                                    className="w-full bg-[#2f3136] border border-white/5 rounded-lg px-3 py-2 text-white h-24 resize-none"
                                />
                            </div>

                            <button onClick={handleFlexSubmit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg mt-2">
                                ĐĂNG BÀI FLEX 🚀
                            </button>
                            <button onClick={() => setShowFlexModal(false)} className="w-full text-gray-500 text-sm py-2 hover:text-white">
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Code Modal */}
            {showCodeModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">💻 Gửi Code Snippet</h3>
                        <textarea
                            value={modalData}
                            onChange={e => setModalData(e.target.value)}
                            placeholder="Paste code vào đây..."
                            className="w-full h-48 bg-[#0f172a] border border-white/10 rounded-lg p-4 font-mono text-sm text-green-400 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={handleCodeSubmit} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-colors">Gửi Code</button>
                            <button onClick={() => setShowCodeModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors">Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">🖼️ Gửi Ảnh (URL)</h3>
                        <input
                            value={modalData}
                            onChange={e => setModalData(e.target.value)}
                            placeholder="https://example.com/image.png"
                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <p className="text-[10px] text-gray-500 mt-2">*Hỗ trợ link ảnh trực tiếp (jpg, png, gif)</p>
                        <div className="flex gap-3 mt-4">
                            <button onClick={handleImageSubmit} className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 rounded-lg transition-colors">Gửi Ảnh</button>
                            <button onClick={() => setShowImageModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors">Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
