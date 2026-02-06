const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const deleted = await prisma.promotion.deleteMany({});
        console.log(`Deleted ${deleted.count} promotions.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
