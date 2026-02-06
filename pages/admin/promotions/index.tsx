// Enhanced promotions admin page with tabs for Programs and Codes
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminAuth } from '@/lib/admin/auth';
import { Plus, Edit, Trash2 } from 'lucide-react';

type PromotionType = 'PROGRAM' | 'CODE';

export default function AdminPromotions({ session }: any) {
    const [activeTab, setActiveTab] = useState<PromotionType>('CODE');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENT',
        value: 0,
        promotionType: 'CODE' as PromotionType,
        startDate: '',
        endDate: '',
        minOrder: 0,
        usageLimit: null as number | null,
        status: 'ACTIVE',
        description: '',
        imageUrl: ''
    });

    useEffect(() => { fetchData(); }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/promotions?promotionType=${activeTab}`);
            setItems(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                code: item.code,
                type: item.type,
                value: item.value,
                promotionType: item.promotionType || 'CODE',
                startDate: item.startDate ? item.startDate.split('T')[0] : '',
                endDate: item.endDate ? item.endDate.split('T')[0] : '',
                minOrder: item.minOrder || 0,
                usageLimit: item.usageLimit || null,
                status: item.status,
                description: item.description || '',
                imageUrl: item.imageUrl || '',
            });
        } else {
            setEditingItem(null);
            setFormData({
                code: '',
                type: 'PERCENT',
                value: 0,
                promotionType: activeTab,
                startDate: '',
                endDate: '',
                minOrder: 0,
                usageLimit: null,
                status: 'ACTIVE',
                description: '',
                imageUrl: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/promotions', {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem ? { ...formData, id: editingItem.id } : formData),
            });
            if (!res.ok) throw new Error('Failed');
            alert('Thành công!');
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert('Lỗi');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa khuyến mại này?')) return;
        try {
            await fetch('/api/admin/promotions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
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
                    <h2 className="text-3xl font-bold text-white">Quản lý Khuyến mại</h2>
                    <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-gradient-to-r from-[#008080] to-[#CDAD5A] text-white px-4 py-2 rounded-lg hover:opacity-90">
                        <Plus size={20} /><span>Thêm {activeTab === 'CODE' ? 'mã KM' : 'chương trình'}</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('CODE')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'CODE'
                            ? 'text-[#CDAD5A] border-b-2 border-[#CDAD5A]'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Mã khuyến mại
                    </button>
                    <button
                        onClick={() => setActiveTab('PROGRAM')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'PROGRAM'
                            ? 'text-[#CDAD5A] border-b-2 border-[#CDAD5A]'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Chương trình khuyến mại
                    </button>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Mã</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Giá trị</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Đơn tối thiểu</th>
                                {activeTab === 'CODE' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Lượt dùng</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Đang tải...</td></tr> :
                                items.length === 0 ? <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Chưa có {activeTab === 'CODE' ? 'mã khuyến mại' : 'chương trình'}</td></tr> :
                                    items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-750">
                                            <td className="px-6 py-4 text-sm font-bold text-[#CDAD5A]">{item.code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{item.type === 'PERCENT' ? 'Phần trăm' : item.type === 'FIXED' ? 'Cố định' : 'Tặng ngày'}</td>
                                            <td className="px-6 py-4 text-sm text-white font-bold">{item.type === 'PERCENT' ? `${item.value}%` : item.type === 'FIXED' ? `${parseInt(item.value).toLocaleString('vi-VN')} đ` : `+${parseInt(item.value)} ngày`}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{item.minOrder ? `${parseInt(item.minOrder).toLocaleString('vi-VN')} đ` : 'Không'}</td>
                                            {activeTab === 'CODE' && (
                                                <td className="px-6 py-4 text-sm text-gray-300">
                                                    {item.usageCount || 0} / {item.usageLimit || '∞'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-xs text-gray-400">
                                                {item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{item.status === 'ACTIVE' ? 'Hoạt động' : 'Tắt'}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-2">
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
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white">{editingItem ? 'Chỉnh sửa' : 'Thêm'} {formData.promotionType === 'CODE' ? 'mã KM' : 'chương trình'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Loại khuyến mại *</label><select value={formData.promotionType} onChange={(e) => setFormData({ ...formData, promotionType: e.target.value as PromotionType })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"><option value="CODE">Mã khuyến mại</option><option value="PROGRAM">Chương trình khuyến mại</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Mã *</label><input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Ảnh banner (Tùy chọn)</label>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const data = new FormData();
                                                data.append('file', file);

                                                try {
                                                    const res = await fetch('/api/admin/upload', {
                                                        method: 'POST',
                                                        body: data,
                                                    });
                                                    const json = await res.json();
                                                    if (json.url) {
                                                        setFormData({ ...formData, imageUrl: json.url });
                                                    } else {
                                                        alert('Upload failed: ' + (json.error || 'Unknown error'));
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Upload error');
                                                }
                                            }}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#CDAD5A] file:text-black hover:file:bg-[#bfa04d]"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Hỗ trợ JPG, PNG. Tối đa 5MB.</p>
                                    </div>
                                    {formData.imageUrl && (
                                        <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-600 group">
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Loại giảm giá *</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"><option value="PERCENT">Phần trăm (%)</option><option value="FIXED">Cố định (VND)</option><option value="BONUS_DAYS">Tặng thêm ngày</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">{formData.type === 'BONUS_DAYS' ? 'Số ngày tặng thêm *' : 'Giá trị *'}</label><input type="number" required value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })} placeholder={formData.type === 'BONUS_DAYS' ? 'VD: 15 (tặng thêm 15 ngày)' : ''} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Đơn tối thiểu</label><input type="number" value={formData.minOrder} onChange={(e) => setFormData({ ...formData, minOrder: parseFloat(e.target.value) })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>
                            {formData.promotionType === 'CODE' && (
                                <div><label className="block text-sm font-medium text-gray-300 mb-2">Giới hạn lượt dùng (để trống = không giới hạn)</label><input type="number" value={formData.usageLimit || ''} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-300 mb-2">Ngày bắt đầu</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-2">Ngày kết thúc</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Trạng thái</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"><option value="ACTIVE">Hoạt động</option><option value="INACTIVE">Tắt</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]" /></div>

                            {/* Image Upload */}


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
