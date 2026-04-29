import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CreateHoldingLotDto } from './dto/create-holding-lot.dto'
import { HoldingsService } from './holdings.service'

@Controller('holdings')
@UseGuards(JwtAuthGuard)
export class HoldingsController {
  constructor(private readonly holdings: HoldingsService) {}

  /**
   * 新增買入批次。
   * @param req 請求（含 JWT user）
   * @param dto 批次建立資料
   * @returns 建立完成的批次
   */
  @Post('lots')
  createLot(@Req() req: Request, @Body() dto: CreateHoldingLotDto) {
    const user = req.user as { id: string }
    return this.holdings.createLot(user.id, dto)
  }

  /**
   * 刪除買入批次。
   * @param req 請求（含 JWT user）
   * @param id 批次 ID
   */
  @Delete('lots/:id')
  deleteLot(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string }
    return this.holdings.deleteLot(user.id, id)
  }

  /**
   * 取得所有持股彙總與批次明細。
   * @param req 請求（含 JWT user）
   * @returns 持股列表
   */
  @Get()
  getHoldings(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.holdings.getHoldings(user.id)
  }

  /**
   * 取得投資金額占比資料。
   * @param req 請求（含 JWT user）
   * @returns 各股投資金額
   */
  @Get('allocation')
  getAllocation(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.holdings.getAllocation(user.id)
  }
}
