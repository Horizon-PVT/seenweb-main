// scripts/manage-user.js - Quản lý user thay cho Prisma Studio
// Usage:
//   node scripts/manage-user.js list              - Hiển thị tất cả users
//   node scripts/manage-user.js add email role    - Thêm/cập nhật user (role: FREE, CREATIVE, SUPER, VIP, ADMIN)
//   node scripts/manage-user.js delete email      - Xóa user

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const [, , action, email, role] = process.argv;

    if (!action) {
        console.log(`
📋 SEENYT USER MANAGER
======================
Cách dùng:
  node scripts/manage-user.js list              - Xem danh sách users
  node scripts/manage-user.js add <email> <role> - Thêm/sửa user
  node scripts/manage-user.js delete <email>     - Xóa user

Các role: FREE, CREATIVE, SUPER, VIP, ADMIN
        `);
        return;
    }

    switch (action.toLowerCase()) {
        case 'list':
            const users = await prisma.user.findMany({
                select: { id: true, email: true, name: true, role: true, dailyUsage: true },
                orderBy: { createdAt: 'desc' },
                take: 50
            });
            console.log('\n📋 DANH SÁCH USERS (50 gần nhất):');
            console.log('─'.repeat(80));
            users.forEach((u, i) => {
                console.log(`${i + 1}. ${u.email.padEnd(35)} | ${u.role.padEnd(10)} | Usage: ${u.dailyUsage}`);
            });
            console.log('─'.repeat(80));
            console.log(`Tổng: ${users.length} users`);
            break;

        case 'add':
            if (!email || !role) {
                console.log('❌ Thiếu tham số! Ví dụ: node scripts/manage-user.js add user@email.com VIP');
                return;
            }
            const validRoles = ['FREE', 'CREATIVE', 'SUPER', 'VIP', 'ADMIN'];
            if (!validRoles.includes(role.toUpperCase())) {
                console.log(`❌ Role không hợp lệ! Chọn: ${validRoles.join(', ')}`);
                return;
            }

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                await prisma.user.update({
                    where: { email },
                    data: { role: role.toUpperCase(), dailyUsage: 0, maxDailyUsage: 9999 }
                });
                console.log(`✅ Đã CẬP NHẬT: ${email} → ${role.toUpperCase()}`);
            } else {
                await prisma.user.create({
                    data: {
                        email,
                        name: email.split('@')[0],
                        role: role.toUpperCase(),
                        dailyUsage: 0,
                        maxDailyUsage: 9999
                    }
                });
                console.log(`✅ Đã TẠO MỚI: ${email} → ${role.toUpperCase()}`);
            }
            break;

        case 'delete':
            if (!email) {
                console.log('❌ Thiếu email! Ví dụ: node scripts/manage-user.js delete user@email.com');
                return;
            }
            const toDelete = await prisma.user.findUnique({ where: { email } });
            if (!toDelete) {
                console.log(`❌ Không tìm thấy user: ${email}`);
                return;
            }
            await prisma.user.delete({ where: { email } });
            console.log(`🗑️ Đã XÓA: ${email}`);
            break;

        default:
            console.log(`❌ Lệnh không hợp lệ: ${action}`);
            console.log('Các lệnh: list, add, delete');
    }

    await prisma.$disconnect();
}

main().catch(e => {
    console.error('❌ Lỗi:', e.message);
    prisma.$disconnect();
    process.exit(1);
});
