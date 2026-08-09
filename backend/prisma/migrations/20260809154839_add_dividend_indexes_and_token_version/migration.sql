-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Dividend_exDate_idx" ON "Dividend"("exDate");

-- CreateIndex
CREATE INDEX "Dividend_payDate_idx" ON "Dividend"("payDate");
