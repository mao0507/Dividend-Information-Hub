import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { HoldingsController } from './holdings.controller'
import { HoldingsService } from './holdings.service'

@Module({
  imports: [PrismaModule],
  controllers: [HoldingsController],
  providers: [HoldingsService],
  exports: [HoldingsService],
})
export class HoldingsModule {}
