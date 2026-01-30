import React, { useState, useRef, useEffect } from 'react';
import {
    Play, Pause, Square, RotateCcw, Save, Download, Upload, List, Trash2, Settings, StopCircle, Info, ChevronRight, CheckCircle, AlertCircle, Clock, FileText, Plus, Database, Globe, ExternalLink, Image, Video, Sparkles, Layers, X, HelpCircle, Coffee
} from 'lucide-react';

type GenerationMode = 'text-to-video' | 'image-to-video' | 'components' | 'image-gen';
type QueueItemStatus = 'pending' | 'processing' | 'done' | 'failed';

interface QueueItem {
    id: string;
    prompt: string;
    status: QueueItemStatus;
    images?: string[];
    referenceImages?: string[];
    error?: string;
}

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'control' | 'queue' | 'settings' | 'help'>('control');
    const [showCoffeeModal, setShowCoffeeModal] = useState(false);

    // Global State
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [mode, setMode] = useState<GenerationMode>('text-to-video');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const listener = (message: any) => {
            if (message.action === 'updateStatus') {
                setQueue(prev => {
                    const newQueue = [...prev];
                    const item = newQueue[message.index];
                    if (item) {
                        const statusMap: Record<string, QueueItemStatus> = {
                            'processing': 'processing',
                            'waiting': 'processing',
                            'completed': 'done',
                            'error': 'failed',
                            'stopped': 'pending'
                        };
                        item.status = statusMap[message.status] || 'processing';
                    }
                    return newQueue;
                });
            } else if (message.action === 'batchCompleted') {
                setIsProcessing(false);
                alert('Đã hoàn thành tất cả tác vụ!');
            }
        };
        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);

    return (
        <div className="flex flex-col h-screen text-gray-800 bg-white font-sans">
            <header className="p-4 border-b-2 border-red-500 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <img src="../../icons/kodaflow_logo.jpg" alt="Kodaflow" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                    <div>
                        <h1 className="text-base font-bold tracking-tight text-gray-900 leading-none">KODAFLOW</h1>
                        <p className="text-[10px] text-gray-500 mt-0.5">Veo Automation Pro</p>
                    </div>
                </div>
                <button onClick={() => setShowCoffeeModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-full text-amber-700 text-xs font-semibold transition-all">
                    <Coffee size={14} /> Mời cà phê
                </button>
            </header>

            {showCoffeeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
                        <button onClick={() => setShowCoffeeModal(false)} className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-500" /></button>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Mời tôi ly cà phê ☕</h3>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
                                <img src="../../icons/qr_bank.jpg" alt="QR Bank" className="w-full max-w-[200px] mx-auto rounded-lg shadow-md" />
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-left">
                                <p className="text-xs text-gray-600 mb-1"><strong>Chủ TK:</strong> Pham Van Tung</p>
                                <p className="text-xs text-gray-600 mb-1"><strong>STK:</strong> 8837301927</p>
                                <p className="text-xs text-gray-600"><strong>Ngân hàng:</strong> BIDV</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex border-b border-gray-200 bg-gray-50">
                {[{ id: 'control', label: 'Điều Khiển', icon: Play }, { id: 'queue', label: 'Hàng Chờ', icon: List }, { id: 'settings', label: 'Cài Đặt', icon: Settings }, { id: 'help', label: 'Hướng Dẫn', icon: HelpCircle }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-1 transition-all border-b-2 ${activeTab === tab.id ? 'text-red-600 border-red-500 bg-white' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'}`}>
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </nav>

            <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'control' && <ControlTab mode={mode} setMode={setMode} queue={queue} setQueue={setQueue} isProcessing={isProcessing} setIsProcessing={setIsProcessing} />}
                {activeTab === 'queue' && <QueueTab queue={queue} setQueue={setQueue} />}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'help' && <HelpTab />}
            </main>

            <footer className="p-3 border-t-2 border-red-500 bg-white flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span>Ready v4.0 (Merged)</span></div>
                <div className="font-semibold">{queue.filter((q: any) => q.status === 'done').length}/{queue.length} Done</div>
            </footer>
        </div>
    );
};

const ControlTab = ({ mode, setMode, queue, setQueue, isProcessing, setIsProcessing }: any) => {
    const [prompts, setPrompts] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [referenceImages, setReferenceImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleImportTxt = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setPrompts(event.target?.result as string);
            reader.readAsText(file);
        }
    };
    const handleAddToQueue = () => {
        const promptList = prompts.split(/---|(?:\r?\n){2,}/).map(p => p.trim()).filter(p => p.length > 0);
        if (promptList.length === 0) return alert('Nhập ít nhất 1 prompt');
        const newItems: QueueItem[] = promptList.map((prompt, i) => ({
            id: `${Date.now()}-${i}`,
            prompt: prompt.trim(),
            status: 'pending',
            images: mode !== 'text-to-video' ? [...images] : undefined,
            referenceImages: mode === 'components' ? [...referenceImages] : undefined
        }));
        setQueue((prev: any) => [...prev, ...newItems]);
        setPrompts('');
        alert(`Đã thêm ${newItems.length} tác vụ!`);
    };
    const handleOpenFlow = () => {
        chrome.tabs.create({ url: 'https://labs.google/fx/vi/tools/flow' }, (tab) => {
            setTimeout(() => {
                if (tab.windowId) chrome.sidePanel.open({ windowId: tab.windowId });
            }, 1000);
        });
    };

    const handleStart = async () => {
        // AUTO-ADD: If queue is empty but user has text in input, add it automatically
        let currentQueue = [...queue];
        if (currentQueue.length === 0) {
            const promptList = prompts.split(/---|(?:\r?\n){2,}/).map(p => p.trim()).filter(p => p.length > 0);
            if (promptList.length > 0) {
                const newItems: QueueItem[] = promptList.map((prompt, i) => ({
                    id: `${Date.now()}-${i}`,
                    prompt: prompt.trim(),
                    status: 'pending',
                    images: mode !== 'text-to-video' ? [...images] : undefined,
                    referenceImages: mode === 'components' ? [...referenceImages] : undefined
                }));
                currentQueue = newItems;
                setQueue(newItems); // Sync state
                setPrompts(''); // Clear input
                // Allow a small delay for state update if needed, but we use local variable 'currentQueue'
            } else {
                return alert('Vui lòng nhập prompt hoặc thêm vào hàng chờ!');
            }
        }

        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (!activeTab?.id) return alert('Không tìm thấy tab đang mở!');

        const isVeo = activeTab.url?.includes('labs.google');
        const isMeta = activeTab.url?.includes('meta.ai');

        if (!isVeo && !isMeta) {
            const tabs = await chrome.tabs.query({ url: ['*://labs.google/*', '*://www.meta.ai/*'] });
            if (tabs.length > 0) {
                if (confirm('Tab hiện tại không phải Veo/Meta. Chuyển sang tab phù hợp tìm thấy?')) {
                    await chrome.tabs.update(tabs[0].id!, { active: true });
                    setTimeout(() => handleStart(), 1000);
                }
                return;
            }
            return alert('Vui lòng mở trang Google Veo hoặc Meta AI trước khi bắt đầu!');
        }

        setIsProcessing(true);
        try {
            const sendMessage = async () => {
                await chrome.tabs.sendMessage(activeTab.id!, {
                    type: 'START_AUTOMATION',
                    mode: mode,
                    queue: currentQueue, // Use local variable
                    config: { minDelay: 30000, maxDelay: 60000, autoDownload: false }
                });
            };
            try {
                await sendMessage();
            } catch (firstError) {
                await chrome.scripting.executeScript({ target: { tabId: activeTab.id! }, files: ['assets/content.js'] });
                await new Promise(r => setTimeout(r, 500));
                await sendMessage();
            }
        } catch (error) {
            alert('Lỗi: ' + (error as any).message);
            setIsProcessing(false);
        }
    };
    const handleStop = () => { setIsProcessing(false); (chrome as any).runtime.sendMessage({ type: 'STOP_AUTOMATION' }); };

    return (
        <div className="space-y-5">
            <section className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                    <Sparkles size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-xs font-bold text-blue-700 uppercase mb-1">Hướng Dẫn Sử Dụng</h3>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            Vui lòng <strong>chọn chế độ trên Google Flow</strong> trước. Extension sẽ tự chạy theo cài đặt đó.
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-2">
                <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2"><FileText size={14} className="text-red-500" /> Danh Sách Prompt</h2><button onClick={handleImportTxt} className="text-xs bg-white px-3 py-1.5 rounded-lg border-2 border-gray-200 font-semibold flex items-center gap-1"><Download size={12} /> Import .txt</button><input type="file" ref={fileInputRef} className="hidden" accept=".txt" onChange={handleFileChange} /></div>
                <div className="relative"><textarea value={prompts} onChange={(e) => setPrompts(e.target.value)} placeholder="Nhập prompt...&#10;Cách nhau bằng dòng trống hoặc ---" className="w-full h-32 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-red-500 focus:outline-none" /><div className="absolute bottom-2 right-2 text-[10px] bg-white px-2 py-0.5 rounded border">{prompts.split(/---|(?:\r?\n){2,}/).filter(p => p.trim() !== '').length} prompt</div></div>
                <button onClick={handleAddToQueue} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 font-bold border-2 border-gray-200 rounded-xl text-sm flex items-center justify-center gap-2"><Plus size={16} /> Thêm vào Hàng Chờ</button>
            </section>

            <section className="grid grid-cols-2 gap-3">
                <div className="col-span-2 grid grid-cols-2 gap-3">
                    <button onClick={handleOpenFlow} className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 rounded-xl font-bold border-0 shadow-md text-xs transition-all uppercase tracking-wide">
                        <RotateCcw size={16} /> Google Veo
                    </button>
                    <button disabled className="flex items-center justify-center gap-2 py-3 bg-gray-300 text-gray-500 cursor-not-allowed rounded-xl font-bold border-0 shadow-none text-xs transition-all uppercase tracking-wide opacity-70">
                        <Globe size={16} /> Meta AI (Dev)
                    </button>
                </div>
                <button onClick={handleStart} disabled={isProcessing || queue.length === 0} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold border-2 text-sm transition-all ${isProcessing ? 'bg-gray-100 text-gray-400' : 'bg-red-500 text-white border-red-500 hover:bg-red-600'}`}><Play size={18} /> Bắt Đầu</button>
                <button onClick={handleStop} className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-bold border-2 border-gray-300 text-sm"><StopCircle size={18} /> Dừng</button>
            </section>

            <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-700">Hệ Sinh Thái SeenYT</span>
                    </div>
                    <div className="space-y-3">
                        <a href="https://chromewebstore.google.com/detail/seenyt-youtube-seo-ai-gro/ajjimohhpmkhgagldoegomjobgpkffdc" target="_blank" className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group no-underline">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><Video size={16} /></div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">Extension YouTube SEO</h4>
                                    <p className="text-[10px] text-gray-500">Tối ưu từ khóa & SEO Video AI</p>
                                </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-300 group-hover:text-indigo-500" />
                        </a>

                        <a href="https://www.seenyt.net/" target="_blank" className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group no-underline">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Globe size={16} /></div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">SeenYT.net</h4>
                                    <p className="text-[10px] text-gray-500">Trang chủ & Công cụ</p>
                                </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-300 group-hover:text-indigo-500" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QueueTab = ({ queue, setQueue }: any) => {
    const getStatusIcon = (status: QueueItemStatus) => {
        switch (status) {
            case 'done': return <CheckCircle size={14} className="text-green-500" />;
            case 'processing': return <Clock size={14} className="text-yellow-500 animate-spin" />;
            case 'failed': return <AlertCircle size={14} className="text-red-500" />;
            default: return <Clock size={14} className="text-gray-400" />;
        }
    };
    const clearCompleted = () => setQueue((prev: any[]) => prev.filter(q => q.status !== 'done'));
    const clearAll = () => confirm('Xóa hết?') && setQueue([]);
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2"><List size={14} className="text-red-500" /> Quản Lý Hàng Chờ</h2><div className="flex gap-2"><button onClick={clearCompleted} className="text-xs bg-white px-2 py-1 rounded-lg border-2 border-gray-200 font-semibold">Xóa đã xong</button><button onClick={clearAll} className="text-xs bg-red-50 px-2 py-1 rounded-lg border-2 border-red-200 text-red-600 font-semibold">Xóa hết</button></div></div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {queue.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">Trống rỗng...</div> : queue.map((item: QueueItem, index: number) => (
                    <div key={item.id} className={`p-3 rounded-xl border-2 transition-all ${item.status === 'processing' ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-start gap-2"><div className="mt-0.5">{getStatusIcon(item.status)}</div><div className="flex-1 min-w-0"><div className="text-xs text-gray-500 mb-0.5 font-medium">#{index + 1} • {item.status.toUpperCase()}</div><div className="text-sm text-gray-700 line-clamp-2">{item.prompt}</div>{item.status === 'failed' && item.error && <div className="text-xs text-red-500 mt-1 font-semibold">❌ Lỗi: {item.error}</div>}</div></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsTab = () => {
    const [aspectRatio, setAspectRatio] = useState('16:9');
    return (
        <div className="space-y-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Settings size={14} className="text-red-500" />
                Cài Đặt Tự Động Hóa
            </h2>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Mô Hình Video</label>
                    <select className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 font-medium">
                        <option>Veo 3.1 - Nhanh</option>
                        <option>Veo 3.1 - Chất lượng cao</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Tỷ Lệ Khung Hình</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['16:9', '9:16', '1:1'].map(r => (
                            <button key={r} onClick={() => setAspectRatio(r)} className={`py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${aspectRatio === r ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex justify-between">Thời Gian Chờ Giữa Các Video<span className="text-red-500">30s - 60s</span></label>
                    <div className="flex gap-3">
                        <input type="number" placeholder="Tối thiểu" defaultValue={30} className="w-1/2 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 font-medium" />
                        <input type="number" placeholder="Tối đa" defaultValue={60} className="w-1/2 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 font-medium" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const HelpTab = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle size={14} className="text-red-500" />
                Hướng Dẫn Sử Dụng
            </h2>
            <div className="space-y-3">
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl"><h3 className="text-sm font-bold text-gray-700 mb-2">📝 Định Dạng Prompt</h3><p className="text-xs text-gray-600">Cách nhau bằng dòng trống hoặc ---</p></div>
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl"><h3 className="text-sm font-bold text-gray-700 mb-2">📁 Nhập File .txt</h3><p className="text-xs text-gray-600">Hỗ trợ file text đơn giản.</p></div>
            </div>
        </div>
    );
};

export default App;
