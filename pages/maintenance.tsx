import Head from "next/head";
import { CalendarClock, Clapperboard, Layers, Sparkles, Wand2 } from "lucide-react";

const reopenDate = "Chủ nhật, 17/05/2026";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#05080d] text-white">
      <Head>
        <title>SeenYT đang bảo trì</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta
          name="description"
          content="SeenYT đang bảo trì để cập nhật các workflow sản xuất nội dung YouTube mới."
        />
      </Head>

      <main className="relative flex min-h-screen items-center px-4 py-12 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(245,158,11,0.12),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-cyan-950/30 to-transparent" />

        <section className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100">
              <Sparkles size={16} />
              SeenYT upgrade in progress
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
              SeenYT đang bảo trì để cập nhật workflow sản xuất nội dung mới.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Đội ngũ đang nâng cấp hệ thống workflow giúp creator nghiên cứu ngách, viết kịch bản,
              dựng chuỗi video, xử lý voice, SEO và vận hành sản xuất quy mô lớn trong một trạm làm việc.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-5 py-4 text-left">
              <CalendarClock size={22} className="shrink-0 text-emerald-200" />
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Dự kiến mở lại</div>
                <div className="mt-1 text-lg font-black text-white">{reopenDate}</div>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/login?callbackUrl=%2Fdashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                 Staff access
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="grid gap-4">
              {[
                {
                  icon: Layers,
                  title: "Workflow sản xuất hàng loạt",
                  body: "Tổ chức ý tưởng, kịch bản, voice, video package và SEO theo từng bước rõ ràng.",
                },
                {
                  icon: Clapperboard,
                  title: "Từ một cuốn tiểu thuyết thành chuỗi video",
                  body: "Chuẩn bị nền cho quy trình biến nội dung dài thành nhiều tập video có cấu trúc.",
                },
                {
                  icon: Wand2,
                  title: "Một trạm vận hành nội dung YouTube",
                  body: "Giảm thao tác rời rạc giữa nhiều tool, tập trung vào kế hoạch và sản xuất đều đặn.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-black/25 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                        <Icon size={21} />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white">{item.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
