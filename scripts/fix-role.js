const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Update phamanhtung.jp@gmail.com to ADMIN
    const user = await prisma.user.update({
        where: { email: 'phamanhtung.jp@gmail.com' },
        data: { role: 'ADMIN' }
    });

    console.log('Updated user:', user.email, 'to role:', user.role);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
