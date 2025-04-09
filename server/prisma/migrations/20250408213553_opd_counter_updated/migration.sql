/*
  Warnings:

  - The primary key for the `OpdCounter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OpdCounter` table. All the data in the column will be lost.
  - You are about to drop the column `lastOpd` on the `OpdCounter` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "OpdCounter_date_key";

-- AlterTable
ALTER TABLE "OpdCounter" DROP CONSTRAINT "OpdCounter_pkey",
DROP COLUMN "id",
DROP COLUMN "lastOpd",
ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "OpdCounter_pkey" PRIMARY KEY ("date", "count");
