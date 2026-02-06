import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Play, ArrowLeft, BookOpen } from 'lucide-react';

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

// Default videos if DB is empty (same as index.tsx)
const DEFAULT_TOOL_VIDEOS = [
    { id: 't1', title: 'Đào ngách cpm cao', description: 'Xem hướng dẫn chi tiết', youtubeId: 'fwIst_IscQs', order: 1, type: 'TUTORIAL' },
    { id: 't2', title: 'Phân tích kênh đối thủ', description: 'Xem hướng dẫn chi tiết', youtubeId: 'ndey_-0BBnA', order: 2, type: 'TUTORIAL' },
    { id: 't3', title: 'Công cụ tạo video', description: 'Xem hướng dẫn chi tiết', youtubeId: 'cUP6biV4cHQ', order: 3, type: 'TUTORIAL' },
    { id: 't4', title: 'Remix kịch bản', description: 'Xem hướng dẫn chi tiết', youtubeId: 'zXJ_inukLGo', order: 4, type: 'TUTORIAL' },
    { id: 't5', title: 'Kể Chuyện Lịch Sử / Story', description: 'Xem hướng dẫn chi tiết', youtubeId: '-yV4qOEkxZw', order: 5, type: 'TUTORIAL' },
    { id: 't6', title: 'Tool thư viện ngách thắng', description: 'Xem hướng dẫn chi tiết', youtubeId: 'CNbEXE6pj1Q', order: 6, type: 'TUTORIAL' },
    { id: 't7', title: 'Tool seo và từ khoá', description: 'Xem hướng dẫn chi tiết', youtubeId: 'M4UBTX8omq0', order: 7, type: 'TUTORIAL' },
    { id: 't8', title: 'Hướng dẫn viết kịch bản viral', description: 'Xem hướng dẫn chi tiết', youtubeId: 'NGLzDUTPvgs', order: 8, type: 'TUTORIAL' },
];

export default function GuidesPage({ tutorialVideos }: GuidesPageProps) {
    const { t } = useTranslation('common');
    const videos = tutorialVideos.length > 0 ? tutorialVideos : DEFAULT_TOOL_VIDEOS;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
            <Head>
                <title>Hướng Dẫn Sử Dụng Tools | SeenYT</title>
                <meta name="description" content="Hướng dẫn chi tiết cách sử dụng các công cụ AI của SeenYT để phát triển kênh YouTube." />
            </Head>

            <Header />

            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <section className="py-12 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-[#CDAD5A]/10 border border-[#CDAD5A]/30 px-4 py-2 rounded-full mb-6">
                            <BookOpen className="w-5 h-5 text-[#CDAD5A]" />
                            <span className="text-[#CDAD5A] text-sm font-medium">Hỗ Trợ Kỹ Thuật</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Hướng Dẫn <span className="text-[#CDAD5A]">Sử Dụng Tools</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Xem video hướng dẫn chi tiết để sử dụng hiệu quả bộ công cụ AI của SeenYT.
                        </p>
                    </div>
                </section>

                {/* Video Grid */}
                <section className="px-6 pb-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {videos.map((video, index) => (
                                <div
                                    key={video.id}
                                    className="group bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-[#CDAD5A]/50 transition-all duration-300"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video overflow-hidden">
                                        <img
                                            src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <a
                                                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-red-600 hover:bg-red-500 p-4 rounded-full shadow-lg transform group-hover:scale-110 transition-transform"
                                            >
                                                <Play className="w-6 h-6 text-white fill-white" />
                                            </a>
                                        </div>
                                        {/* Order Badge */}
                                        <div className="absolute top-3 left-3 bg-[#CDAD5A] text-black text-xs font-bold px-2 py-1 rounded">
                                            #{index + 1}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-white mb-1 line-clamp-2 group-hover:text-[#CDAD5A] transition-colors">
                                            {video.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2">
                                            {video.description || 'Xem hướng dẫn chi tiết'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {videos.length === 0 && (
                            <div className="text-center py-20">
                                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Chưa có video hướng dẫn nào.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Back to Home */}
                <section className="text-center pb-12">
                    <Link href="/">
                        <span className="inline-flex items-center gap-2 text-gray-400 hover:text-[#CDAD5A] transition-colors cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại trang chủ
                        </span>
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    let tutorialVideos: VideoTip[] = [];

    try {
        const videos = await prisma.videoTip.findMany({
            where: { type: 'TUTORIAL' },
            orderBy: { order: 'asc' },
        });
        tutorialVideos = JSON.parse(JSON.stringify(videos));
    } catch (error) {
        console.error('Error fetching tutorial videos:', error);
    }

    return {
        props: {
            tutorialVideos,
            ...(await serverSideTranslations(locale || 'vi', ['common'])),
        },
    };
};
