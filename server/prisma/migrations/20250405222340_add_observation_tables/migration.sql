-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('SALINE', 'INJECTION', 'OTHER');

-- CreateTable
CREATE TABLE "patient_under_obs" (
    "id" TEXT NOT NULL,
    "checkupId" TEXT NOT NULL,
    "observationId" TEXT NOT NULL,
    "isUnderObservation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_under_obs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observation_details" (
    "id" TEXT NOT NULL,
    "medicineId" TEXT,
    "dosage" TEXT,
    "frequency" TEXT,
    "dailyQuantity" INTEGER NOT NULL,
    "days" INTEGER NOT NULL,
    "availableQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observation_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_under_obs_checkupId_key" ON "patient_under_obs"("checkupId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_under_obs_observationId_key" ON "patient_under_obs"("observationId");

-- AddForeignKey
ALTER TABLE "patient_under_obs" ADD CONSTRAINT "patient_under_obs_checkupId_fkey" FOREIGN KEY ("checkupId") REFERENCES "checkup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_under_obs" ADD CONSTRAINT "patient_under_obs_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "observation_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observation_details" ADD CONSTRAINT "observation_details_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
