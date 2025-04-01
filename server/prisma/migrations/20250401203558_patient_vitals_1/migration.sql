-- AddForeignKey
ALTER TABLE "patient_vitals" ADD CONSTRAINT "patient_vitals_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
