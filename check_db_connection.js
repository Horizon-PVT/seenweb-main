// script to check db
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
console.log("Testing DB Connection...");
console.log("URL:", process.env.DATABASE_URL?.substring(0, 20) + "...");

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log("✅ Connection Successful!");
        const count = await prisma.user.count();
        console.log("✅ User count:", count);
        process.exit(0);
    } catch (e) {
        console.error("❌ Connection Failed:", e);
        process.exit(1);
    }
}

main();
