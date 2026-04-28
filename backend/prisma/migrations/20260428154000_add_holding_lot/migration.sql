-- CreateTable
CREATE TABLE "HoldingLot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stockCode" TEXT NOT NULL,
    "buyTimestamp" TIMESTAMP(3) NOT NULL,
    "buyPrice" DOUBLE PRECISION NOT NULL,
    "buyQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HoldingLot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HoldingLot_userId_stockCode_buyTimestamp_idx" ON "HoldingLot"("userId", "stockCode", "buyTimestamp");

-- CreateIndex
CREATE INDEX "HoldingLot_userId_buyTimestamp_idx" ON "HoldingLot"("userId", "buyTimestamp");

-- AddForeignKey
ALTER TABLE "HoldingLot" ADD CONSTRAINT "HoldingLot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoldingLot" ADD CONSTRAINT "HoldingLot_stockCode_fkey" FOREIGN KEY ("stockCode") REFERENCES "Stock"("code") ON DELETE CASCADE ON UPDATE CASCADE;
