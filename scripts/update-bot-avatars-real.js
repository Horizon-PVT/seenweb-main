const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Switching Bot Avatars to Real Photos...');

    const bots = await prisma.user.findMany({
        where: { role: 'BOT' }
    });

    for (let i = 0; i < bots.length; i++) {
        const bot = bots[i];
        // Alternate male/female roughly or just random. 
        // User names are mixed, but let's just do random gender for now or alternate based on index to ensure variety.
        const gender = i % 2 === 0 ? 'men' : 'women';
        const randomId = Math.floor(Math.random() * 90); // 0-99 available

        const avatarUrl = `https://randomuser.me/api/portraits/${gender}/${randomId}.jpg`;

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
