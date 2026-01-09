const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // First delete progress records (child)
    const deletedProgress = await prisma.teacherRoadmapProgress.deleteMany({});
    console.log(`Deleted ${deletedProgress.count} progress record(s)`);

    // Then delete roadmaps (parent)
    const deletedRoadmaps = await prisma.teacherRoadmap.deleteMany({});
    console.log(`Deleted ${deletedRoadmaps.count} roadmap(s)`);

    console.log('Done! You can now create a new roadmap.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
