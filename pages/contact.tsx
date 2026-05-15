import Head from "next/head";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Head>
        <title>Contact - SeenYT</title>
        <meta name="description" content="Contact SeenYT for product support, billing questions, and YouTube workflow help." />
      </Head>
      <Header />
      <main className="px-4 pb-20 pt-32 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200">
            Support
          </div>
          <h1 className="text-4xl font-black sm:text-6xl">Liên hệ SeenYT</h1>
          <p className="mt-5 text-base leading-8 text-slate-400">
            Nếu bạn cần hỗ trợ khi dùng Studio, workflow, AI Coach hoặc thanh toán, liên hệ qua các kênh dưới đây.
          </p>

          <div className="mt-10 grid gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Email</div>
              <div className="mt-2 text-lg font-bold text-white">takeuchi999999999@gmail.com</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Zalo</div>
              <div className="mt-2 text-lg font-bold text-white">0789 284 078</div>
            </div>
          </div>

          <Link href="/dashboard" className="mt-10 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200">
            Mở Studio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
