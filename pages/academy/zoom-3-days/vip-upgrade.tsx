import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Crown, CheckCircle2, ArrowRight, Users, Play, ShieldCheck, Zap, BookOpen, List } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function VipUpgradeLanding() {
    const { data: session } = useSession();
    const [checkoutEmail, setCheckoutEmail] = useState('');
    const [loadingCheckout, setLoadingCheckout] = useState(false);

    React.useEffect(() => {
        if (session?.user?.email && !checkoutEmail) {
            setCheckoutEmail(session.user.email);
        }
    }, [session, checkoutEmail]);

    const handleCheckoutVip = async () => {
        if (!checkoutEmail || !checkoutEmail.includes("@")) {
            alert("Vui lòng nhập email hợp lệ!");
            return;
        }
        setLoadingCheckout(true);
        try {
            const res = await fetch("/api/payment/create-payos-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: checkoutEmail,
                    amount: 499000,
                    plan: "ZOOM_VIP_TICKET",
                    role: "VIP_ZOOM",
                    note: "Mua Vé VIP Zoom 3 Ngày",
                }),
            });
            const data = await res.json();
            if (data.success && data.data.paymentUrl) {
                window.location.href = data.data.paymentUrl;
            } else {
                alert("Lỗi tạo thanh toán: " + data.error);
            }
        } catch (err) {
            alert("Lỗi kết nối server.");
        }
        setLoadingCheckout(false);
    };

    return (
        <>
            <Head>
                <title>Đăng Ký Thành Công! Nâng Cấp VIP - Học Viện SeenYT</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <main className="bg-[#050505] min-h-screen font-sans text-gray-200 py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Ambience */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-600/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-4xl w-full mx-auto relative z-10 box-border">

                    {/* Success Banner */}
                    <div className="text-center mb-12 animate-fade-in-up">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                            Tuyệt Vời! Bạn Đã Giữ Chỗ <span className="text-red-500">Thành Công</span>.
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Nhưng chờ đã... Trước khi rời đi, hãy xem qua ưu đãi ĐỘC QUYỀN chỉ xuất hiện 1 lần duy nhất này!
                        </p>
                    </div>

                    <div className="bg-[#111] border border-red-500/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.15)] relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                        <div className="grid md:grid-cols-2">
                            {/* Left Side: Value Prop */}
                            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 relative z-10 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-6 border border-yellow-500/30 w-max">
                                    <Crown className="w-4 h-4" /> Nâng Cấp Vé VIP
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
                                    Kích Hoạt Đặc Quyền VIP Để Về Đích <span className="text-amber-500">Nhanh Gấp 10 Lần</span>
                                </h2>

                                <p className="text-gray-300 font-medium mb-8 leading-relaxed">
                                    Vé VIP không chỉ là xem lại, mà là sở hữu <strong className="text-amber-500">trọn bộ Hệ thống vận hành YouTube AI độc quyền</strong> từ SeenYT để bạn bắt tay vào làm ngay tháng này.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start hover:translate-x-1 transition-transform">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1 border border-red-500/20">
                                            <Play className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">Record Buổi Học (Trọn Đời)</h3>
                                            <p className="text-sm text-gray-400">Xem lại bất cứ lúc nào trọn vẹn 3 ngày học. <span className="text-gray-500 line-through text-xs ml-1">Trị giá 990k</span></p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start hover:translate-x-1 transition-transform">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1 border border-purple-500/20">
                                            <Zap className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">100+ Prompt AI Độc Quyền</h3>
                                            <p className="text-sm text-gray-400">Copy & Paste sinh kịch bản triệu view ngay lập tức. <span className="text-gray-500 line-through text-xs ml-1">Trị giá 1tr</span></p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start hover:translate-x-1 transition-transform">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-1 border border-yellow-500/20">
                                            <BookOpen className="w-5 h-5 text-yellow-500" />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute -top-3 -right-12 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.5)]">LIMITED</span>
                                            <h3 className="text-lg font-bold text-white mb-1">Ebook: 10 Bí mật thành công với YouTube 2026</h3>
                                            <p className="text-sm text-gray-400">Phân tích thuật toán mới nhất và định hướng tư duy dài hạn.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start hover:translate-x-1 transition-transform">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1 border border-emerald-500/20">
                                            <List className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute -top-3 -right-8 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]">MỚI</span>
                                            <h3 className="text-lg font-bold text-white mb-1">Danh sách 20 ngách hái ra tiền Global</h3>
                                            <p className="text-sm text-gray-400">Cập nhật dữ liệu RPM tháng 3/2026, có thể bắt tay làm ngay tháng này.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start hover:translate-x-1 transition-transform">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-1 border border-blue-500/20">
                                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute -top-3 -right-8 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse">HOT</span>
                                            <h3 className="text-lg font-bold text-white mb-1">Audit Kênh Chuyên Sâu 1-1</h3>
                                            <p className="text-sm text-gray-400">Được đội ngũ của Mr. Seen trực tiếp soi lỗi và định hướng <span className="text-red-400 font-bold">(Số lượng giới hạn)</span>.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Checkout / Zalo CTA */}
                            <div className="p-8 md:p-12 relative z-10 flex flex-col justify-center bg-black/40">
                                <div className="mb-8">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-gray-400 font-medium">Giá Gói VIP</span>
                                        <div className="text-right">
                                            <span className="text-red-500 text-sm font-bold line-through mr-2">1.500.000đ</span>
                                            <span className="text-4xl font-black text-white">499k</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="w-[85%] h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full animate-pulse" />
                                    </div>
                                    <p className="text-[15px] text-red-600 font-black uppercase tracking-widest mt-4 text-right animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">Chỉ còn 15/100 suất VIP cuối cùng</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <label className="text-xs text-gray-400 font-bold ml-1 uppercase">Email Kích Hoạt VIP</label>
                                    <input
                                        type="email"
                                        value={checkoutEmail}
                                        onChange={(e) => setCheckoutEmail(e.target.value)}
                                        placeholder="Nhập email của bạn..."
                                        className="w-full bg-black border border-gray-800 text-white rounded-xl px-4 py-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder-gray-600"
                                    />

                                    <button
                                        onClick={handleCheckoutVip}
                                        disabled={loadingCheckout}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-yellow-500 text-black font-black text-lg py-5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wide"
                                    >
                                        {loadingCheckout ? 'Đang Xử Lý...' : 'Nâng Cấp VIP Ngay (499k)'}
                                    </button>
                                </div>

                                <div className="relative flex py-5 items-center">
                                    <div className="flex-grow border-t border-gray-800"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">HOẶC</span>
                                    <div className="flex-grow border-t border-gray-800"></div>
                                </div>

                                <div className="text-center">
                                    <p className="text-gray-400 text-sm mb-4">Tham gia nhóm Zalo miễn phí để nhận thông báo lịch học.</p>
                                    <Link
                                        href="https://zalo.me/g/kqshmg192"
                                        target="_blank"
                                        className="w-full bg-[#0068FF]/10 text-[#0068FF] hover:bg-[#0068FF]/20 border border-[#0068FF]/30 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Users className="w-5 h-5" /> Vào Nhóm Zalo Nhận Tài Liệu
                                    </Link>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}
