// Script: Fix user role to SUPER
// Run: npx ts-node scripts/fix-user-role.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserRole() {
    const targetEmail = 'phamthihieunhi1980@gmail.com';

    console.log(`\n🔍 Searching for user: ${targetEmail}\n`);

    // Case-insensitive search
    const user = await prisma.user.findFirst({
        where: {
            email: {
                contains: 'phamthihieu',
                mode: 'insensitive'
            }
        }
    });

    if (!user) {
        console.log('❌ User not found! Searching by similar patterns...\n');

        // Try alternative searches
        const alternatives = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: 'hieunhi', mode: 'insensitive' } },
                    { email: { contains: 'nhi1980', mode: 'insensitive' } },
                    { name: { contains: 'Nhi', mode: 'insensitive' } }
                ]
            },
            take: 10
        });

        if (alternatives.length > 0) {
            console.log('📋 Found similar users:');
            alternatives.forEach(u => {
                console.log(`   - ${u.email} | ${u.name} | Role: ${u.role}`);
            });
        } else {
            console.log('❌ No similar users found.');

            // Create new user with SUPER role
            console.log('\n🆕 Creating new user with SUPER role...');
            const newUser = await prisma.user.create({
                data: {
                    email: targetEmail.toLowerCase(),
                    name: 'Nhi Pham',
                    role: 'SUPER',
                    membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    maxDailyUsage: 50,
                    dubbingCredits: 30,
                }
            });
            console.log(`✅ Created user: ${newUser.email} with role SUPER`);
        }

        await prisma.$disconnect();
        return;
    }

    console.log(`✅ Found user:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Expiry: ${user.membershipExpiry}`);

    if (user.role === 'SUPER') {
        console.log('\n✅ User already has SUPER role!');
    } else {
        // Update to SUPER
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                role: 'SUPER',
                membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                maxDailyUsage: 50,
                dubbingCredits: { increment: 30 }
            }
        });
        console.log(`\n✅ Updated to SUPER! New expiry: ${updated.membershipExpiry}`);
    }

    await prisma.$disconnect();
}

fixUserRole().catch(console.error);
