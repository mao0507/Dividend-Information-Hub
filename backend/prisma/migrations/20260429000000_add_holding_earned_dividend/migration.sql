-- AlterTable
ALTER TABLE "Holding" ADD COLUMN "earnedDividend" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Holding_userId_stockCode_key" ON "Holding"("userId", "stockCode");
