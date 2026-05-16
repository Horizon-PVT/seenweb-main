import Head from "next/head";
import React, { useState } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Check, ChevronDown, ChevronUp, Cpu, Globe, TrendingUp, Zap, Briefcase, Smile, Award } from "lucide-react";

export default function RecruitmentPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        role: "Content Creator (YouTube)",
        location: "",
        portfolio: "",
        reason: "",
        aiReady: "Co",
        gender: "Nam",
        dob: "",
        experience: "",
        recentJob: "",
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (roleName: string) => {
        setFormData((prev) => ({ ...prev, role: roleName }));
        const formSection = document.getElementById("apply-form");
        if (formSection) {
            formSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value as string);
            });
            if (photo) {
                data.append("photo", photo);
            }

            const res = await fetch("/api/apply", {
                method: "POST",
                body: data,
            });

            if (res.ok) {
                setSubmitStatus("success");
            } else {
                setSubmitStatus("error");
            }
        } catch (error) {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: "", email: "", phone: "", role: "Content Creator (YouTube)", location: "", portfolio: "", reason: "", aiReady: "",
            gender: "Nam", dob: "", experience: "", recentJob: ""
        });
        setPhoto(null);
        setSubmitStatus("idle");
    };

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <>
            <Head>
                <title>Tuyển dụng SeenYT | Xây hệ thống cùng SeenYT</title>
                <meta
                    name="description"
                    content="SeenYT tuyển người xây hệ thống Media & AI. Không hành chính, không KPI hình thức. Thu nhập tăng theo giá trị. Ứng tuyển ngay!"
                />
                <meta property="og:title" content="Tuyển dụng SeenYT | Build Systems, Not Tasks" />
                <meta property="og:description" content="Môi trường làm việc AI-first, remote friendly, tập trung vào hiệu quả và tăng trưởng dài hạn." />
                <meta property="og:image" content="https://www.seenyt.net/thumbnail.jpg" />
            </Head>

            {/* GLOBAL THEME SWITCH: LIGHT MODE */}
            <div className="bg-[#F7FAFF] text-slate-800 min-h-screen font-sans selection:bg-cyan-100">
                <Header />

                <main className="pt-24 pb-20">

                    {/* SECTION 1: SPLIT HERO */}
                    <section className="relative px-6 py-12 md:py-20 max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            {/* LEFT TEXT */}
                            <div className="lg:w-1/2 text-left space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-bold uppercase tracking-wider border border-cyan-100">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                                    Hiring Now
                                </div>
                                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
                                    Không tuyển nhân viên. <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                                        SeenYT tuyển người xây hệ thống.
                                    </span>
                                </h1>
                                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
                                    Thu nhập tăng theo giá trị bạn tạo ra. <strong className="text-slate-900">Không hành chính. Không phạt. KPI rõ ràng.</strong>
                                </p>

                                <div className="flex flex-wrap gap-3">
                                    {["AI-first", "Remote-first", "Minh bạch & công bằng"].map((pill, i) => (
                                        <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 shadow-sm">
                                            {pill}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <a
                                        href="#apply-form"
                                        className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all hover:scale-105 shadow-lg shadow-slate-200"
                                    >
                                        Ứng tuyển ngay
                                    </a>
                                    <a
                                        href="#about"
                                        className="px-8 py-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700 font-medium"
                                    >
                                        Xem văn hóa SeenYT
                                    </a>
                                </div>
                            </div>

                            {/* RIGHT IMAGE GRID */}
                            <div className="lg:w-1/2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4 translate-y-8">
                                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                                            <Image src="/recruitment/team-working.jpg" alt="Team Working" fill className="object-cover" />
                                        </div>
                                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white -rotate-1 hover:rotate-0 transition-transform duration-500">
                                            <Image src="/recruitment/team-outdoor.jpg" alt="Team Outdoor" fill className="object-cover" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500">
                                            <Image src="/recruitment/team-fun.jpg" alt="Team Fun" fill className="object-cover" />
                                        </div>
                                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white -rotate-2 hover:rotate-0 transition-transform duration-500">
                                            <Image src="/recruitment/team-beach.jpg" alt="Team Beach" fill className="object-cover" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-xs text-slate-400 mt-6 italic">
                                    "Chúng tôi xây hệ thống cùng nhau — làm thật, chơi thật, tăng trưởng thật."
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: SEENYT LÀ GÌ (Features) */}
                    <section id="about" className="px-6 py-20 bg-white border-y border-slate-100">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">SeenYT là gì?</h2>
                                <p className="text-xl text-slate-500 max-w-3xl mx-auto">
                                    SeenYT xây dựng hệ thống Media (YouTube) và sản phẩm số. <br />
                                    <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-600 mt-2 inline-block">YouTube → Website → Tools → Revenue</span>
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { icon: <Cpu className="w-8 h-8 text-cyan-600" />, title: "AI-first Workflows", desc: "Tự động hóa tối đa. Con người làm phần sáng tạo nhất." },
                                    { icon: <TrendingUp className="w-8 h-8 text-green-600" />, title: "Data-driven", desc: "Quyết định dựa trên số liệu thực tế, không cảm tính." },
                                    { icon: <Globe className="w-8 h-8 text-purple-600" />, title: "Systems > Tasks", desc: "Xây dựng cỗ máy tự chạy, không làm việc lặp lại." },
                                    { icon: <Zap className="w-8 h-8 text-yellow-500" />, title: "Long-term Value", desc: "Tập trung vào giá trị bền vững thay vì trend ngắn hạn." }
                                ].map((item, i) => (
                                    <div key={i} className="group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
                                        <div className="mb-4 bg-white p-3 rounded-xl w-fit shadow-sm group-hover:scale-110 transition-transform">{item.icon}</div>
                                        <h3 className="text-lg font-bold mb-2 text-slate-900">{item.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: VĂN HÓA HỢP TÁC */}
                    <section className="px-6 py-20 bg-[#F7FAFF]">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-900">Văn hóa hợp tác</h2>

                            <div className="grid md:grid-cols-2 gap-8 mb-12">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                        <span className="p-2 bg-green-100 rounded-lg text-green-600"><Smile size={20} /></span>
                                        Tự do & Chủ động
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            "Không chấm công cứng - Bạn tự quản lý thời gian",
                                            "Không vi mô - Chúng tôi quan tâm kết quả cuối cùng",
                                            "Không phạt tiền nội bộ - Lỗi sai là để học hỏi"
                                        ].map((text, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-slate-600">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                        <span className="p-2 bg-purple-100 rounded-lg text-purple-600"><Award size={20} /></span>
                                        Tăng trưởng & Lợi ích
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            "Thu nhập không giới hạn - Gắn liền doanh thu",
                                            "Sáng tạo được thưởng - Khuyến khích cái mới",
                                            "Dùng AI mỗi ngày - Nâng cấp bản thân liên tục"
                                        ].map((text, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-slate-600">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="inline-block px-6 py-3 bg-white rounded-full shadow-sm border border-slate-200 text-slate-500 text-sm font-medium tracking-widest uppercase">
                                    Tin tưởng • Minh bạch • Trách nhiệm • Tăng trưởng
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: VỊ TRÍ TUYỂN DỤNG */}
                    <section className="px-6 py-20 bg-white">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-slate-900">Vị trí đang mở</h2>
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* CARD 1 */}
                                <div className="flex flex-col h-full p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-2xl hover:border-cyan-200 transition-all relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-cyan-500"></div>
                                    <h3 className="text-2xl font-bold mb-1 text-slate-900">Content Creator</h3>
                                    <p className="text-sm text-cyan-600 font-semibold mb-6 uppercase tracking-wider">YouTube System</p>
                                    <div className="space-y-3 text-slate-600 mb-8 text-sm flex-grow">
                                        <p>• Quản lý tối thiểu 3 kênh</p>
                                        <p>• Viết kịch bản, lên idea, tối ưu retention</p>
                                        <p>• Sử dụng công cụ AI để scale content</p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-100 mt-auto">
                                        <p className="font-semibold text-slate-900 text-sm mb-4">Lương cứng + Phụ cấp + Thưởng BKT + Chia doanh thu</p>
                                        <button
                                            onClick={() => handleRoleSelect("Content Creator (YouTube)")}
                                            className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 transition-colors"
                                        >
                                            Ứng tuyển vị trí này
                                        </button>
                                    </div>
                                </div>

                                {/* CARD 2 */}
                                <div className="flex flex-col h-full p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-2xl hover:border-purple-200 transition-all relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-500"></div>
                                    <h3 className="text-2xl font-bold mb-1 text-slate-900">Video Editor</h3>
                                    <p className="text-sm text-purple-600 font-semibold mb-6 uppercase tracking-wider">Production Lead</p>
                                    <div className="space-y-3 text-slate-600 mb-8 text-sm flex-grow">
                                        <p>• Dựng video theo hệ thống quy chuẩn</p>
                                        <p>• Tối ưu nhịp cắt, subtitle, visual hook</p>
                                        <p>• Phối hợp với AI voice & asset generation</p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-100 mt-auto">
                                        <p className="font-semibold text-slate-900 text-sm mb-4">Lương cứng + Phụ cấp + Thưởng theo kênh bật kiếm tiền</p>
                                        <button
                                            onClick={() => handleRoleSelect("Video Editor")}
                                            className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                                        >
                                            Ứng tuyển vị trí này
                                        </button>
                                    </div>
                                </div>

                                {/* CARD 3 */}
                                <div className="flex flex-col h-full p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-2xl hover:border-yellow-200 transition-all relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400"></div>
                                    <h3 className="text-2xl font-bold mb-1 text-slate-900">Marketer / Lead</h3>
                                    <p className="text-sm text-yellow-600 font-semibold mb-6 uppercase tracking-wider">Growth & Funnel</p>
                                    <div className="space-y-3 text-slate-600 mb-8 text-sm flex-grow">
                                        <p>• Chiến lược kênh, tìm niche, tăng RPM</p>
                                        <p>• Xây dựng phễu: YouTube → Website → Tool</p>
                                        <p>• Tối ưu chuyển đổi và traffic</p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-100 mt-auto">
                                        <p className="font-semibold text-slate-900 text-sm mb-4">Lương cứng + Phụ cấp + Commission (Không trần)</p>
                                        <button
                                            onClick={() => handleRoleSelect("Marketer / Media Lead")}
                                            className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700 transition-colors"
                                        >
                                            Ứng tuyển vị trí này
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: THU NHẬP (VISUAL) */}
                    <section className="px-6 py-20 bg-slate-50 border-y border-slate-200">
                        <div className="max-w-5xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-12 text-slate-900">Thu nhập hoạt động thế nào?</h2>
                            <div className="flex flex-wrap justify-center items-center gap-4">
                                {[
                                    { l: "Lương cứng", d: "Ổn định" }, { op: "+" },
                                    { l: "Phụ cấp", d: "Xăng, Ăn" }, { op: "+" },
                                    { l: "Thưởng Mốc", d: "KPIs" }, { op: "+" },
                                    { l: "Chia Doanh Thu", d: "% Profit" }
                                ].map((item: any, i) => (
                                    item.op ? <span key={i} className="text-2xl text-slate-300 mx-2 hidden md:block">+</span> :
                                        <div key={i} className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-slate-100 min-w-[160px]">
                                            <div className="text-lg font-bold text-slate-800">{item.l}</div>
                                            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{item.d}</div>
                                        </div>
                                ))}
                            </div>
                            <p className="mt-12 text-xl font-medium text-slate-600 italic">
                                "Hệ thống càng tăng trưởng, thu nhập bạn càng tăng."
                            </p>
                        </div>
                    </section>

                    {/* SECTION 6: FOUNDER MESSAGE */}
                    <section className="px-6 py-24 bg-white">
                        <div className="max-w-4xl mx-auto">
                            <div className="relative bg-slate-50 p-10 md:p-14 rounded-[2.5rem] border border-slate-100">
                                <div className="absolute top-10 left-10 text-6xl text-slate-200 font-serif leading-none">“</div>

                                <div className="relative z-10 space-y-6 text-lg md:text-xl leading-relaxed text-slate-700 font-light">
                                    <p>Tôi không xây SeenYT như một công ty truyền thống. Tôi xây một hệ thống nơi con người được tôn trọng, được trao quyền, và thu nhập tăng theo giá trị thật sự tạo ra.</p>
                                    <p>Tôi không tin vào kiểm soát con người. Tôi tin vào hệ thống rõ ràng, nguyên tắc rõ ràng và phần thưởng rõ ràng.</p>
                                </div>

                                <div className="mt-10 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden relative">
                                        {/* Placeholder for founder avatar if needed */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400"></div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">Phạm Anh Tùng</div>
                                        <div className="text-sm text-slate-500 uppercase tracking-wide">Founder, SeenYT</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 7: FORM */}
                    <section id="apply-form" className="px-6 py-20 bg-[#F7FAFF] relative">
                        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h2 className="text-3xl font-bold mb-2 text-center text-slate-900">Gửi hồ sơ ứng tuyển</h2>
                            <p className="text-center text-slate-500 mb-10">Hãy cho chúng tôi biết về bạn và mục tiêu của bạn.</p>

                            {submitStatus === "success" ? (
                                <div className="text-center py-12 animate-fade-in">
                                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-slate-900">Đã gửi thành công!</h3>
                                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">Cảm ơn bạn. Nếu phù hợp định hướng SeenYT, chúng tôi sẽ liên hệ lại sớm nhất.</p>
                                    <button onClick={resetForm} className="text-cyan-600 font-bold hover:underline">Gửi thêm một hồ sơ khác</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên *</label>
                                            <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" placeholder="Nguyễn Văn A" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" placeholder="email@example.com" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Giới tính</label>
                                            <div className="relative">
                                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none cursor-pointer">
                                                    <option value="Nam">Nam</option>
                                                    <option value="Nữ">Nữ</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Ngày tháng năm sinh</label>
                                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">SĐT / Zalo *</label>
                                            <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" placeholder="09xxxxxxx" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Khu vực *</label>
                                            <input required name="location" value={formData.location} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" placeholder="Hà Nội, TP.HCM..." />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Ảnh đại diện (CV/Portrait)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Vị trí ứng tuyển *</label>
                                        <div className="relative">
                                            <select required name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none cursor-pointer">
                                                <option value="Content Creator (YouTube)">Content Creator (YouTube)</option>
                                                <option value="Video Editor">Video Editor</option>
                                                <option value="Marketer / Media Lead">Marketer / Media Lead</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Công việc gần nhất là gì?</label>
                                        <input name="recentJob" value={formData.recentJob} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" placeholder="Ví dụ: Editor tại Agency A..." />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Bạn đã có kinh nghiệm về gì?</label>
                                        <textarea name="experience" value={formData.experience} onChange={handleChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" placeholder="Mô tả ngắn gọn kinh nghiệm liên quan..." />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio / Link sản phẩm</label>
                                        <input name="portfolio" value={formData.portfolio} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" placeholder="Google Drive, Website, Behance..." />
                                        <p className="text-xs text-slate-400 mt-1">Link folder Drive hoặc các sản phẩm bạn từng làm.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Vì sao bạn muốn làm cùng SeenYT? *</label>
                                        <textarea required name="reason" value={formData.reason} onChange={handleChange} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" placeholder="Chia sẻ ngắn gọn động lực của bạn..." />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Bạn có sẵn sàng học và dùng AI mỗi ngày không? *</label>
                                        <div className="flex gap-6 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex-1">
                                                <input
                                                    type="radio"
                                                    name="aiReady"
                                                    value="Co"
                                                    checked={formData.aiReady === "Co"}
                                                    onChange={handleChange}
                                                    className="accent-cyan-600 w-5 h-5"
                                                />
                                                <span className="text-slate-700">Có, tôi thích công nghệ mới</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex-1">
                                                <input
                                                    type="radio"
                                                    name="aiReady"
                                                    value="Khong"
                                                    checked={formData.aiReady === "Khong"}
                                                    onChange={handleChange}
                                                    className="accent-red-500 w-5 h-5"
                                                />
                                                <span className="text-slate-700">Không, tôi thich cách cũ</span>
                                            </label>
                                        </div>
                                    </div>

                                    {submitStatus === "error" && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
                                            Có lỗi xảy ra khi gửi. Vui lòng thử lại sau.
                                        </div>
                                    )}

                                    <button
                                        type="submit" disabled={isSubmitting}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Đang gửi hồ sơ..." : "GỬI HỒ SƠ ỨNG TUYỂN"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>

                    {/* SECTION 8: FAQ */}
                    <section className="px-6 py-20 bg-white">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center text-slate-900">FAQ</h2>
                            <p className="text-center text-slate-500 mb-12">Bạn hỏi – SeenYT trả lời thẳng.</p>

                            <div className="space-y-4">
                                {[
                                    { q: "SeenYT có chấm công không?", a: "Không. Chúng tôi quản lý theo kết quả và deadline cam kết. Bạn tự chủ thời gian." },
                                    { q: "Thu nhập tính thế nào?", a: "Kết hợp giữa lương cứng (đảm bảo đời sống) và thưởng hiệu quả (không giới hạn). Chúng tôi minh bạch về doanh thu kênh bạn quản lý để chia sẻ lợi nhuận." },
                                    { q: "Có cần kinh nghiệm không?", a: "Kinh nghiệm là lợi thế, nhưng tư duy học hỏi quan trọng hơn. Nếu bạn chưa biết, chúng tôi sẽ đào tạo, miễn là bạn 'đói' kiến thức." },
                                    { q: "Làm remote được không?", a: "100% Remote-first. Chúng tôi làm việc qua ClickUp, Discord và Notion." },
                                    { q: "Bao lâu phản hồi?", a: "Chúng tôi sẽ phản hồi trong vòng 3-5 ngày làm việc nếu hồ sơ phù hợp." }
                                ].map((item, i) => (
                                    <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                        <button
                                            onClick={() => toggleFaq(i)}
                                            className="w-full flex justify-between items-center p-5 text-left hover:bg-white transition-colors"
                                        >
                                            <span className="font-bold text-slate-800">{item.q}</span>
                                            {openFaq === i ? <ChevronUp className="text-cyan-600" /> : <ChevronDown className="text-slate-400" />}
                                        </button>
                                        {openFaq === i && (
                                            <div className="p-5 pt-0 text-slate-600 border-t border-slate-100 bg-white leading-relaxed">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                </main>

                <Footer />
            </div>
        </>
    );
}
