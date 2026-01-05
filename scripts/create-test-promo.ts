// scripts/create-test-promo.ts
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Delete existing TEST code if exists
    const existing = await prisma.promotion.findUnique({
        where: { code: 'TEST' }
    });

    if (existing) {
        await prisma.promotion.delete({ where: { code: 'TEST' } });
        console.log('Deleted existing TEST code');
    }

    // Create new TEST promo code
    // Schema: type='PERCENT' or 'FIXED', value=10, promotionType='CODE' or 'PROGRAM'
    const promo = await prisma.promotion.create({
        data: {
            code: 'TEST',
            type: 'PERCENT',        // PERCENT or FIXED
            value: 10,              // Discount value (10%)
            promotionType: 'CODE',  // CODE or PROGRAM
            status: 'ACTIVE',
            minOrder: 0,
            usageLimit: null
        }
    });

    console.log('Created promo code:', promo);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
