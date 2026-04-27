import { Type } from 'class-transformer'
import { IsNumber, Min, Max, IsInt } from 'class-validator'

/**
 * DRIP 試算請求 body（百分比欄位為 0–100）
 */
export class DripCalculateDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  principal!: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyAdd!: number

  /** 年化殖利率（%），JSON 鍵名為 yield */
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  'yield'!: number

  /** 股息年增率（%） */
  @Type(() => Number)
  @IsNumber()
  @Min(-50)
  @Max(50)
  growth!: number

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  years!: number

  /** 股息稅率（%） */
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate!: number
}
