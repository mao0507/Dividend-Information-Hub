-- AlterTable
ALTER TABLE "Dividend" ADD COLUMN     "preExClose" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
