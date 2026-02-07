// pages/admin/users.tsx - Trang quản lý Users trong Admin Panel
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    dailyUsage: number;
    maxDailyUsage: number;
    createdAt: string;
}

const ROLES = ['FREE', 'BASIC', 'PRO', 'ADMIN'];

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ email: '', name: '', role: 'FREE' });
    const [saving, setSaving] = useState(false);

    // Check auth
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin/login');
        }
    }, [status, router]);

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?search=${search}&page=${page}&limit=30`);
            const data = await res.json();
            setUsers(data.users || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (status === 'authenticated') fetchUsers();
    }, [status, page]);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    // Open modal for create/edit
    const openModal = (user?: User) => {
        if (user) {
            setEditUser(user);
            setFormData({ email: user.email, name: user.name || '', role: user.role });
        } else {
            setEditUser(null);
            setFormData({ email: '', name: '', role: 'FREE' });
        }
        setShowModal(true);
    };

    // Save user
    const handleSave = async () => {
        setSaving(true);
        try {
            const method = editUser ? 'PUT' : 'POST';
            const body = editUser
                ? { id: editUser.id, ...formData }
                : formData;

            const res = await fetch('/api/admin/users', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setShowModal(false);
                fetchUsers();
            } else {
                alert('Lỗi: ' + data.error);
            }
        } catch (e: any) {
            alert('Lỗi: ' + e.message);
        }
        setSaving(false);
    };

    // Delete user
    const handleDelete = async (user: User) => {
        if (!confirm(`Xác nhận xóa user: ${user.email}?`)) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchUsers();
            } else {
                alert('Lỗi: ' + data.error);
            }
        } catch (e: any) {
            alert('Lỗi: ' + e.message);
        }
    };

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">👥 Quản lý Users</h1>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Thêm User
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Tìm theo email hoặc tên..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg">
                        Tìm kiếm
                    </button>
                </form>

                {/* Stats */}
                <p className="text-sm text-gray-500 mb-4">Tổng: {total} users</p>

                {/* Table */}
                <div className="bg-white rounded-xl shadow overflow-x-auto">
                    <table className="w-full text-sm text-gray-800">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left w-[200px]">Tên</th>
                                <th className="px-4 py-3 text-center">Role</th>
                                <th className="px-4 py-3 text-center">Usage</th>
                                <th className="px-4 py-3 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-8">Đang tải...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8">Không có user</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="border-t hover:bg-gray-50 text-gray-800">
                                    <td className="px-4 py-3 font-medium text-gray-900">{user.email}</td>
                                    <td className="px-4 py-3">{user.name || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                            user.role === 'PRO' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'BASIC' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">{user.dailyUsage}/{user.maxDailyUsage}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => openModal(user)}
                                            className="px-2 py-1 text-blue-600 hover:underline mr-2"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user)}
                                            className="px-2 py-1 text-red-600 hover:underline"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        ← Trước
                    </button>
                    <span className="px-3 py-1">Trang {page}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={users.length < 30}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Sau →
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editUser ? 'Sửa User' : 'Thêm User Mới'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    disabled={!!editUser}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
