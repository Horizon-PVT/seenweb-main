const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BOT_NAMES = [
    "Minh Trí", "Tuấn Anh", "Quốc Bảo", "Hoàng Long", "Đức Anh", "Văn Hưng",
    "Thanh Tùng", "Minh Khôi", "Gia Huy", "Thái Sơn", "Đức Minh", "Bảo Nam",
    "Hoàng Minh", "Tiến Dũng", "Quang Huy", "Mạnh Hùng", "Thế Anh", "Tuấn Kiệt"
];

const BG_COLORS = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'
];

async function main() {
    console.log('Seeding Bots...');

    // 1. Create System Setting
    await prisma.systemSetting.upsert({
        where: { key: 'AUTO_CHAT_ENABLED' },
        update: {},
        create: { key: 'AUTO_CHAT_ENABLED', value: 'true' }
    });
    console.log('- Auto Chat Setting: ENABLED');

    // 2. Create Bots
    for (let i = 0; i < BOT_NAMES.length; i++) {
        const name = BOT_NAMES[i];
        const email = `bot${i}@seenyt.net`; // Fake email

        await prisma.user.upsert({
            where: { email },
            update: {
                name,
                role: 'BOT', // Assign BOT role
                image: null, // Let frontend generate avatar
                // Store color in DB? Or just random on frontend? 
                // Simplest: no image, handled by UI.
            },
            create: {
                email,
                name,
                passwordHash: 'seeded_bot_password',
                role: 'BOT'
            }
        });
        console.log(`- Seeded Bot: ${name}`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
