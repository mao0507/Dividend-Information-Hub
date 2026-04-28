import { IsDateString, IsString, Matches } from 'class-validator';

/**
 * 單點股價驗證請求本文
 */
export class StockPriceValidateDto {
  @IsString()
  @Matches(/^\d{4,6}[A-Za-z]?$/)
  stockCode!: string;

  @IsDateString()
  date!: string;
}
