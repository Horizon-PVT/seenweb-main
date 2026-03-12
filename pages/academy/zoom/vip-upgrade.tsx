import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Crown, CheckCircle2, ArrowRight, Users, Play, ShieldCheck, Zap, BookOpen, List } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function VipUpgradeLanding() {
    const { data: session } = useSession();
    const [checkoutEmail, setCheckoutEmail] = useState('');
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'VIP' | 'COMBO'>('COMBO'); // Default to combined offering

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
        
        const amount = selectedPlan === 'COMBO' ? 849000 : 499000;
        const planCode = selectedPlan === 'COMBO' ? "ZOOM_VIP_COMBO" : "ZOOM_VIP_TICKET";
        const roleStr = selectedPlan === 'COMBO' ? "VIP_COMBO" : "VIP_ZOOM";
        const noteStr = selectedPlan === 'COMBO' ? "Mua Vé VIP Zoom 5 Buổi + 2 Tháng Tool AI" : "Mua Vé VIP Zoom 5 Buổi";

        try {
            const res = await fetch("/api/payment/create-payos-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: checkoutEmail,
                    amount: amount,
                    plan: planCode,
                    role: roleStr,
                    note: noteStr,
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
                            Nhưng khoan đã... 10 suất Miễn Phí đã được đăng ký hết cách đây ít phút. Tuy nhiên, vì bạn đã tham gia điền form, chúng tôi dành tặng bạn 1 trong 40 suất còn lại với mức giá ưu đãi cực sốc!
                    </div>

                    <div className="bg-[#111] border border-red-500/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.15)] relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                        <div className="grid md:grid-cols-2">
                            {/* Left Side: Value Prop */}
                            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 relative z-10 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-6 border border-yellow-500/30 w-max">
                                    <Crown className="w-4 h-4" /> Nâng Cấp Vé VIP
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
                                    KÍCH HOẠT ĐẶC QUYỀN VIP - SỞ HỮU TRỌN BỘ <span className="text-[#FFD700]">BẢO BỐI THỰC CHIẾN</span>
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
                                            <p className="text-sm text-gray-400">Xem lại bất cứ lúc nào trọn vẹn 5 buổi học. <span className="text-gray-500 line-through text-xs ml-1">Trị giá 990k</span></p>
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
                                    
                                    {/* Bonus cho gói 849k */}
                                    <div className="flex gap-4 items-start hover:translate-x-1 transition-transform mt-8 p-4 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-2xl relative">
                                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-black uppercase rounded-bl-lg rounded-tr-lg">Đặc quyền gọi COMBO</div>
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-1 border border-yellow-500/40">
                                            <Crown className="w-5 h-5 text-yellow-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-yellow-500 mb-1">+ 2 Tháng Đặc Quyền SeenYT Tool Full Tính Năng</h3>
                                            <p className="text-sm text-gray-300">Tự động hóa kịch bản, âm thanh và hệ thống phân tích AI mạnh mẽ nhất 2026. <span className="text-gray-500 line-through text-xs ml-1">Trị giá 2tr</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Checkout / Zalo CTA */}
                            <div className="p-8 md:p-12 relative z-10 flex flex-col justify-center bg-black/40">
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Chọn gói Nâng Cấp:</h3>
                                    
                                    <div className="space-y-4">
                                        {/* Option 1: 499k */}
                                        <div 
                                            onClick={() => setSelectedPlan('VIP')}
                                            className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all ${selectedPlan === 'VIP' ? 'bg-red-900/20 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'bg-black/50 border-gray-800 hover:border-gray-600'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'VIP' ? 'border-red-500' : 'border-gray-600'}`}>
                                                        {selectedPlan === 'VIP' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                                    </div>
                                                    <span className={`font-bold ${selectedPlan === 'VIP' ? 'text-white' : 'text-gray-400'}`}>Gói Cơ Bản</span>
                                                </div>
                                                <div className="text-right flex items-center gap-2">
                                                    <span className="text-gray-500 text-xs font-medium line-through">1.500.000đ</span>
                                                    <span className={`font-black text-xl ${selectedPlan === 'VIP' ? 'text-red-500' : 'text-gray-500'}`}>499k</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-gray-500 pl-6">Nhận toàn bộ Quà tặng đặc quyền VIP ở trên.</p>
                                        </div>

                                        {/* Option 2: 849k */}
                                        <div 
                                            onClick={() => setSelectedPlan('COMBO')}
                                            className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all overflow-hidden ${selectedPlan === 'COMBO' ? 'bg-gradient-to-br from-yellow-900/30 to-black border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'bg-black/50 border-gray-800 hover:border-gray-600'}`}
                                        >
                                            {selectedPlan === 'COMBO' && <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-bl-lg">KHUYÊN DÙNG</div>}
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'COMBO' ? 'border-yellow-500' : 'border-gray-600'}`}>
                                                        {selectedPlan === 'COMBO' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                                                    </div>
                                                    <span className={`font-bold ${selectedPlan === 'COMBO' ? 'text-yellow-400' : 'text-gray-400'}`}>Gói COMBO Chuyên Gia</span>
                                                </div>
                                                <div className="text-right flex items-center gap-2">
                                                    <span className="text-gray-500 text-xs font-medium line-through">3.500.000đ</span>
                                                    <span className={`font-black text-2xl ${selectedPlan === 'COMBO' ? 'text-yellow-500' : 'text-gray-500'}`}>849k</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-gray-400 pl-6"><strong className="text-yellow-500">Gói 499k + 2 Tháng xài Tool AI Pro</strong> (Trị giá 2 triệu)</p>
                                        </div>
                                    </div>

                                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-8">
                                        <div className="w-[60%] h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full animate-pulse" />
                                    </div>
                                    <p className="text-[15px] text-red-600 font-black uppercase tracking-widest mt-4 text-right animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">Chỉ còn 12/40 suất ƯU ĐÃI cuối cùng</p>
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
                                        className={`w-full text-black font-black text-lg py-5 rounded-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest border ${selectedPlan === 'COMBO' ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] hover:from-[#FFC125] hover:to-[#FF7F00] shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:shadow-[0_0_60px_rgba(255,215,0,0.8)] border-yellow-200/50' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white shadow-[0_0_40px_rgba(220,38,38,0.6)] border-red-400/50'}`}
                                    >
                                        {loadingCheckout ? 'Đang Xử Lý...' : `KÍCH HOẠT NGAY (${selectedPlan === 'COMBO' ? '849K' : '499K'})`}
                                    </button>
                                </div>

                                <div className="relative flex py-5 items-center">
                                    <div className="flex-grow border-t border-gray-800"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">HOẶC</span>
                                    <div className="flex-grow border-t border-gray-800"></div>
                                </div>

                                <div className="text-center">
                                    <p className="text-gray-400 text-sm mb-4">Liên hệ với Admin để được cho vào nhóm Zalo và nhận tài liệu đặc quyền dành cho gói VIP.</p>
                                    <Link
                                        href="https://zalo.me/0789284078"
                                        target="_blank"
                                        className="w-full bg-[#0068FF]/10 text-[#0068FF] hover:bg-[#0068FF]/20 border border-[#0068FF]/30 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Users className="w-5 h-5" /> Liên Hệ Admin Vào Nhóm Zalo
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
