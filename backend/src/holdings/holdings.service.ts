import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateHoldingLotDto } from './dto/create-holding-lot.dto'

/** Prisma 互動式交易 client（`$transaction` callback 內或外部呼叫皆可） */
type PrismaOrTx = PrismaService | Prisma.TransactionClient

export interface HoldingLotRow {
  id: string
  stockCode: string
  buyTimestamp: Date
  buyPrice: number
  buyQuantity: number
}

export interface HoldingWithLots {
  id: string
  stockCode: string
  stockName: string
  shares: number
  avgCost: number
  boughtAt: Date
  earnedDividend: number
  lots: HoldingLotRow[]
}

export interface AllocationItem {
  stockCode: string
  name: string
  totalCost: number
}

export interface HoldingPnlItem {
  stockCode: string
  costBasis: number
  currentValue: number | null
  unrealizedGain: number | null
  unrealizedGainPct: number | null
  priceUnavailableReason: 'priceUnavailable' | null
}

export interface PnlTotal {
  totalCostBasis: number
  totalCurrentValue: number
  totalUnrealizedGain: number
  totalUnrealizedGainPct: number
}

export interface PnlResult {
  holdings: HoldingPnlItem[]
  total: PnlTotal
}

@Injectable()
export class HoldingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 建立買入批次並同步重算 Holding 彙總。
   * @param userId 使用者 ID
   * @param dto 建立批次資料
   * @returns 建立完成的批次
   */
  readonly createLot = async (userId: string, dto: CreateHoldingLotDto): Promise<HoldingLotRow> => {
    const stockExists = await this.prisma.stock.count({ where: { code: dto.stockCode } })
    if (!stockExists) throw new BadRequestException('無效的股票代號')

    return this.prisma.$transaction(async (tx) => {
      const lot = await tx.holdingLot.create({
        data: {
          userId,
          stockCode: dto.stockCode,
          buyTimestamp: dto.buyTimestamp,
          buyPrice: dto.buyPrice,
          buyQuantity: dto.buyQuantity,
        },
        select: { id: true, stockCode: true, buyTimestamp: true, buyPrice: true, buyQuantity: true },
      })

      await this.recalculateHolding(userId, dto.stockCode, tx)
      return lot
    })
  }

  /**
   * 刪除買入批次並同步重算 Holding；若為最後一筆則刪除 Holding。
   * 批次刪除與 Holding 重算包在同一交易內，避免中途失敗導致兩者不同步。
   * @param userId 使用者 ID
   * @param lotId 批次 ID
   */
  readonly deleteLot = async (userId: string, lotId: string): Promise<void> => {
    const lot = await this.prisma.holdingLot.findFirst({ where: { id: lotId, userId } })
    if (!lot) throw new NotFoundException('批次不存在或無權限存取')

    await this.prisma.$transaction(async (tx) => {
      await tx.holdingLot.delete({ where: { id: lotId } })
      await this.recalculateHolding(userId, lot.stockCode, tx)
    })
  }

  /**
   * 取得使用者所有持股彙總與批次明細。
   * @param userId 使用者 ID
   * @returns 持股列表
   */
  readonly getHoldings = async (userId: string): Promise<HoldingWithLots[]> => {
    const holdings = await this.prisma.holding.findMany({
      where: { userId },
      orderBy: { boughtAt: 'asc' },
      include: {
        stock: { select: { name: true } },
        user: false,
      },
    })

    const lots = await this.prisma.holdingLot.findMany({
      where: { userId },
      orderBy: [{ stockCode: 'asc' }, { buyTimestamp: 'asc' }],
      select: { id: true, stockCode: true, buyTimestamp: true, buyPrice: true, buyQuantity: true },
    })

    const lotsByStock = lots.reduce<Record<string, HoldingLotRow[]>>((acc, lot) => {
      ;(acc[lot.stockCode] ??= []).push(lot)
      return acc
    }, {})

    return holdings.map((h) => ({
      id: h.id,
      stockCode: h.stockCode,
      stockName: h.stock.name,
      shares: h.shares,
      avgCost: h.avgCost,
      boughtAt: h.boughtAt,
      earnedDividend: h.earnedDividend,
      lots: lotsByStock[h.stockCode] ?? [],
    }))
  }

  /**
   * 取得成本基礎投資金額占比資料（百分比由前端計算）。
   * @param userId 使用者 ID
   * @returns 各股投資金額列表
   */
  readonly getAllocation = async (userId: string): Promise<AllocationItem[]> => {
    const lots = await this.prisma.holdingLot.findMany({
      where: { userId },
      select: { stockCode: true, buyPrice: true, buyQuantity: true },
    })

    if (!lots.length) return []

    const costByStock = lots.reduce<Record<string, number>>((acc, lot) => {
      acc[lot.stockCode] = (acc[lot.stockCode] ?? 0) + lot.buyPrice * lot.buyQuantity
      return acc
    }, {})

    const stockCodes = Object.keys(costByStock)
    const stocks = await this.prisma.stock.findMany({
      where: { code: { in: stockCodes } },
      select: { code: true, name: true },
    })
    const nameByCode = Object.fromEntries(stocks.map((s) => [s.code, s.name]))

    return stockCodes
      .map((code) => ({ stockCode: code, name: nameByCode[code] ?? code, totalCost: costByStock[code] }))
      .sort((a, b) => b.totalCost - a.totalCost)
  }

  /**
   * 取得使用者未實現損益（依 HoldingLot 分批成本與最新收盤價計算）。
   * 查無最新股價的持股，該筆損益欄位回傳 null 並標示原因，且不計入總計市值/損益。
   * @param userId 使用者 ID
   * @returns 各檔持股與投資組合總計未實現損益
   */
  readonly getPnl = async (userId: string): Promise<PnlResult> => {
    const lots = await this.prisma.holdingLot.findMany({
      where: { userId },
      select: { stockCode: true, buyPrice: true, buyQuantity: true },
    })

    if (!lots.length) {
      return {
        holdings: [],
        total: { totalCostBasis: 0, totalCurrentValue: 0, totalUnrealizedGain: 0, totalUnrealizedGainPct: 0 },
      }
    }

    const costByStock: Record<string, number> = {}
    const sharesByStock: Record<string, number> = {}
    for (const lot of lots) {
      costByStock[lot.stockCode] = (costByStock[lot.stockCode] ?? 0) + lot.buyPrice * lot.buyQuantity
      sharesByStock[lot.stockCode] = (sharesByStock[lot.stockCode] ?? 0) + lot.buyQuantity
    }

    const stockCodes = Object.keys(costByStock)
    const prices = await this.prisma.stockPrice.findMany({
      where: { stockCode: { in: stockCodes } },
      orderBy: [{ stockCode: 'asc' }, { date: 'desc' }],
      distinct: ['stockCode'],
      select: { stockCode: true, close: true },
    })

    const latestCloseByStock = Object.fromEntries(prices.map((p) => [p.stockCode, p.close]))

    const holdings: HoldingPnlItem[] = stockCodes.map((stockCode) => {
      const costBasis = costByStock[stockCode]
      const close = latestCloseByStock[stockCode]

      if (close === undefined) {
        return {
          stockCode,
          costBasis,
          currentValue: null,
          unrealizedGain: null,
          unrealizedGainPct: null,
          priceUnavailableReason: 'priceUnavailable',
        }
      }

      const currentValue = close * sharesByStock[stockCode]
      const unrealizedGain = currentValue - costBasis
      const unrealizedGainPct = costBasis === 0 ? 0 : (unrealizedGain / costBasis) * 100

      return {
        stockCode,
        costBasis,
        currentValue,
        unrealizedGain,
        unrealizedGainPct,
        priceUnavailableReason: null,
      }
    })

    const totalCostBasis = holdings.reduce((s, h) => s + h.costBasis, 0)
    // 損益總計只計入有股價的持股，避免無股價持股的成本被誤算成全額虧損
    const pricedHoldings = holdings.filter((h) => h.currentValue !== null)
    const pricedCostBasis = pricedHoldings.reduce((s, h) => s + h.costBasis, 0)
    const totalCurrentValue = pricedHoldings.reduce((s, h) => s + (h.currentValue ?? 0), 0)
    const totalUnrealizedGain = totalCurrentValue - pricedCostBasis
    const totalUnrealizedGainPct = pricedCostBasis === 0 ? 0 : (totalUnrealizedGain / pricedCostBasis) * 100

    return {
      holdings,
      total: { totalCostBasis, totalCurrentValue, totalUnrealizedGain, totalUnrealizedGainPct },
    }
  }

  /**
   * 重算指定使用者與股票的 Holding 彙總（shares、avgCost、boughtAt、earnedDividend）。
   * 若無剩餘批次則刪除 Holding。呼叫端若在 `$transaction` 內，傳入 `tx` 確保與批次寫入原子化。
   * @param userId 使用者 ID
   * @param stockCode 股票代號
   * @param client Prisma client 或交易 client，預設用 this.prisma（非交易情境，如測試直接呼叫）
   */
  readonly recalculateHolding = async (
    userId: string,
    stockCode: string,
    client: PrismaOrTx = this.prisma,
  ): Promise<void> => {
    const lots = await client.holdingLot.findMany({
      where: { userId, stockCode },
      orderBy: { buyTimestamp: 'asc' },
      select: { buyTimestamp: true, buyPrice: true, buyQuantity: true },
    })

    if (!lots.length) {
      await client.holding.deleteMany({ where: { userId, stockCode } })
      return
    }

    const shares = lots.reduce((s, l) => s + l.buyQuantity, 0)
    const totalCost = lots.reduce((s, l) => s + l.buyPrice * l.buyQuantity, 0)
    const avgCost = totalCost / shares
    const boughtAt = lots[0].buyTimestamp

    const dividends = await client.dividend.findMany({
      where: { stockCode, filled: true, payDate: { not: null } },
      select: { cash: true, payDate: true },
    })

    const earnedDividend = lots.reduce((sum, lot) => {
      const lotIncome = dividends
        .filter((d) => d.payDate !== null && d.payDate >= lot.buyTimestamp)
        .reduce((s, d) => s + d.cash * lot.buyQuantity, 0)
      return sum + lotIncome
    }, 0)

    await client.holding.upsert({
      where: { userId_stockCode: { userId, stockCode } },
      update: { shares, avgCost, boughtAt, earnedDividend },
      create: { userId, stockCode, shares, avgCost, boughtAt, earnedDividend },
    })
  }
}
