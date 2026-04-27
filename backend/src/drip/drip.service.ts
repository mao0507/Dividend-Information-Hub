import { Injectable } from '@nestjs/common'
import { DripCalculateDto } from './dto/drip-calculate.dto'
import { computeDripProjection } from './drip.calculator'

@Injectable()
export class DripService {
  /**
   * 執行 DRIP 試算（純計算）
   * @param dto 請求參數（含 JSON 鍵 `yield`）
   * @returns 每年資產（含/不含再投入）、達標年份、最後一年年息、月均
   */
  calculate(dto: DripCalculateDto) {
    return computeDripProjection({
      principal: dto.principal,
      monthlyAdd: dto.monthlyAdd,
      dividendYieldPercent: dto['yield'],
      growthPercent: dto.growth,
      years: dto.years,
      taxRatePercent: dto.taxRate,
    })
  }
}
