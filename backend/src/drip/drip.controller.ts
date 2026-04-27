import { Body, Controller, Post } from '@nestjs/common'
import { DripCalculateDto } from './dto/drip-calculate.dto'
import { DripService } from './drip.service'

@Controller('drip')
export class DripController {
  constructor(private readonly drip: DripService) {}

  /**
   * 股息再投入試算（無需認證）
   */
  @Post('calculate')
  calculate(@Body() body: DripCalculateDto) {
    return this.drip.calculate(body)
  }
}
