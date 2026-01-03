import { GetServerSideProps } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminAuth } from '@/lib/admin/auth';

export default function AdminSettings({ session }: any) {
    return (
        <AdminLayout session={session}>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Cài đặt hệ thống</h2>

                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                    <p className="text-gray-300 text-lg">
                        Phần cài đặt hệ thống sẽ được mở rộng trong tương lai.
                    </p>

                    <div className="mt-8 space-y-4">
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <h3 className="text-white font-bold mb-2">Cấu hình site</h3>
                            <p className="text-gray-400 text-sm">Logo, tên site, metadata SEO...</p>
                        </div>
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <h3 className="text-white font-bold mb-2">Email templates</h3>
                            <p className="text-gray-400 text-sm">Mẫu email gửi tự động...</p>
                        </div>
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <h3 className="text-white font-bold mb-2">Payment gateway</h3>
                            <p className="text-gray-400 text-sm">Cấu hình PayOS, Stripe...</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => requireAdminAuth(context);
