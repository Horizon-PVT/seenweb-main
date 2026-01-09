const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating Bot Avatars...');

    const bots = await prisma.user.findMany({
        where: { role: 'BOT' }
    });

    for (const bot of bots) {
        // Use Dicebear 'Avataaars' or 'Notionists' or 'Open Peeps'
        // 'Notionists' has a nice sketchy/tech vibe.
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(bot.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`;

        await prisma.user.update({
            where: { id: bot.id },
            data: { image: avatarUrl }
        });
        console.log(`- Updated ${bot.name} -> ${avatarUrl}`);
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
