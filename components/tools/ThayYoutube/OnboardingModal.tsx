import React, { useState } from "react";

interface TopicAnalysis {
    isViable: boolean;
    viabilityScore: number;
    topicSummary: string;
    winningAngles: string[];
    targetAudience: string;
    competitionLevel: string;
    warnings: string[];
    recommendation: string;
    suggestedNiche: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const OnboardingModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        channelType: "", // "face" or "faceless"
        targetMarket: "", // "vn" or "global"
        channelTopic: "",
        channelGoal: "",
        availableTime: "2h",
        contentMix: "Mix",
        timezone: "UTC+7",
        postingTime: "19:00"
    });
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis | null>(null);

    // Loading messages sequence
    const loadingMessages = [
        "📋 Đang tạo giáo án Ngày 0-5...",
        "📅 Đang thiết kế lộ trình tuần 1...",
        "📝 Đang soạn giáo án tuần 2...",
        "✨ Đang hoàn thiện nội dung 30 ngày...",
        "✅ Đang lưu giáo án của em..."
    ];

    if (!isOpen) return null;

    // Analyze topic when moving to step 3
    const handleAnalyzeTopic = async () => {
        setStep(3);
        setIsAnalyzing(true);
        setTopicAnalysis(null);

        try {
            const res = await fetch("/api/tools/thay-youtube/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: formData.channelTopic,
                    goal: formData.channelGoal,
                    targetMarket: formData.targetMarket,
                    channelType: formData.channelType
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setTopicAnalysis(data);
            } else {
                // Fallback analysis
                setTopicAnalysis({
                    isViable: true,
                    viabilityScore: 7,
                    topicSummary: `Chủ đề "${formData.channelTopic}" có tiềm năng phát triển.`,
                    winningAngles: ["Tập trung vào nội dung chất lượng", "Xây dựng thương hiệu cá nhân"],
                    targetAudience: "Khán giả quan tâm đến chủ đề này",
                    competitionLevel: "trung bình",
                    warnings: [],
                    recommendation: "Bắt đầu với những video ngắn để test thị trường.",
                    suggestedNiche: formData.channelTopic
                });
            }
        } catch (e) {
            console.error(e);
            setTopicAnalysis({
                isViable: true,
                viabilityScore: 6,
                topicSummary: `Không thể phân tích chi tiết. Tiếp tục với chủ đề "${formData.channelTopic}".`,
                winningAngles: ["Tập trung vào nội dung gây gắn với khán giả"],
                targetAudience: "Cần nghiên cứu thêm",
                competitionLevel: "trung bình",
                warnings: ["Không thể kết nối AI. Hãy tiến hành thận trọng."],
                recommendation: "Bắt đầu với nội dung đơn giản và quan sát phản hồi.",
                suggestedNiche: formData.channelTopic
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingMessage(loadingMessages[0]);

        // Animate through loading messages
        const messageInterval = setInterval(() => {
            setLoadingProgress(prev => {
                const newProgress = Math.min(prev + 15, 90);
                const messageIndex = Math.floor(newProgress / 16);
                if (messageIndex < loadingMessages.length) {
                    setLoadingMessage(loadingMessages[messageIndex]);
                }
                return newProgress;
            });
        }, 2500);

        try {
            const res = await fetch("/api/tools/thay-youtube/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            clearInterval(messageInterval);
            setLoadingProgress(100);
            setLoadingMessage("✅ Hoàn thành! Đang chuyển trang...");

            if (res.ok) {
                setTimeout(() => onSuccess(), 500);
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.message || "Có lỗi xảy ra khi tạo giáo án. Vui lòng thử lại.");
                setIsLoading(false);
            }
        } catch (e) {
            clearInterval(messageInterval);
            console.error(e);
            alert("Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-800 w-full absolute top-0">
                    <div
                        className="h-full bg-yellow-500 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-1 text-white">Thẩm định kênh: Bước {step}/3</h2>
                    <p className="text-gray-400 text-sm mb-6">Để Thầy lên giáo án chuẩn nhất cho em.</p>

                    {step === 1 && (
                        <div className="space-y-5">
                            {/* Channel Type Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3">Em muốn làm YouTube theo hướng nào?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, channelType: "face" })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.channelType === "face"
                                            ? 'border-yellow-500 bg-yellow-500/10'
                                            : 'border-white/10 bg-black/30 hover:border-white/30'}`}
                                    >
                                        <div className="text-3xl mb-2">🎬</div>
                                        <p className="font-bold text-white">Lộ mặt</p>
                                        <p className="text-xs text-gray-400 mt-1">Quay video với khuôn mặt, xây dựng thương hiệu cá nhân</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, channelType: "faceless" })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.channelType === "faceless"
                                            ? 'border-yellow-500 bg-yellow-500/10'
                                            : 'border-white/10 bg-black/30 hover:border-white/30'}`}
                                    >
                                        <div className="text-3xl mb-2">🤖</div>
                                        <p className="font-bold text-white">Không lộ mặt</p>
                                        <p className="text-xs text-gray-400 mt-1">Video AI, slideshow, voice-over - đang trend mạnh!</p>
                                    </button>
                                </div>
                            </div>

                            {/* Target Market Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3">Thị trường mục tiêu?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, targetMarket: "vn" })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.targetMarket === "vn"
                                            ? 'border-yellow-500 bg-yellow-500/10'
                                            : 'border-white/10 bg-black/30 hover:border-white/30'}`}
                                    >
                                        <div className="text-3xl mb-2">🇻🇳</div>
                                        <p className="font-bold text-white">View Việt</p>
                                        <p className="text-xs text-gray-400 mt-1">Nội dung tiếng Việt, khán giả Việt Nam</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, targetMarket: "global" })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.targetMarket === "global"
                                            ? 'border-yellow-500 bg-yellow-500/10'
                                            : 'border-white/10 bg-black/30 hover:border-white/30'}`}
                                    >
                                        <div className="text-3xl mb-2">🌏</div>
                                        <p className="font-bold text-white">View Ngoại</p>
                                        <p className="text-xs text-gray-400 mt-1">Nội dung tiếng Anh, khán giả quốc tế (CPM cao!)</p>
                                    </button>
                                </div>
                            </div>

                            {/* Topic Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Chủ đề kênh của em là gì?</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none"
                                    placeholder={formData.channelType === "faceless"
                                        ? "VD: Kiến thức AI, Tâm linh, Lịch sử bí ẩn..."
                                        : "VD: Review công nghệ, Vlog đời sống, Gaming..."}
                                    value={formData.channelTopic}
                                    onChange={e => setFormData({ ...formData, channelTopic: e.target.value })}
                                />
                            </div>

                            {/* Goal Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Mục tiêu 30 ngày tới?</label>
                                <select
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none"
                                    value={formData.channelGoal}
                                    onChange={e => setFormData({ ...formData, channelGoal: e.target.value })}
                                >
                                    <option value="">Chọn mục tiêu...</option>
                                    <option value="1000_subs">Đạt 1,000 Subscribers</option>
                                    <option value="monetization">Bật kiếm tiền (4000h xem)</option>
                                    <option value="branding">Xây dựng thương hiệu cá nhân</option>
                                    <option value="sales">Bán hàng / Affiliate</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Thời gian rảnh mỗi ngày?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["1h", "2h", "4h+"].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setFormData({ ...formData, availableTime: opt })}
                                            className={`py-2 rounded-lg border ${formData.availableTime === opt ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' : 'border-white/10 bg-black/30 text-gray-400'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Định hướng nội dung?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Shorts", "Long", "Mix"].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setFormData({ ...formData, contentMix: opt })}
                                            className={`py-2 rounded-lg border ${formData.contentMix === opt ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' : 'border-white/10 bg-black/30 text-gray-400'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-4">
                            {isAnalyzing ? (
                                /* Analyzing State */
                                <div className="text-center space-y-4">
                                    <div className="text-5xl animate-pulse">🔍</div>
                                    <h3 className="text-xl font-bold text-white">Đang phân tích chủ đề...</h3>
                                    <p className="text-gray-400 text-sm">Thầy đang nghiên cứu tiềm năng của "{formData.channelTopic}"</p>
                                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                        <div className="bg-yellow-500 h-full animate-pulse" style={{ width: '60%' }} />
                                    </div>
                                </div>
                            ) : isLoading ? (
                                /* Creating Roadmap State */
                                <div className="text-center space-y-6">
                                    <div className="text-5xl animate-bounce">🤖</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Thầy đang soạn giáo án...</h3>
                                        <p className="text-yellow-400 font-medium">{loadingMessage}</p>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full transition-all duration-500 ease-out"
                                            style={{ width: `${loadingProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        ⏱️ Quá trình này mất khoảng 3-5 phút vì Thầy đang soạn giáo án kỹ lưỡng cho em.
                                    </p>
                                </div>
                            ) : topicAnalysis ? (
                                /* Analysis Results - Full Content Layout */
                                <div className="space-y-3 text-left max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600">
                                    {/* Header with Score */}
                                    <div className={`p-4 rounded-lg border flex items-center justify-between ${topicAnalysis.isViable ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                        <div className="flex-1 pr-4">
                                            <span className={`text-sm font-bold ${topicAnalysis.isViable ? 'text-green-400' : 'text-red-400'}`}>
                                                {topicAnalysis.isViable ? '✓ CHỦ ĐỀ KHẢ THI' : '⚠️ CẦN XEM XÉT'}
                                            </span>
                                            <p className="text-gray-400 text-sm mt-1">{topicAnalysis.topicSummary}</p>
                                        </div>
                                        <div className="text-center shrink-0">
                                            <span className="text-4xl font-bold text-white">{topicAnalysis.viabilityScore}</span>
                                            <span className="text-gray-500 text-lg">/10</span>
                                        </div>
                                    </div>

                                    {/* Winning Angles */}
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                                        <p className="text-blue-400 text-sm font-bold mb-2">🎯 Góc Nhìn Chiến Thắng</p>
                                        <ul className="space-y-2">
                                            {topicAnalysis.winningAngles.map((angle, idx) => (
                                                <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-blue-400 shrink-0">•</span>
                                                    <span>{angle}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Target Audience & Competition - Side by side */}
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="col-span-3 bg-white/5 p-4 rounded-lg">
                                            <p className="text-gray-500 text-xs mb-2">👥 Đối tượng mục tiêu</p>
                                            <p className="text-white text-sm">{topicAnalysis.targetAudience}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-lg text-center flex flex-col justify-center">
                                            <p className="text-gray-500 text-xs mb-1">⚔️ Cạnh tranh</p>
                                            <p className={`text-xl font-bold ${topicAnalysis.competitionLevel === 'thấp' ? 'text-green-400' :
                                                topicAnalysis.competitionLevel === 'trung bình' ? 'text-yellow-400' : 'text-red-400'
                                                }`}>{topicAnalysis.competitionLevel.toUpperCase()}</p>
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    {topicAnalysis.warnings.length > 0 && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                                            <p className="text-yellow-400 text-sm font-bold mb-2">⚠️ Lưu ý quan trọng</p>
                                            <ul className="space-y-1">
                                                {topicAnalysis.warnings.map((w, idx) => (
                                                    <li key={idx} className="text-gray-300 text-sm">• {w}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Recommendation */}
                                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4 rounded-lg">
                                        <p className="text-purple-400 text-sm font-bold mb-2">💡 Khuyến nghị từ Thầy</p>
                                        <p className="text-gray-200 text-sm">{topicAnalysis.recommendation}</p>
                                        {topicAnalysis.suggestedNiche && topicAnalysis.suggestedNiche !== formData.channelTopic && (
                                            <div className="mt-3 bg-yellow-500/20 rounded px-3 py-2 inline-block">
                                                <span className="text-yellow-400 text-sm">📌 Ngách đề xuất: <strong>{topicAnalysis.suggestedNiche}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="mt-8 flex justify-between">
                        {step > 1 && !isLoading && !isAnalyzing && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="text-gray-400 hover:text-white px-4 pt-2"
                            >
                                Quay lại
                            </button>
                        )}
                        <div className="flex-1"></div>
                        {step === 1 && (
                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.channelType || !formData.targetMarket || !formData.channelTopic || !formData.channelGoal}
                                className="bg-white text-black font-bold px-6 py-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
                            >
                                Tiếp tục
                            </button>
                        )}
                        {step === 2 && (
                            <button
                                onClick={handleAnalyzeTopic}
                                className="bg-white text-black font-bold px-6 py-2 rounded-full hover:bg-gray-200"
                            >
                                Phân tích chủ đề
                            </button>
                        )}
                        {step === 3 && topicAnalysis && !isLoading && !isAnalyzing && (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-400 disabled:opacity-50 shadow-lg shadow-yellow-500/20 w-full"
                            >
                                TÔI CAM KẾT HỌC 30 NGÀY
                            </button>
                        )}
                    </div>
                </div>

                {/* Close Button */}
                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default OnboardingModal;
