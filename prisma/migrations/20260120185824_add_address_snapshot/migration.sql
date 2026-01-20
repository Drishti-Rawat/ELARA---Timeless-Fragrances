/*
  Warnings:

  - You are about to drop the column `address` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "tag" TEXT NOT NULL DEFAULT 'Home',
ALTER COLUMN "country" SET DEFAULT 'India';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "address",
ADD COLUMN     "deliveryAddress" JSONB;
