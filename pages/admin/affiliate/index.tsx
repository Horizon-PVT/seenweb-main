import { GetServerSideProps } from 'next';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminAuth } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';

export default function AdminAffiliate({ session, affiliates }: any) {
    return (
        <AdminLayout session={session}>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Tổng quan Affiliate</h2>

                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Mã Affiliate</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Tổng đơn giới thiệu</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Tổng hoa hồng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ngày tham gia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {affiliates.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Chưa có affiliate nào</td></tr>
                            ) : (
                                affiliates.map((aff: any) => (
                                    <tr key={aff.id} className="hover:bg-gray-750">
                                        <td className="px-6 py-4 text-sm text-white">{aff.email}</td>
                                        <td className="px-6 py-4 text-sm font-mono text-[#CDAD5A]">{aff.affiliateCode}</td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-300">{aff._count.referredUsers}</td>
                                        <td className="px-6 py-4 text-sm text-right text-green-400 font-bold">{parseFloat(aff.totalCommission).toLocaleString('vi-VN')} đ</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{new Date(aff.createdAt).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <Link href="/admin/affiliate-payouts" className="inline-block  bg-gradient-to-r from-[#008080] to-[#CDAD5A] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                        → Quản lý yêu cầu rút tiền
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const authResult = await requireAdminAuth(context);
    if ('redirect' in authResult) return authResult;

    try {
        const affiliates = await prisma.user.findMany({
            where: { isAffiliate: true },
            select: {
                id: true,
                email: true,
                affiliateCode: true,
                totalCommission: true,
                createdAt: true,
                _count: { select: { referredUsers: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            props: {
                session: authResult.props.session,
                affiliates: JSON.parse(JSON.stringify(affiliates)),
            },
        };
    } catch (error) {
        return {
            props: {
                session: authResult.props.session,
                affiliates: [],
            },
        };
    }
};
