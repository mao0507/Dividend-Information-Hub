import { Module } from '@nestjs/common'
import { DripController } from './drip.controller'
import { DripService } from './drip.service'

@Module({
  controllers: [DripController],
  providers: [DripService],
})
export class DripModule {}
