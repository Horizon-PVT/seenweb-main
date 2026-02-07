// Script: Fix user role to PRO
// Usage: npx ts-node scripts/fix-user-role.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetEmail = process.argv[2];

    if (!targetEmail) {
        console.log('Usage: npx ts-node scripts/fix-user-role.ts <email>');
        console.log('Example: npx ts-node scripts/fix-user-role.ts user@example.com');
        process.exit(1);
    }

    console.log(`\n🔍 Looking up user: ${targetEmail}`);

    try {
        // Check current user
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: targetEmail,
                    mode: 'insensitive'
                }
            }
        });

        if (!user) {
            console.log('\n❌ User not found in database.');
            console.log('\nOptions:');
            console.log('1. User might not have logged in yet');
            console.log('2. Email might be different (check case)');

            // Offer to create
            console.log('\n🆕 Creating new user with PRO role...');
            const newUser = await prisma.user.create({
                data: {
                    email: targetEmail.toLowerCase(),
                    role: 'PRO',
                    membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    maxDailyUsage: 50,
                    dubbingCredits: 30,
                }
            });
            console.log(`✅ Created user: ${newUser.email} with role PRO`);
            return;
        }

        console.log(`\n📋 Current Status:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Expiry: ${user.membershipExpiry}`);
        console.log(`   Daily Usage: ${user.dailyUsage}/${user.maxDailyUsage}`);

        if (user.role === 'PRO') {
            console.log('\n✅ User already has PRO role!');
        } else {
            // Update to PRO
            const updated = await prisma.user.update({
                where: { id: user.id },
                data: {
                    role: 'PRO',
                    membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    maxDailyUsage: 50,
                    dubbingCredits: 30,
                }
            });
            console.log(`\n✅ Updated to PRO! New expiry: ${updated.membershipExpiry}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
