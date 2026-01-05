-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "promotionType" TEXT NOT NULL DEFAULT 'CODE',
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usageLimit" INTEGER;
