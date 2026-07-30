/*
  Warnings:

  - You are about to drop the column `available` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Vehicle` table. All the data in the column will be lost.
  - Added the required column `category` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transmission` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleName` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `fuelType` on the `Vehicle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('PASSENGER', 'GOODS');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "available",
DROP COLUMN "capacity",
DROP COLUMN "name",
DROP COLUMN "type",
ADD COLUMN     "category" "VehicleCategory" NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "loadCapacity" TEXT,
ADD COLUMN     "transmission" "Transmission" NOT NULL,
ADD COLUMN     "vehicleName" TEXT NOT NULL,
DROP COLUMN "fuelType",
ADD COLUMN     "fuelType" "FuelType" NOT NULL;
