import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default function AdminAffiliatePayouts({ payouts }: { payouts: any[] }) {
  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-8">Quản Lý Chi Trả Affiliate</h1>

      <table className="w-full bg-gray-900 rounded-xl">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-4 text-left">Affiliate (Email)</th>
            <th className="p-4 text-right">Số tiền yêu cầu</th>
            <th className="p-4 text-right">Số tiền duyệt (làm tròn)</th>
            <th className="p-4 text-left">Ngân hàng</th>
            <th className="p-4 text-left">Trạng thái</th>
            <th className="p-4 text-left">Ngày yêu cầu</th>
            <th className="p-4 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {payouts.length === 0 ? (
            <tr><td colSpan={7} className="p-8 text-center">Chưa có yêu cầu rút tiền nào.</td></tr>
          ) : (
            payouts.map((p) => (
              <tr key={p.id} className="border-t border-gray-700">
                <td className="p-4">{p.affiliate.email}</td>
                <td className="p-4 text-right">{p.amountRequested.toLocaleString('vi-VN')} VND</td>
                <td className="p-4 text-right">
                  {p.amountApproved ? p.amountApproved.toLocaleString('vi-VN') : 'Chưa duyệt'}
                </td>
                <td className="p-4">
                  {p.bankInfo.bankName} - {p.bankInfo.accountNumber} ({p.bankInfo.accountName})
                </td>
                <td className="p-4">{p.status === 'PENDING' ? 'Chờ duyệt' : p.status === 'PAID' ? 'Đã chi trả' : p.status}</td>
                <td className="p-4">{new Date(p.requestedAt).toLocaleDateString('vi-VN')}</td>
                <td className="p-4 text-center">
                  {p.status === 'PENDING' && (
                    <form action="/api/admin/approve-payout" method="POST" className="inline">
                      <input type="hidden" name="payoutId" value={p.id} />
                      <button type="submit" className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
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
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) { // Check admin email từ .env
    return { redirect: { destination: '/', permanent: false } };
  }

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

  return { props: { payouts: serializedPayouts } };
};