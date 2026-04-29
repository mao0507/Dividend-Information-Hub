import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateHoldingLotDto } from './dto/create-holding-lot.dto'

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

    const lot = await this.prisma.holdingLot.create({
      data: {
        userId,
        stockCode: dto.stockCode,
        buyTimestamp: dto.buyTimestamp,
        buyPrice: dto.buyPrice,
        buyQuantity: dto.buyQuantity,
      },
      select: { id: true, stockCode: true, buyTimestamp: true, buyPrice: true, buyQuantity: true },
    })

    await this.recalculateHolding(userId, dto.stockCode)
    return lot
  }

  /**
   * 刪除買入批次並同步重算 Holding；若為最後一筆則刪除 Holding。
   * @param userId 使用者 ID
   * @param lotId 批次 ID
   */
  readonly deleteLot = async (userId: string, lotId: string): Promise<void> => {
    const lot = await this.prisma.holdingLot.findFirst({ where: { id: lotId, userId } })
    if (!lot) throw new NotFoundException('批次不存在或無權限存取')

    await this.prisma.holdingLot.delete({ where: { id: lotId } })
    await this.recalculateHolding(userId, lot.stockCode)
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
   * 重算指定使用者與股票的 Holding 彙總（shares、avgCost、boughtAt、earnedDividend）。
   * 若無剩餘批次則刪除 Holding。
   * @param userId 使用者 ID
   * @param stockCode 股票代號
   */
  readonly recalculateHolding = async (userId: string, stockCode: string): Promise<void> => {
    const lots = await this.prisma.holdingLot.findMany({
      where: { userId, stockCode },
      orderBy: { buyTimestamp: 'asc' },
      select: { buyTimestamp: true, buyPrice: true, buyQuantity: true },
    })

    if (!lots.length) {
      await this.prisma.holding.deleteMany({ where: { userId, stockCode } })
      return
    }

    const shares = lots.reduce((s, l) => s + l.buyQuantity, 0)
    const totalCost = lots.reduce((s, l) => s + l.buyPrice * l.buyQuantity, 0)
    const avgCost = totalCost / shares
    const boughtAt = lots[0].buyTimestamp

    const dividends = await this.prisma.dividend.findMany({
      where: { stockCode, filled: true, payDate: { not: null } },
      select: { cash: true, payDate: true },
    })

    const earnedDividend = lots.reduce((sum, lot) => {
      const lotIncome = dividends
        .filter((d) => d.payDate !== null && d.payDate >= lot.buyTimestamp)
        .reduce((s, d) => s + d.cash * lot.buyQuantity, 0)
      return sum + lotIncome
    }, 0)

    await this.prisma.holding.upsert({
      where: { userId_stockCode: { userId, stockCode } },
      update: { shares, avgCost, boughtAt, earnedDividend },
      create: { userId, stockCode, shares, avgCost, boughtAt, earnedDividend },
    })
  }
}
