-- CreateTable
CREATE TABLE "patient_vitals" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "bloodPressure" TEXT,
    "pulseRate" INTEGER,
    "spO2" DOUBLE PRECISION,

    CONSTRAINT "patient_vitals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patient_vitals" ADD CONSTRAINT "patient_vitals_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
