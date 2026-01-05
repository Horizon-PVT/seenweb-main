import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import ApplyReferral from '@/components/ApplyReferral';

export default function AffiliateDashboard({ user }: { user: any }) {
  const [showFirstLoginTip, setShowFirstLoginTip] = useState(false);

  useEffect(() => {
    // Tip 1 lần: nếu lần đầu vào dashboard, show hướng dẫn và lưu localStorage để lần sau không hiện nữa
    try {
      const key = 'seenyt_affiliate_dashboard_first_login_tip_v1';
      const existed = localStorage.getItem(key);
      if (!existed) {
        setShowFirstLoginTip(true);
        localStorage.setItem(key, '1');
      }
    } catch {
      // ignore
    }
  }, []);

  const [isJoining, setIsJoining] = useState(false);

  const handleJoinAffiliate = async () => {
    setIsJoining(true);
    try {
      const res = await fetch('/api/affiliate/join', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        // Reload the page to show the affiliate dashboard
        window.location.reload();
      } else {
        alert(data.error || 'Có lỗi xảy ra, vui lòng thử lại.');
        setIsJoining(false);
      }
    } catch (error) {
      alert('Có lỗi xảy ra, vui lòng thử lại.');
      setIsJoining(false);
    }
  };

  if (!user.isAffiliate) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-white">
        {/* Top Nav */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <span className="cursor-pointer text-gray-200 hover:text-white">← Về trang chủ</span>
          </Link>
          <Link href="/affiliate">
            <span className="cursor-pointer text-cyan-300 hover:text-cyan-200">Trang Affiliate</span>
          </Link>
        </div>

        {showFirstLoginTip && (
          <div className="mb-6 p-4 rounded-xl border border-yellow-600 bg-yellow-900/30">
            <p className="font-bold text-yellow-300 mb-1">Lưu ý cho user lần đầu đăng nhập</p>
            <p className="text-sm text-gray-200">
              Nếu lần đầu đăng nhập mà bị điều hướng ra màn hình không đúng như mong muốn, mọi người chỉ cần bấm
              <span className="font-bold"> mũi tên quay lại (Back) </span>
              trên trình duyệt để trở về trang trước và thao tác lại.
            </p>
          </div>
        )}

        <p className="text-xl mb-4 text-center">Bạn chưa tham gia chương trình Affiliate.</p>
        <div className="text-center">
          <button
            onClick={handleJoinAffiliate}
            disabled={isJoining}
            className={`bg-cyan-600 text-white py-3 px-8 rounded hover:bg-cyan-700 ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isJoining ? 'Đang xử lý...' : 'Tham gia ngay'}
          </button>
        </div>
      </div>
    );
  }

  const totalApproved = user.totalCommission || 0;
  const isEligible = totalApproved >= 1000000;

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      {/* Top Nav */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <span className="cursor-pointer text-gray-200 hover:text-white">← Về trang chủ</span>
        </Link>
        <Link href="/affiliate">
          <span className="cursor-pointer text-cyan-300 hover:text-cyan-200">Trang Affiliate</span>
        </Link>
      </div>

      {showFirstLoginTip && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-600 bg-yellow-900/30">
          <p className="font-bold text-yellow-300 mb-1">Lưu ý cho user lần đầu đăng nhập</p>
          <p className="text-sm text-gray-200">
            Với các user lần đầu đăng nhập: nếu hệ thống có lúc đưa bạn ra một màn hình trắng không đúng như mong muốn,
            mọi người chỉ cần bấm
            <span className="font-bold"> mũi tên quay lại (Back) </span>
            trên trình duyệt để trở về trang trước và thao tác lại.
          </p>
        </div>
      )}

      <ApplyReferral />

      <h1 className="text-4xl font-bold mb-8 text-center">Dashboard Affiliate</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-cyan-900 to-black p-6 rounded-xl border border-cyan-600">
          <p className="text-gray-400">Mã Affiliate</p>
          <p className="text-2xl font-bold">{user.affiliateCode || 'Chưa có'}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900 to-black p-6 rounded-xl border border-green-600">
          <p className="text-gray-400">Tổng Hoa Hồng</p>
          <p className="text-2xl font-bold">{totalApproved.toLocaleString('vi-VN')} VND</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-black p-6 rounded-xl border border-purple-600">
          <p className="text-gray-400">Số Người Giới Thiệu</p>
          <p className="text-2xl font-bold">{user.referredUsers.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900 to-black p-6 rounded-xl border border-yellow-600">
          <p className="text-gray-400">Link Affiliate</p>
          <p className="text-sm break-all">https://seenyt.net/?ref={user.affiliateCode || ''}</p>
        </div>
      </div>

      <div className="mb-12 text-center">
        <p className="mb-2 font-semibold">Link giới thiệu:</p>
        <div className="flex justify-center gap-4">
          <input
            readOnly
            value={`https://seenyt.net/?ref=${user.affiliateCode || ''}`}
            className="w-96 p-3 bg-gray-800 border border-cyan-600 rounded"
          />
          <button
            onClick={() => navigator.clipboard.writeText(`https://seenyt.net/?ref=${user.affiliateCode || ''}`)}
            className="bg-cyan-600 px-6 py-3 rounded hover:bg-cyan-700"
          >
            Copy
          </button>
        </div>
      </div>

      {/* LAYOUT 2 CỘT: Điều khoản bên trái - Rút tiền bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Bên trái: Điều khoản tham gia (ngắn gọn + câu đồng ý) */}
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Điều Khoản Tham Gia Affiliate</h2>
          <p className="font-bold text-yellow-400 mb-4">
            Khi tham gia chương trình Affiliate SeenYT, bạn đã đồng ý tuân thủ đầy đủ các điều khoản sau:
          </p>
          <ul className="space-y-3 text-gray-300">
            <li>• Hoa hồng: 30% lần mua đầu, 10-15% nâng cấp, 10% gia hạn hàng tháng.</li>
            <li>• Cookie tracking: 60 ngày.</li>
            <li>• Rút tiền tối thiểu 1.000.000 VND (làm tròn xuống trăm nghìn).</li>
            <li>• Chi trả ngày 20-25 hàng tháng qua chuyển khoản.</li>
            <li>• Cấm self-referral, spam group/comment, quảng cáo sai sự thật (hứa kiếm tiền dễ dàng).</li>
            <li>• SeenYT có quyền hủy commission nếu vi phạm hoặc user refund trong 30 ngày.</li>
            <li>• Affiliate tự chịu trách nhiệm khai báo thuế thu nhập cá nhân theo luật Việt Nam.</li>
            <li>• SeenYT có quyền thay đổi điều khoản (báo trước 30 ngày).</li>
          </ul>
        </div>

        {/* Bên phải: Yêu cầu rút tiền (cho điền luôn, alert nếu chưa đủ) */}
        <div className="bg-gradient-to-br from-yellow-900 to-black p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Yêu Cầu Rút Tiền</h2>
          <p className="text-xl mb-6 text-center">
            Tổng hoa hồng hiện tại: <span className="font-bold">{totalApproved.toLocaleString('vi-VN')} VND</span>
          </p>

          {!isEligible && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded text-center">
              <p className="font-bold text-red-400">Bạn chưa đủ điều kiện rút tiền</p>
              <p className="text-sm mt-2">
                Cần đạt ít nhất <span className="font-bold">1.000.000 VND</span> để gửi yêu cầu.
              </p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              if (!isEligible) {
                e.preventDefault();
                alert(
                  'Bạn chưa đủ điều kiện rút tiền!\n\nBạn cần đạt ít nhất 1.000.000 VND hoa hồng approved để gửi yêu cầu.\nVui lòng đọc kỹ điều khoản bên trái và tiếp tục giới thiệu user để kiếm thêm commission nhé!'
                );
              }
            }}
            action="/api/affiliate/request-payout"
            method="POST"
            className="space-y-4"
          >
            <input type="hidden" name="amount" value={totalApproved} />

            <div>
              <label className="block text-gray-300 mb-2">Ngân hàng</label>
              <input
                type="text"
                name="bankName"
                required
                placeholder="Ví dụ: Vietcombank"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Số tài khoản</label>
              <input
                type="text"
                name="accountNumber"
                required
                placeholder="1234567890"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Chủ tài khoản</label>
              <input
                type="text"
                name="accountName"
                required
                placeholder="NGUYEN VAN A"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 rounded-lg text-xl font-bold transition-all ${isEligible ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 cursor-not-allowed'
                }`}
            >
              {isEligible ? 'Gửi Yêu Cầu Rút Tiền' : 'Chưa Đủ Điều Kiện'}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            • Chi trả ngày 20-25 hàng tháng.<br />
            • Số tiền làm tròn đơn vị trăm nghìn (ví dụ: 1.450.000 → 1.400.000 VND).
          </p>
        </div>
      </div>

      {/* Các phần dưới giữ nguyên (người giới thiệu + lịch sử commission) */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Người Bạn Giới Thiệu ({user.referredUsers.length})</h2>
        {user.referredUsers.length === 0 ? (
          <p>Chưa có.</p>
        ) : (
          <table className="w-full bg-gray-900 rounded-xl">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {user.referredUsers.map((ref: any) => (
                <tr key={ref.email} className="border-t border-gray-700">
                  <td className="p-4">{ref.email}</td>
                  <td className="p-4">{new Date(ref.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6">Lịch Sử Hoa Hồng</h2>
      {user.commissions.length === 0 ? (
        <p>Chưa có.</p>
      ) : (
        <table className="w-full bg-gray-900 rounded-xl">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4 text-left">Loại</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-right">Số Tiền</th>
              <th className="p-4 text-left">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {user.commissions.map((c: any) => (
              <tr key={c.id} className="border-t border-gray-700">
                <td className="p-4">
                  {c.type === 'FIRST_PURCHASE' ? 'Mua đầu' : c.type === 'UPGRADE' ? 'Nâng cấp' : 'Gia hạn'}
                </td>
                <td className="p-4">{c.referredUser?.email || c.referredUserId}</td>
                <td className="p-4 text-right">{c.amount.toLocaleString('vi-VN')} VND</td>
                <td className="p-4">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user?.email) {
    return { redirect: { destination: '/', permanent: false } };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      commissions: {
        orderBy: { createdAt: 'desc' },
        include: { referredUser: { select: { email: true } } },
      },
      referredUsers: { select: { email: true, createdAt: true } },
    },
  });

  if (!user) {
    return { redirect: { destination: '/', permanent: false } };
  }

  const serializedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    membershipExpiry: user.membershipExpiry ? user.membershipExpiry.toISOString() : null,
    totalCommission: user.totalCommission ? user.totalCommission.toNumber() : 0,
    referredUsers: user.referredUsers.map((u: any) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
    commissions: user.commissions.map((c: any) => ({
      ...c,
      amount: c.amount.toNumber(),
      createdAt: c.createdAt.toISOString(),
      approvedAt: c.approvedAt ? c.approvedAt.toISOString() : null,
      referredUser: c.referredUser ? { email: c.referredUser.email } : null,
    })),
  };

  return { props: { user: serializedUser } };
};
