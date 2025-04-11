-- CreateTable
CREATE TABLE "OpdCounter" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "lastOpd" INTEGER NOT NULL,

    CONSTRAINT "OpdCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpdCounter_date_key" ON "OpdCounter"("date");
