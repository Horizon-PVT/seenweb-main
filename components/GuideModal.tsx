import React from 'react';
import { motion } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';

interface GuideModalProps {
    onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#0f0f0f] border border-[#CDAD5A]/30 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="bg-[#1a1a1a] p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#CDAD5A]/20 rounded-lg text-[#CDAD5A]">
                            <Lightbulb size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Hướng dẫn sử dụng tool</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

                    {/* Section 1: Metrics */}
                    <div className="space-y-4">
                        <h3 className="text-[#CDAD5A] font-bold text-sm uppercase tracking-widest border-b border-[#CDAD5A]/20 pb-2">1. Chỉ số cốt lõi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="text-green-400 font-bold mb-1">Overall Score (0-100)</div>
                                <p className="text-xs text-gray-400">Điểm tổng hợp. <br /> <strong className="text-white">&gt; 70:</strong> Mỏ vàng (Làm ngay). <br /> <strong className="text-white">40-69:</strong> Trung bình. <br /> <strong className="text-white">&lt; 40:</strong> Khó ăn (Nên tránh).</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="text-blue-400 font-bold mb-1">Volume</div>
                                <p className="text-xs text-gray-400">Lượng người tìm kiếm trung bình mỗi tháng. Số càng to càng tốt, chứng tỏ nhu cầu cao.</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="text-red-400 font-bold mb-1">Competition</div>
                                <p className="text-xs text-gray-400">Độ cạnh tranh. <br /> <strong>Low (Thấp):</strong> Ít đối thủ, dễ lên Top. <br /> <strong>High (Cao):</strong> "Đất chật người đông".</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Strategy */}
                    <div className="space-y-4">
                        <h3 className="text-[#CDAD5A] font-bold text-sm uppercase tracking-widest border-b border-[#CDAD5A]/20 pb-2">2. Chiến thuật chọn từ khóa</h3>

                        <div className="space-y-3">
                            <div className="flex gap-4 items-start">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-xs shrink-0">A</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Với kênh mới (Newbie)</h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Hãy săn những từ khóa có: <strong className="text-green-400">Volume Trung Bình</strong> + <strong className="text-green-400">Competition Thấp</strong>.
                                        Đây là các ngách nhỏ (Niche) dễ kiếm view nhất.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-xs shrink-0">B</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Với kênh lớn</h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Đánh công trực diện vào các từ khóa <strong className="text-orange-400">Volume Cao</strong>. Chấp nhận cạnh tranh cao để lấy lượng traffic khủng.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#1a1a1a] p-4 text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-[#CDAD5A] text-black font-bold rounded-lg hover:bg-[#ffe18f] transition-colors"
                    >
                        Đã Hiểu
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default GuideModal;
