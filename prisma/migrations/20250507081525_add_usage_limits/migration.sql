-- AlterTable
ALTER TABLE "User" ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usageResetDate" TIMESTAMP(3);
