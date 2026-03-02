const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    const leads = await prisma.zoomRegistration.findMany();
    console.log("Registered leads:", leads);
}

checkDb();
