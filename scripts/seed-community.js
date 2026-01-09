const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const channels = [
        // --- 1. SẢNH CHUNG ---
        {
            slug: 'global',
            name: 'Sảnh Chung',
            icon: '🏠',
            description: 'Chém gió tổng hợp, chào hỏi nhau.',
            category: 'GENERAL',
            type: 'CHAT',
            isLocked: false
        },
        // --- 2. HÀNH TRÌNH (ZONES) ---
        {
            slug: 'newbie',
            name: 'Newbie Zone (0-1K)',
            icon: '🚀',
            description: 'Hỏi đáp ngây ngô cho người mới bắt đầu.',
            category: 'GROWTH',
            type: 'CHAT',
            isLocked: false
        },
        {
            slug: 'growth',
            name: 'Growth Zone (1K-10K)',
            icon: '🔥',
            description: 'Chiến lược tăng trưởng, tối ưu CTR/Retention.',
            category: 'GROWTH',
            type: 'CHAT',
            isLocked: false
        },
        {
            slug: 'scale',
            name: 'Scale Zone (10K+)',
            icon: '💎',
            description: 'Mở rộng team, kinh doanh, systemize.',
            category: 'GROWTH',
            type: 'CHAT',
            isLocked: false // Could be locked in future
        },
        // --- 3. CHUYÊN MÔN ---
        {
            slug: 'tech',
            name: 'Edit & Tech',
            icon: '🎬',
            description: 'Kỹ thuật edit, quay phim, setup studio.',
            category: 'SPECIAL',
            type: 'CHAT',
            isLocked: false
        },
        {
            slug: 'review',
            name: 'Review & Collab',
            icon: '🤝',
            description: 'Review kênh chéo, tìm người hợp tác.',
            category: 'SPECIAL',
            type: 'CHAT',
            isLocked: false
        },
        // --- 4. SHOWCASE & VIP ---
        {
            slug: 'flex',
            name: 'Flex Room',
            icon: '🏆',
            description: 'Showcase thành tích thật. Số liệu thật.',
            category: 'SPECIAL',
            type: 'SHOWCASE', // <--- Quan trọng: Render Card
            isLocked: false
        },
        {
            slug: 'vip',
            name: 'VIP Room',
            icon: '👑',
            description: 'Deep Insight, Case Study kín.',
            category: 'General',
            type: 'CHAT',
            isLocked: true
        }
    ];

    console.log('Seeding V2 channels...');

    for (const channel of channels) {
        await prisma.chatChannel.upsert({
            where: { slug: channel.slug },
            update: channel,
            create: channel,
        });
        console.log(`- Upserted: ${channel.name} [${channel.type}]`);
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
