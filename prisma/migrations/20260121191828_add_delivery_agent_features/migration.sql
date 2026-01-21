-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'DELIVERY_AGENT';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "agentCommission" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryAgentId" TEXT,
ADD COLUMN     "deliveryOtp" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "vehicleDetails" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryAgentId_fkey" FOREIGN KEY ("deliveryAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
