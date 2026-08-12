import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { StockService } from './stock.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ChipDataSyncService } from '../data-sync/chip-data-sync.service'

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(
    private stock: StockService,
    private chipDataSync: ChipDataSyncService,
  ) {}

  @Get()
  search(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.stock.search(q ?? '', limit ? parseInt(limit) : 10)
  }

  @Get('ranking/presets')
  getRankingPresets() {
    return this.stock.getRankingPresets()
  }

  @Get('ranking')
  getRanking(
    @Query('yieldGt') yieldGt?: string,
    @Query('freq') freq?: string,
    @Query('sector') sector?: string,
    @Query('streakGte') streakGte?: string,
    @Query('fillDaysLte') fillDaysLte?: string,
    @Query('marketCapGte') marketCapGte?: string,
    @Query('payoutRatioLte') payoutRatioLte?: string,
    @Query('payoutRatioGte') payoutRatioGte?: string,
    @Query('sectorRankLte') sectorRankLte?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stock.getRanking({
      yieldGt: yieldGt ? parseFloat(yieldGt) : undefined,
      freq,
      sector,
      streakGte: streakGte ? parseInt(streakGte, 10) : undefined,
      fillDaysLte: fillDaysLte ? parseInt(fillDaysLte, 10) : undefined,
      marketCapGte: marketCapGte ? parseFloat(marketCapGte) : undefined,
      payoutRatioLte: payoutRatioLte ? parseFloat(payoutRatioLte) : undefined,
      payoutRatioGte: payoutRatioGte ? parseFloat(payoutRatioGte) : undefined,
      sectorRankLte: sectorRankLte ? parseInt(sectorRankLte, 10) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    })
  }

  @Get('featured')
  getFeatured(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.stock.getFeatured(user.id)
  }

  @Get('trading-calendar/closed-dates')
  getTwseClosedDates(@Query('year') year?: string) {
    const resolvedYear = year ? parseInt(year, 10) : new Date().getFullYear()
    return this.stock.getTwseClosedDates(resolvedYear)
  }

  @Get(':code')
  getDetail(@Param('code') code: string) {
    return this.stock.getDetail(code)
  }

  @Get(':code/dividends')
  getDividends(@Param('code') code: string) {
    return this.stock.getDividends(code)
  }

  @Get(':code/price')
  getPrices(@Param('code') code: string, @Query('range') range?: string) {
    return this.stock.getPrices(code, range)
  }

  @Get(':code/price-series')
  getPriceSeries(@Param('code') code: string, @Query('range') range?: string) {
    return this.stock.getPriceSeries(code, range)
  }

  @Get(':code/peers')
  getPeers(@Param('code') code: string) {
    return this.stock.getPeers(code)
  }

  @Get(':code/fill-progress')
  getFillProgress(@Param('code') code: string) {
    return this.stock.getFillProgress(code)
  }

  /**
   * 取得最新一日股權分散表；查無資料回傳 { available: false }
   * @param code 股票代號
   */
  @Get(':code/shareholding-distribution')
  async getShareholdingDistribution(@Param('code') code: string) {
    const result = await this.chipDataSync.getLatestDistribution(code)
    if (!result) return { available: false as const }
    return { available: true as const, ...result }
  }
}
