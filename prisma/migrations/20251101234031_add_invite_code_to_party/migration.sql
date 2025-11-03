/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `Party` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "inviteCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Party_inviteCode_key" ON "Party"("inviteCode");
