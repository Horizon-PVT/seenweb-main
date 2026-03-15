import { prisma } from './lib/prisma';
import { checkUserQuota } from './lib/quota';
import { authOptions } from './pages/api/auth/[...nextauth]';

async function runTest() {
    console.log("--- BẮT ĐẦU TEST LOGIC HẾT HẠN ---");
    
    // 1. Tạo một user nháp đã hết hạn từ hôm qua
    const testEmail = 'test_expired_user@seenyt.net';
    
    // Clean up first just in case
    await prisma.user.deleteMany({
        where: { email: testEmail }
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const testUser = await prisma.user.create({
        data: {
            email: testEmail,
            name: "Test Expired",
            role: "PRO", // Cấp quyền PRO
            membershipExpiry: yesterday, // Đã hết hạn
        }
    });

    console.log(`[1] Đã tạo User Test: ${testUser.email} - Role: ${testUser.role} - Hết hạn thực tế: ${testUser.membershipExpiry}`);

    // 2. Thử truy cập Auth / Lấy Session Token
    // Simulate what happens in JWT callback
    console.log("\n[2] Kiểm tra JWT Auth Session (Giao diện web):");
    let simulatedTokenRole = testUser.role;
    let effectiveRole = testUser.role;
    const now = new Date();
    const isAdmin = testUser.role === 'ADMIN';

    if (!isAdmin && testUser.membershipExpiry && new Date(testUser.membershipExpiry) < now) {
        effectiveRole = 'FREE';
    }
    
    console.log(`    -> Giao diện web sẽ nhận diện Role là: ${effectiveRole} (Sẽ báo FREE thay vì PRO)`);

    // 3. Thử gọi API tốn Quota (Backend)
    console.log("\n[3] Kiểm tra Quota Backend (Khi khách cố bấm tạo kịch bản / dùng AI Tool):");
    try {
        // Niche Engine is PRO only
        await checkUserQuota(testUser.id, 'niche-engine');
        console.log("    -> LỖI!!! Không bị văng lổi, được phép truy cập (LOGIC CHƯA CHUẨN).");
    } catch (error: any) {
        console.log(`    -> KẾT QUẢ ĐÚNG: Bị chặn thành công với mã lỗi: ${error.message} (Khách sẽ thấy Popup mời Nạp tiền)`);
    }

    // 4. Test lại với Admin để đảm bảo Admin ko bị khoá
    console.log("\n[4] Kiểm tra với quyền ADMIN đã hết hạn (Vẫn phải cho pass):");
    const testAdminEmail = 'test_admin_expired@seenyt.net';
    await prisma.user.deleteMany({
        where: { email: testAdminEmail }
    });
    
    const adminUser = await prisma.user.create({
        data: {
            email: testAdminEmail,
            role: "ADMIN",
            membershipExpiry: yesterday, 
        }
    });

    try {
        await checkUserQuota(adminUser.id, 'niche-engine');
        console.log("    -> KẾT QUẢ ĐÚNG: Admin được phép truy cập vô tư, bất kể ngày tháng.");
    } catch (error: any) {
        console.log(`    -> LỖI!!! Admin bị chặn: ${error.message}`);
    }

    // Dọn dẹp
    await prisma.user.deleteMany({
        where: { email: { in: [testEmail, testAdminEmail] } }
    });
    console.log("\n--- HOÀN TẤT DỌN DẸP TEST ---");
}

runTest()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
