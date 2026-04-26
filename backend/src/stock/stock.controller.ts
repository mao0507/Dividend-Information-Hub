import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
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

  @Get('ranking')
  getRanking(
    @Query('yieldGt') yieldGt?: string,
    @Query('freq') freq?: string,
    @Query('sector') sector?: string,
    @Query('streakGte') streakGte?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stock.getRanking({
      yieldGt: yieldGt ? parseFloat(yieldGt) : undefined,
      freq,
      sector,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    })
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
