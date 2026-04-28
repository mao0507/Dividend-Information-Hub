-- CreateTable
CREATE TABLE "MarketSyncState" (
    "key" TEXT NOT NULL,
    "lastOkDate" DATE,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketSyncState_pkey" PRIMARY KEY ("key")
);
