import { Type } from 'class-transformer'
import { IsDate, IsInt, IsNumber, IsPositive, IsString, Length } from 'class-validator'

export class CreateHoldingLotDto {
  @IsString()
  @Length(1, 12)
  stockCode!: string

  @Type(() => Date)
  @IsDate()
  buyTimestamp!: Date

  @IsNumber()
  @IsPositive()
  buyPrice!: number

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  buyQuantity!: number
}
