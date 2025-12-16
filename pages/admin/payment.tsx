import React, { useState, useEffect } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface PaymentRequest {
  id: string;
  email: string;
  amount: number;
  orderCode: string;
  status: 'PENDING' | 'PENDING_MANUAL' | 'SUCCESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  paymentInfo: string;
  role: string;
  note?: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
}

export default function AdminPaymentDashboard() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPlanName = (info: string) => {
    try {
      const data = JSON.parse(info);
      return data.plan || 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, statsRes] = await Promise.all([
        fetch('/api/admin/payments'),
        fetch('/api/admin/stats'),
      ]);

      if (!reqRes.ok || !statsRes.ok) throw new Error('Lỗi tải dữ liệu');

      const reqData: PaymentRequest[] = await reqRes.json();
      const statsData: Stats = await statsRes.json();

      setRequests(reqData);
      setStats(statsData);
    } catch (err: any) {
      setError('Không thể tải: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivate = async (id: string, email: string) => {
    if (!window.confirm(`Kích hoạt gói cho ${email}? User reload trang là thấy gói mới ngay!`)) return;

    try {
      const res = await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, userEmail: email }),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Lỗi');

      alert('Kích hoạt thành công!');
      fetchData();
    } catch (err: any) {
      alert('Thất bại: ' + err.message);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`XÓA VĨNH VIỄN đơn hàng của ${email}? Không thể hoàn tác!`)) return;

    try {
      const res = await fetch('/api/admin/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id }),
      });

      if (!res.ok) throw new Error('Lỗi xóa');

      alert('Xóa đơn thành công!');
      fetchData();
    } catch (err: any) {
      alert('Xóa thất bại: ' + err.message);
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'PENDING_MANUAL': return 'bg-yellow-500 text-gray-900';
      case 'PENDING': return 'bg-blue-400 text-white';
      case 'SUCCESS':
      case 'COMPLETED': return 'bg-green-500 text-white';
      default: return 'bg-gray-400 text-gray-800';
    }
  };

  if (loading) return <div className="p-10 text-white bg-gray-900 min-h-screen">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-10">
      <h1 className="text-3xl font-bold text-yellow-400 mb-8">Quản Lý Đơn Hàng ({requests.length})</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-2xl">
            <p className="text-gray-300 text-sm">Hôm nay</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.todayOrders} đơn</p>
            <p className="text-xl text-green-300">{stats.todayRevenue.toLocaleString('vi-VN')} đ</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl shadow-2xl">
            <p className="text-gray-300 text-sm">Tuần này</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.weekOrders} đơn</p>
            <p className="text-xl text-green-300">{stats.weekRevenue.toLocaleString('vi-VN')} đ</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl shadow-2xl">
            <p className="text-gray-300 text-sm">Tháng này</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.monthOrders} đơn</p>
            <p className="text-xl text-green-300">{stats.monthRevenue.toLocaleString('vi-VN')} đ</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-6 rounded-xl shadow-2xl">
            <p className="text-gray-300 text-sm">Tổng tất cả</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.totalOrders} đơn</p>
            <p className="text-xl text-green-300">{stats.totalRevenue.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>
      )}

      {error && <div className="p-4 mb-4 bg-red-800 text-white rounded-lg">{error}</div>}

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-2xl">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Gói</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Số tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nội dung CK</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ghi chú</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700 text-white">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-gray-300">
                  {new Date(req.createdAt).toLocaleString('vi-VN')}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-blue-400">{req.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="font-semibold text-pink-400">{formatPlanName(req.paymentInfo)}</span>
                  <span className="block text-gray-400 text-xs">Role: {req.role}</span>
                </td>
                <td className="px-6 py-4 text-sm text-green-400 font-bold">{req.amount.toLocaleString('vi-VN')} đ</td>
                <td className="px-6 py-4 text-sm text-yellow-500 font-mono">{req.orderCode}</td>
                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">{req.note || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${getStatusClasses(req.status)}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  {req.status === 'PENDING_MANUAL' && (
                    <button
                      onClick={() => handleActivate(req.id, req.email)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 rounded-md"
                    >
                      Kích hoạt
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(req.id, req.email)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-md"
                  >
                    Xóa đơn
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Không có đơn hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ BẢO MẬT: Chỉ ADMIN vào được
export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: {} };
}