/*
  Warnings:

  - You are about to drop the column `idempotency_key` on the `ORDERS` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ORDERS_idempotency_key_key";

-- AlterTable
ALTER TABLE "ORDERS" DROP COLUMN "idempotency_key",
ALTER COLUMN "expires_at" SET DEFAULT now() + interval '1 minutes';
