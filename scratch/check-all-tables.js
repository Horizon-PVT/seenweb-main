const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tables = ['user', 'account', 'session', 'marketplaceListing', 'marketplaceTransaction', 'event', 'referral', 'payout', 'ebook', 'videoTip'];
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`Table ${table}: OK (${count} rows)`);
      } catch (e) {
        console.error(`Table ${table}: FAILED - ${e.message}`);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
