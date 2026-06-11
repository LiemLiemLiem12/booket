/*
  Warnings:

  - You are about to drop the column `virtual_account_expires_at` on the `ORDERS` table. All the data in the column will be lost.
  - You are about to drop the column `virtual_account_number` on the `ORDERS` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ORDERS" DROP COLUMN "virtual_account_expires_at",
DROP COLUMN "virtual_account_number",
ADD COLUMN     "expires_at" TIMESTAMP(6);
