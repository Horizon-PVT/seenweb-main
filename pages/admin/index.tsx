import { GetServerSideProps } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminAuth } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import {
    FileText,
    BookOpen,
    Video,
    ShoppingCart,
    Users,
    DollarSign,
} from 'lucide-react';

interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalAffiliates: number;
    publishedBlogs: number;
    publishedEbooks: number;
    publishedVideos: number;
    pendingPayouts: number;
}

interface Props {
    session: any;
    stats: DashboardStats;
}

export default function AdminDashboard({ session, stats }: Props) {
    const statCards = [
        {
            title: 'Tổng đơn hàng',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Doanh thu',
            value: `${stats.totalRevenue.toLocaleString('vi-VN')} đ`,
            icon: DollarSign,
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Người dùng',
            value: stats.totalUsers,
            icon: Users,
            color: 'from-purple-500 to-purple-600',
        },
        {
            title: 'Affiliates',
            value: stats.totalAffiliates,
            icon: Users,
            color: 'from-yellow-500 to-yellow-600',
        },
        {
            title: 'Blog đã xuất bản',
            value: stats.publishedBlogs,
            icon: FileText,
            color: 'from-pink-500 to-pink-600',
        },
        {
            title: 'Ebooks đã xuất bản',
            value: stats.publishedEbooks,
            icon: BookOpen,
            color: 'from-cyan-500 to-cyan-600',
        },
        {
            title: 'Videos đã xuất bản',
            value: stats.publishedVideos,
            icon: Video,
            color: 'from-red-500 to-red-600',
        },
        {
            title: 'Yêu cầu rút tiền chờ',
            value: stats.pendingPayouts,
            icon: DollarSign,
            color: 'from-orange-500 to-orange-600',
        },
    ];

    return (
        <AdminLayout session={session}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Chào mừng trở lại, Admin! 👋
                    </h2>
                    <p className="text-gray-400">
                        Đây là tổng quan hệ thống quản trị SeenYT
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.title}
                                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}
                                    >
                                        <Icon className="text-white" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium mb-1">
                                    {card.title}
                                </h3>
                                <p className="text-white text-2xl font-bold">
                                    {card.value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Thao tác nhanh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/admin/blog"
                            className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <FileText className="text-[#CDAD5A]" size={24} />
                            <span className="text-white font-medium">Tạo bài viết mới</span>
                        </a>
                        <a
                            href="/admin/orders"
                            className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <ShoppingCart className="text-[#CDAD5A]" size={24} />
                            <span className="text-white font-medium">Xem đơn hàng</span>
                        </a>
                        <a
                            href="/admin/affiliate-payouts"
                            className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <DollarSign className="text-[#CDAD5A]" size={24} />
                            <span className="text-white font-medium">Duyệt chi trả</span>
                        </a>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const authResult = await requireAdminAuth(context);
    if ('redirect' in authResult) {
        return authResult;
    }

    try {
        // Fetch stats
        const [
            totalOrders,
            totalRevenue,
            totalUsers,
            totalAffiliates,
            publishedBlogs,
            publishedEbooks,
            publishedVideos,
            pendingPayouts,
        ] = await Promise.all([
            prisma.paymentRequest.count(),
            prisma.paymentRequest.aggregate({
                _sum: { amount: true },
                where: { status: { in: ['SUCCESS', 'COMPLETED', 'PAID'] } },
            }),
            prisma.user.count(),
            prisma.user.count({ where: { isAffiliate: true } }),
            prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
            prisma.ebook.count({ where: { status: 'PUBLISHED' } }),
            prisma.videoTip.count({ where: { status: 'PUBLISHED' } }),
            prisma.payoutRequest.count({ where: { status: 'PENDING' } }),
        ]);

        const stats: DashboardStats = {
            totalOrders,
            totalRevenue: totalRevenue._sum.amount || 0,
            totalUsers,
            totalAffiliates,
            publishedBlogs,
            publishedEbooks,
            publishedVideos,
            pendingPayouts,
        };

        return {
            props: {
                session: authResult.props.session,
                stats,
            },
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            props: {
                session: authResult.props.session,
                stats: {
                    totalOrders: 0,
                    totalRevenue: 0,
                    totalUsers: 0,
                    totalAffiliates: 0,
                    publishedBlogs: 0,
                    publishedEbooks: 0,
                    publishedVideos: 0,
                    pendingPayouts: 0,
                },
            },
        };
    }
};
