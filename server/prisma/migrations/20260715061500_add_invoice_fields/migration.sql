/*
  Warnings:
  - You are about to add a non-nullable column "currency" to a table that already contains data.
    The column will be filled with the default value ("USD") for all existing rows.
  - Adding a nullable column "amount" is safe.
*/

-- AlterTable
ALTER TABLE "shipments" ADD COLUMN "amount" DECIMAL(12, 2);
ALTER TABLE "shipments" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';