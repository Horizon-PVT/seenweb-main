import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'test@app.localhost';
    const password = '123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash: hashedPassword, role: 'PRO' },
        create: {
            email,
            name: 'Local Test User',
            passwordHash: hashedPassword,
            role: 'PRO',
            dailyUsage: 0,
        },
    });

    console.log('Successfully created test user:', user.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
