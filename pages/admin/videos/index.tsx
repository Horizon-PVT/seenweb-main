// Admin video page - simplified
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminAuth } from '@/lib/admin/auth';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function AdminVideos({ session }: any) {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', youtubeUrl: '', thumbnailUrl: '', description: '', tags: '', status: 'DRAFT', displayOrder: 0 });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/videos');
            setVideos(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({ title: item.title, youtubeUrl: item.youtubeUrl, thumbnailUrl: item.thumbnailUrl || '', description: item.description || '', tags: item.tags || '', status: item.status, displayOrder: item.displayOrder || 0 });
        } else {
            setEditingItem(null);
            setFormData({ title: '', youtubeUrl: '', thumbnailUrl: '', description: '', tags: '', status: 'DRAFT', displayOrder: 0 });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/videos', {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem ? { ...formData, id: editingItem.id } : formData),
            });
            if (!res.ok) throw new Error('Failed');
            alert('Thành công!');
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa video này?')) return;
        try {
            await fetch('/api/admin/videos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            alert('Xóa thành công!');
            fetchData();
        } catch (error) {
            alert('Lỗi');
        }
    };

    return (
        <AdminLayout session={session}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-white">Quản lý Video Tips/Tricks</h2>
                    <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-gradient-to-r from-[#008080] to-[#CDAD5A] text-white px-4 py-2 rounded-lg hover:opacity-90">
                        <Plus size={20} /><span>Thêm Video</span>
                    </button>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tiêu đề</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">YouTube ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Đang tải...</td></tr> :
                                videos.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Chưa có video</td></tr> :
                                    videos.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-750">
                                            <td className="px-6 py-4 text-sm text-gray-300">{idx + 1}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-white">{item.title}</td>
                                            <td className="px-6 py-4 text-xs text-gray-400 font-mono">{item.youtubeId}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{item.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    {item.status === 'PUBLISHED' && <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-400 hover:bg-gray-700 rounded-lg"><Eye size={18} /></a>}
                                                    <button onClick={() => handleOpenModal(item)} className="p-2 text-yellow-400 hover:bg-gray-700 rounded-lg"><Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-gray-700 rounded-lg"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white">{editingItem ? 'Chỉnh sửa Video' : 'Thêm Video mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Tiêu đề *</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL *</label><input type="url" required value={formData.youtubeUrl} onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" placeholder="https://www.youtube.com/watch?v=..." /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL (tùy chọn - auto từ YouTube)</label><input type="url" value={formData.thumbnailUrl} onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Tags (phân cách bằng dấu phẩy)</label><input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" placeholder="tutorial, tips, youtube" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label><input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Trạng thái</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Xuất bản</option></select></div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-[#008080] to-[#CDAD5A] text-white rounded-lg hover:opacity-90">{editingItem ? 'Cập nhật' : 'Tạo mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => requireAdminAuth(context);
