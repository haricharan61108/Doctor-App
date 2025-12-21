/*
  Warnings:

  - Added the required column `password` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Pharmacy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pharmacy" ADD COLUMN     "password" TEXT NOT NULL;
