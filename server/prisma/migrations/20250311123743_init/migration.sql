-- CreateTable
CREATE TABLE "diagnosis_symptoms" (
    "id" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,

    CONSTRAINT "diagnosis_symptoms_pkey" PRIMARY KEY ("id")
);
