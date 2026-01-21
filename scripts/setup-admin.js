// File: scripts/setup-admin.js
// Script to create/update admin user with password
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupAdmin() {
    const adminEmail = 'phamanhtung.jp@gmail.com';
    const adminPassword = 'admin123456'; // Change this to desired password

    console.log('🔧 Setting up admin user...');

    try {
        // Hash password
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        console.log('✅ Password hashed');

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingUser) {
            // Update existing user
            await prisma.user.update({
                where: { email: adminEmail },
                data: {
                    role: 'ADMIN',
                    passwordHash,
                },
            });
            console.log(`✅ Updated existing user ${adminEmail} to ADMIN with password`);
        } else {
            // Create new admin user
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    name: 'Admin',
                    role: 'ADMIN',
                    passwordHash,
                    dailyUsage: 0,
                    maxDailyUsage: 999999,
                    isAffiliate: false,
                    totalCommission: 0,
                },
            });
            console.log(`✅ Created new admin user ${adminEmail}`);
        }

        const employees = [
            'linhtrangyeubome7879@gmail.com',
            'Nguyenhiep.victory@gmail.com'
        ];

        // Admin setup
        // ... (Keep existing admin logic if needed, or just focus on employees)
        // Let's keep Admin logic for safety
        // ...

        // Employee setup
        for (const email of employees) {
            const passwordHash = await bcrypt.hash('seenyt2024', 10);
            const user = await prisma.user.findUnique({ where: { email } });

            if (user) {
                await prisma.user.update({
                    where: { email },
                    data: { role: 'VIP', dailyUsage: 0, maxDailyUsage: 9999 } // VIP role = highest after ADMIN
                });
                console.log(`✅ Updated employee ${email} to VIP`);
            } else {
                await prisma.user.create({
                    data: {
                        email,
                        name: email.split('@')[0],
                        role: 'VIP',
                        passwordHash,
                        dailyUsage: 0,
                        maxDailyUsage: 9999
                    }
                });
                console.log(`✅ Created employee ${email} as VIP`);
            }
        }

        console.log('\n📝 Employee password: seenyt2024');

    } catch (error) {
        console.error('❌ Error setting up admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupAdmin();
