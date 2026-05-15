import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, Play } from "lucide-react";

interface VideoTip {
  id: string;
  title: string;
  description?: string;
  youtubeId: string;
  order: number;
  type: string;
}

interface GuidesPageProps {
  tutorialVideos: VideoTip[];
}

const DEFAULT_TOOL_VIDEOS: VideoTip[] = [
  { id: "t1", title: "Đào ngách CPM cao", description: "Tìm thị trường và audience trước khi sản xuất.", youtubeId: "fwIst_IscQs", order: 1, type: "TUTORIAL" },
  { id: "t2", title: "Phân tích kênh đối thủ", description: "Bóc format, title, topic và pattern tăng trưởng.", youtubeId: "ndey_-0BBnA", order: 2, type: "TUTORIAL" },
  { id: "t3", title: "Chuẩn bị video bằng workflow", description: "Đi từ idea đến gói video sẵn sàng đăng.", youtubeId: "cUP6biV4cHQ", order: 3, type: "TUTORIAL" },
  { id: "t4", title: "Remix kịch bản", description: "Tạo angle mới từ nội dung đang có.", youtubeId: "zXJ_inukLGo", order: 4, type: "TUTORIAL" },
  { id: "t5", title: "Storytelling cho YouTube", description: "Biến topic thành câu chuyện dễ xem hơn.", youtubeId: "-yV4qOEkxZw", order: 5, type: "TUTORIAL" },
  { id: "t6", title: "Thư viện ngách thắng", description: "Học từ ngách và format đã có tín hiệu.", youtubeId: "CNbEXE6pj1Q", order: 6, type: "TUTORIAL" },
  { id: "t7", title: "SEO và từ khóa", description: "Tối ưu metadata trước khi upload.", youtubeId: "M4UBTX8omq0", order: 7, type: "TUTORIAL" },
  { id: "t8", title: "Viết kịch bản viral", description: "Tạo hook, outline và CTA rõ ràng.", youtubeId: "NGLzDUTPvgs", order: 8, type: "TUTORIAL" },
];

export default function GuidesPage({ tutorialVideos }: GuidesPageProps) {
  const videos = tutorialVideos.length > 0 ? tutorialVideos : DEFAULT_TOOL_VIDEOS;

  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Head>
        <title>Guides - SeenYT</title>
        <meta name="description" content="SeenYT guides for niche research, workflow planning, video production, YouTube SEO, and AI Coach." />
      </Head>

      <Header />

      <main className="px-4 pb-20 pt-32 sm:px-6">
        <section className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200">
            <BookOpen size={16} />
            Creator guides
          </div>
          <h1 className="text-4xl font-black sm:text-6xl">Hướng dẫn dùng SeenYT theo workflow</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400">
            Các video hướng dẫn tập trung vào việc chọn ngách, nghiên cứu đối thủ, viết kịch bản, sản xuất video và tối ưu kênh YouTube.
          </p>
        </section>

        <section className="mx-auto mt-14 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((video, index) => (
            <article key={video.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
              <div className="relative aspect-video">
                <Image
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/35 transition hover:bg-black/15"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
                    <Play size={22} className="fill-white" />
                  </span>
                </a>
                <div className="absolute left-3 top-3 rounded-full bg-cyan-300 px-2 py-1 text-xs font-black text-slate-950">#{index + 1}</div>
              </div>
              <div className="p-4">
                <h2 className="font-black text-white">{video.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{video.description || "Xem hướng dẫn chi tiết"}</p>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-12 text-center">
          <Link href="/dashboard" className="inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200">
            Mở Studio
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  let tutorialVideos: VideoTip[] = [];

  try {
    const videos = await prisma.videoTip.findMany({
      where: { type: "TUTORIAL" },
      orderBy: { displayOrder: "asc" },
    });
    tutorialVideos = JSON.parse(JSON.stringify(videos));
  } catch (error) {
    console.error("Error fetching tutorial videos:", error);
  }

  return {
    props: {
      tutorialVideos,
      ...(await serverSideTranslations(locale || "vi", ["common"])),
    },
  };
};
