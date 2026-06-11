/*
  Warnings:

  - You are about to drop the column `quantity` on the `TICKETS` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ORDERS" ALTER COLUMN "expires_at" SET DEFAULT now() + interval '1 minutes';

-- AlterTable
ALTER TABLE "TICKETS" DROP COLUMN "quantity";
