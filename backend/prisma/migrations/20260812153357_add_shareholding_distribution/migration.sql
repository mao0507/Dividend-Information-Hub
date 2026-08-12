-- CreateTable
CREATE TABLE "ShareholdingDistribution" (
    "id" TEXT NOT NULL,
    "stockCode" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "tier" INTEGER NOT NULL,
    "holderCount" INTEGER NOT NULL,
    "shareCount" BIGINT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ShareholdingDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShareholdingDistribution_stockCode_date_idx" ON "ShareholdingDistribution"("stockCode", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ShareholdingDistribution_stockCode_date_tier_key" ON "ShareholdingDistribution"("stockCode", "date", "tier");

-- AddForeignKey
ALTER TABLE "ShareholdingDistribution" ADD CONSTRAINT "ShareholdingDistribution_stockCode_fkey" FOREIGN KEY ("stockCode") REFERENCES "Stock"("code") ON DELETE CASCADE ON UPDATE CASCADE;
