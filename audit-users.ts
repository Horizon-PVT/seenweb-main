import { prisma } from './lib/prisma';
import { subMonths, subDays } from 'date-fns';

async function auditUsers() {
    console.log("=== BẮT ĐẦU QUÉT TÀI KHOẢN ===");
    
    const now = new Date();
    const oneMonthAgo = subMonths(now, 1);

    // 1. TÀI KHOẢN DÙNG CHÙA (Đã hết hạn nhưng Database vẫn ghi là BASIC/PRO)
    // Sau bản fix hôm qua, hệ thống chặn truy cập nhưng Database vẫn giữ nguyên Role cũ.
    // Lần đăng nhập tới hệ thống mới tự hạ quyền, hoạc chúng ta có thể hạ quyền hàng loạt.
    const expiredPremiumUsers = await prisma.user.findMany({
        where: {
            role: { in: ['BASIC', 'PRO'] },
            membershipExpiry: { lt: now }
        },
        select: {
            email: true, role: true, membershipExpiry: true, createdAt: true
        }
    });

    console.log("\n[1] DANH SÁCH TÀI KHOẢN DÙNG CHÙA (Đã hết hạn nhưng Role vẫn là PRO/BASIC):");
    console.log(`Số lượng: ${expiredPremiumUsers.length} tài khoản`);
    expiredPremiumUsers.forEach(u => {
        console.log(`- Email: ${u.email} | Gói cũ: ${u.role} | Hết hạn từ: ${u.membershipExpiry?.toLocaleDateString('vi-VN')}`);
    });

    // 2. KHÁCH ĐĂNG KÝ QUANH THỜI ĐIỂM 1 THÁNG TRƯỚC (Hết hạn hoặc sắp hết hạn)
    // Giả sử lấy những người tạo tài khoản từ mốc 1 tháng trước (± 3 ngày)
    const exactOneMonthAgoStart = subDays(oneMonthAgo, 3);
    const exactOneMonthAgoEnd = subMonths(subDays(now, -3), 1); // around 1 month ago + 3 days
    
    const oneMonthAgoUsers = await prisma.user.findMany({
        where: {
            createdAt: {
                gte: exactOneMonthAgoStart,
                lte: exactOneMonthAgoEnd
            }
        },
        select: { email: true, role: true, createdAt: true, membershipExpiry: true }
    });

    console.log("\n[2] TÀI KHOẢN ĐĂNG KÝ TRÒN 1 THÁNG TRƯỚC (Quanh mốc 15/02/2026):");
    console.log(`Số lượng tìm thấy: ${oneMonthAgoUsers.length}`);
    oneMonthAgoUsers.forEach(u => {
        const status = (u.membershipExpiry && u.membershipExpiry < now) ? "Đã Hết Hạn" : ((u.membershipExpiry && u.membershipExpiry >= now) ? "Còn Hạn" : "Vĩnh viễn/Miễn phí");
        console.log(`- ${u.email} | Đăng ký: ${u.createdAt.toLocaleDateString('vi-VN')} | Role: ${u.role} | Trạng thái: ${status}`);
    });

    // 3. KHÁCH ĐĂNG KÝ TRONG VÒNG 1 THÁNG ĐỔ LẠI (TỪ 15/02/2026 ĐẾN NAY)
    const recentUsersGrouped = await prisma.user.groupBy({
        by: ['role'],
        where: {
            createdAt: { gte: oneMonthAgo }
        },
        _count: {
            email: true
        }
    });

    console.log("\n[3] THỐNG KÊ TÀI KHOẢN MỚI TẠO TRONG 1 THÁNG QUA:");
    let totalRecent = 0;
    recentUsersGrouped.forEach(group => {
        console.log(`- Gói ${group.role}: ${group._count.email} người`);
        totalRecent += group._count.email;
    });
    console.log(`-> Tổng người dùng đăng ký mới trong 1 tháng qua: ${totalRecent}`);

    console.log("\n=== HẾT BÁO CÁO ===");
}

auditUsers().catch(console.error).finally(() => process.exit(0));
