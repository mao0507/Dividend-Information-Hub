import { IsBoolean, IsOptional, IsDateString } from 'class-validator';

/**
 * TWSE 日線回填請求本文
 */
export class TwsePriceBackfillDto {
  @IsDateString()
  fromDate!: string;

  @IsDateString()
  toDate!: string;

  @IsOptional()
  @IsBoolean()
  resume?: boolean;
}
