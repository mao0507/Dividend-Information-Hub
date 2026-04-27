import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { StockService } from './stock.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private stock: StockService) {}

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
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    })
  }

  @Get('featured')
  getFeatured(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.stock.getFeatured(user.id)
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

  @Get(':code/peers')
  getPeers(@Param('code') code: string) {
    return this.stock.getPeers(code)
  }

  @Get(':code/fill-progress')
  getFillProgress(@Param('code') code: string) {
    return this.stock.getFillProgress(code)
  }
}
