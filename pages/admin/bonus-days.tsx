// pages/admin/bonus-days.tsx - Admin page to give bonus days to users
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminAuth } from '@/lib/admin/auth';
import { Gift, Search, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminBonusDays({ session }: any) {
    const [email, setEmail] = useState('');
    const [bonusDays, setBonusDays] = useState(15);
    const [note, setNote] = useState('Share Facebook');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !bonusDays) {
            alert('Vui lòng nhập email và số ngày');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/admin/apply-bonus-days', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, bonusDays, note })
            });

            const data = await res.json();

            if (res.ok) {
                setResult({ success: true, message: data.message });
                setEmail('');
            } else {
                setResult({ success: false, message: data.error });
            }
        } catch (error: any) {
            setResult({ success: false, message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { days: 7, label: '7 ngày', color: 'bg-blue-600' },
        { days: 15, label: '15 ngày', color: 'bg-green-600' },
        { days: 30, label: '30 ngày', color: 'bg-purple-600' },
    ];

    return (
        <AdminLayout session={session}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Gift className="w-8 h-8 text-[#CDAD5A]" />
                    <h2 className="text-3xl font-bold text-white">Tặng Bonus Days</h2>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email người dùng *
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                                />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Chọn nhanh
                            </label>
                            <div className="flex gap-3">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.days}
                                        type="button"
                                        onClick={() => setBonusDays(action.days)}
                                        className={`flex-1 py-3 rounded-lg font-medium transition ${bonusDays === action.days
                                                ? `${action.color} text-white`
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        +{action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Days */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Số ngày tặng *
                            </label>
                            <input
                                type="number"
                                required
                                min={1}
                                max={365}
                                value={bonusDays}
                                onChange={(e) => setBonusDays(parseInt(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                            />
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Ghi chú (lý do)
                            </label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="VD: Share Facebook, Bug compensation..."
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                            />
                        </div>

                        {/* Result Message */}
                        {result && (
                            <div className={`p-4 rounded-lg flex items-center gap-3 ${result.success
                                    ? 'bg-green-900/30 border border-green-600/30'
                                    : 'bg-red-900/30 border border-red-600/30'
                                }`}>
                                {result.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                )}
                                <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                                    {result.message}
                                </span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#CDAD5A] to-orange-500 text-black font-bold py-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>Đang xử lý...</>
                            ) : (
                                <>
                                    <Gift className="w-5 h-5" />
                                    Tặng {bonusDays} ngày cho {email || 'user'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Instructions */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                    <h4 className="font-medium text-gray-300 mb-2">📌 Hướng dẫn:</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Nhập email của user đã đăng ký trên hệ thống</li>
                        <li>• Nếu user đang FREE, sẽ tự động upgrade lên STARTER</li>
                        <li>• Số ngày sẽ được cộng thêm vào ngày hết hạn hiện tại</li>
                        <li>• Nếu user chưa có gói, sẽ bắt đầu từ hôm nay</li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => requireAdminAuth(context);
