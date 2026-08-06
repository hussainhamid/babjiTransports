-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "estimatedFare" DROP NOT NULL,
ALTER COLUMN "advancePaid" DROP NOT NULL,
ALTER COLUMN "remainingAmount" DROP NOT NULL;
