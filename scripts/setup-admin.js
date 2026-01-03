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

        console.log('\n📝 Admin credentials:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('\n⚠️  REMEMBER TO CHANGE THE PASSWORD AFTER FIRST LOGIN!\n');

    } catch (error) {
        console.error('❌ Error setting up admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupAdmin();
