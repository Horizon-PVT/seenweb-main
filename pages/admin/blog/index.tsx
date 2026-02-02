import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminAuth } from '@/lib/admin/auth';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    summary: string | null;
    content: string;
    status: string;
    createdAt: string;
    category: { name: string } | null;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Props {
    session: any;
}

export default function AdminBlog({ session }: Props) {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setFormData(prev => ({ ...prev, coverImage: data.url }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('Lỗi tải ảnh lêng');
        } finally {
            setUploading(false);
            // Reset input value to allow re-selecting same file if needed
            e.target.value = '';
        }
    };

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        coverImage: '',
        summary: '',
        content: '',
        categoryId: '',
        status: 'DRAFT',
    });

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, [searchQuery, statusFilter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/admin/blog?${params}`);
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/blog-categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleOpenModal = (post?: BlogPost) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                slug: post.slug,
                coverImage: post.coverImage || '',
                summary: post.summary || '',
                content: post.content,
                categoryId: (post.category as any)?.id || '',
                status: post.status,
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                slug: '',
                coverImage: '',
                summary: '',
                content: '',
                categoryId: '',
                status: 'DRAFT',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPost(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingPost ? 'PUT' : 'POST';
            const body = editingPost
                ? { ...formData, id: editingPost.id }
                : formData;

            const res = await fetch('/api/admin/blog', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                throw new Error('Failed to save post');
            }

            alert(editingPost ? 'Cập nhật thành công!' : 'Tạo bài viết thành công!');
            handleCloseModal();
            fetchPosts();
        } catch (error) {
            alert('Có lỗi xảy ra, vui lòng thử lại');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

        try {
            const res = await fetch('/api/admin/blog', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                throw new Error('Failed to delete post');
            }

            alert('Xóa thành công!');
            fetchPosts();
        } catch (error) {
            alert('Có lỗi xảy ra');
            console.error(error);
        }
    };

    return (
        <AdminLayout session={session}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-white">Quản lý Blog</h2>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center space-x-2 bg-gradient-to-r from-[#008080] to-[#CDAD5A] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Plus size={20} />
                        <span>Thêm bài viết</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề hoặc slug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="DRAFT">Bản nháp</option>
                        <option value="PUBLISHED">Đã xuất bản</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tiêu đề</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Danh mục</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ngày tạo</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                            Đang tải...
                                        </td>
                                    </tr>
                                ) : posts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                            Chưa có bài viết nào
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post, index) => (
                                        <tr key={post.id} className="hover:bg-gray-750">
                                            <td className="px-6 py-4 text-sm text-gray-300">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{post.title}</p>
                                                    <p className="text-xs text-gray-400">/{post.slug}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {post.category?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${post.status === 'PUBLISHED'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {post.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    {post.status === 'PUBLISHED' && (
                                                        <a
                                                            href={`/blog/${post.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                                                            title="Xem bài viết"
                                                        >
                                                            <Eye size={18} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleOpenModal(post)}
                                                        className="p-2 text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white">
                                {editingPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tiêu đề *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Slug (để trống để tự động tạo)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Ảnh bìa
                                </label>

                                {/* Image Upload UI */}
                                <div className="space-y-4">
                                    {formData.coverImage ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-gray-600">
                                            <img
                                                src={formData.coverImage}
                                                alt="Cover Preview"
                                                className="w-full h-64 object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, coverImage: '' })}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-[#CDAD5A] transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                disabled={uploading}
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                            {uploading ? (
                                                <div className="flex flex-col items-center text-[#CDAD5A]">
                                                    <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mb-2" />
                                                    <span>Đang tải ảnh lên...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <div className="p-3 bg-gray-700 rounded-full mb-3">
                                                        <Plus size={24} />
                                                    </div>
                                                    <p className="font-medium">Nhấn để tải ảnh lên</p>
                                                    <p className="text-xs mt-1">PNG, JPG, GIF (Max 10MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Fallback URL Input (Optional, kept hidden or secondary if needed, or just replaced) */}
                                    {/* <input
                                        type="url"
                                        placeholder="Hoặc nhập URL ảnh..."
                                        value={formData.coverImage}
                                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                                    /> */}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tóm tắt
                                </label>
                                <textarea
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nội dung (Markdown) *
                                </label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={12}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Danh mục
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                                >
                                    <option value="">Không có danh mục</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Trạng thái
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#CDAD5A]"
                                >
                                    <option value="DRAFT">Bản nháp</option>
                                    <option value="PUBLISHED">Xuất bản</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-[#008080] to-[#CDAD5A] text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    {editingPost ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return requireAdminAuth(context);
};
