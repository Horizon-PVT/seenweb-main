/*
  Warnings:

  - A unique constraint covering the columns `[affiliateCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "affiliateCode" TEXT,
ADD COLUMN     "isAffiliate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referrerId" TEXT,
ADD COLUMN     "totalCommission" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "paymentRequestId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_requests" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "amountRequested" DECIMAL(65,30) NOT NULL,
    "amountApproved" DECIMAL(65,30),
    "bankInfo" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_affiliateCode_key" ON "users"("affiliateCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
