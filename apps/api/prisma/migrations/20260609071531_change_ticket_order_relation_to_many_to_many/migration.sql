/*
  Warnings:

  - You are about to drop the column `order_id` on the `TICKETS` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TICKETS" DROP CONSTRAINT "TICKETS_order_id_fkey";

-- AlterTable
ALTER TABLE "TICKETS" DROP COLUMN "order_id";

-- CreateTable
CREATE TABLE "_OrderToTicket" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_OrderToTicket_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderToTicket_B_index" ON "_OrderToTicket"("B");

-- AddForeignKey
ALTER TABLE "_OrderToTicket" ADD CONSTRAINT "_OrderToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "ORDERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToTicket" ADD CONSTRAINT "_OrderToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "TICKETS"("id") ON DELETE CASCADE ON UPDATE CASCADE;
