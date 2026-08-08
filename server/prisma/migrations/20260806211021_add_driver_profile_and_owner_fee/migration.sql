-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "registrationFeePaid" BOOLEAN NOT NULL DEFAULT false;
