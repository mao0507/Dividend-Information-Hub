import { Module } from '@nestjs/common'
import { VizController } from './viz.controller'
import { VizService } from './viz.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [VizController],
  providers: [VizService],
})
export class VizModule {}
