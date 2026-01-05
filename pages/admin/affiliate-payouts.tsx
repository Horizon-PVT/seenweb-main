import { GetServerSideProps } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminAuth } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';

export default function AdminAffiliatePayouts({ session, payouts }: { session: any; payouts: any[] }) {
  return (
    <AdminLayout session={session}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Quản Lý Chi Trả Affiliate</h2>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Affiliate (Email)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Số tiền yêu cầu</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Số tiền duyệt (làm tròn)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ngân hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ngày yêu cầu</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {payouts.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Chưa có yêu cầu rút tiền nào.</td></tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 text-sm text-white">{p.affiliate.email}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-300">{p.amountRequested.toLocaleString('vi-VN')} VND</td>
                    <td className="px-6 py-4 text-sm text-right text-green-400 font-bold">
                      {p.amountApproved ? p.amountApproved.toLocaleString('vi-VN') : 'Chưa duyệt'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {p.bankInfo.bankName} - {p.bankInfo.accountNumber} ({p.bankInfo.accountName})
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {p.status === 'PENDING' ? 'Chờ duyệt' : p.status === 'PAID' ? 'Đã chi trả' : p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(p.requestedAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 text-center">
                      {p.status === 'PENDING' && (
                        <form action="/api/admin/approve-payout" method="POST" className="inline">
                          <input type="hidden" name="payoutId" value={p.id} />
                          <button type="submit" className="bg-gradient-to-r from-[#008080] to-[#CDAD5A] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                            Duyệt & Chi Trả
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authResult = await requireAdminAuth(context);
  if ('redirect' in authResult) return authResult;

  const payouts = await prisma.payoutRequest.findMany({
    include: { affiliate: { select: { email: true } } },
    orderBy: { requestedAt: 'desc' },
  });

  const serializedPayouts = payouts.map((p: any) => ({
    ...p,
    amountRequested: p.amountRequested.toNumber(),
    amountApproved: p.amountApproved ? p.amountApproved.toNumber() : null,
    requestedAt: p.requestedAt.toISOString(),
    processedAt: p.processedAt ? p.processedAt.toISOString() : null,
  }));

  return {
    props: {
      session: authResult.props.session,
      payouts: serializedPayouts
    }
  };
};