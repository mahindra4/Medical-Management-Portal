/*
  Warnings:

  - The primary key for the `OpdCounter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `OpdCounter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OpdCounter" DROP CONSTRAINT "OpdCounter_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "OpdCounter_pkey" PRIMARY KEY ("id");
