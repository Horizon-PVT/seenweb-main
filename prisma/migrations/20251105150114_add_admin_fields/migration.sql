-- AlterTable
ALTER TABLE "PaymentRequest" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "note" TEXT;
