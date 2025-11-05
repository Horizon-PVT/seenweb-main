-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyUsage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxDailyUsage" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'EXPLORER';

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "txn" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);
