import React from 'react';
import { motion } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
    onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-[#0f0f0f] border border-[#CDAD5A] w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(205,173,90,0.2)]"
            >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#CDAD5A] to-transparent" />

                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10">
                    <X size={20} className="text-gray-400" />
                </button>

                <div className="p-8 text-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#CDAD5A] opacity-10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#CDAD5A]/20 rounded-full flex items-center justify-center text-[#CDAD5A] mb-6 ring-1 ring-[#CDAD5A]/50">
                            <Lock size={32} />
                        </div>

                        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                            Unlock <span className="text-[#CDAD5A]">Pro Insights</span>
                        </h2>

                        <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm">
                            Bạn đang sử dụng gói miễn phí. Nâng cấp lên <strong className="text-white">PRO PLAN</strong> để mở khóa toàn bộ tính năng cao cấp này.
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full mb-8">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <div className="text-xl font-bold text-white mb-1">∞</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Unlimited Access</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <div className="text-xl font-bold text-white mb-1">100%</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Full Data</div>
                            </div>
                        </div>

                        <Link href="/pricing" className="w-full block">
                            <button className="w-full py-4 bg-[#CDAD5A] hover:bg-[#ffe18f] text-black font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_5px_20px_rgba(205,173,90,0.3)] hover:shadow-[0_10px_30px_rgba(205,173,90,0.4)] transform hover:-translate-y-1">
                                Upgrade to Pro Now
                            </button>
                        </Link>

                        <p className="mt-4 text-[10px] text-gray-600">
                            Secure payment via Stripe. Cancel anytime.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UpgradeModal;
