import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { VizService } from './viz.service'

@Controller('viz')
@UseGuards(JwtAuthGuard)
export class VizController {
  constructor(private viz: VizService) {}

  @Get('sector-distribution')
  sectorDistribution(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.viz.getSectorDistribution(user.id)
  }

  @Get('monthly-income')
  monthlyIncome(@Req() req: Request, @Query('year') year?: string) {
    const user = req.user as { id: string }
    return this.viz.getMonthlyIncome(user.id, year ? parseInt(year, 10) : new Date().getFullYear())
  }

  @Get('heatmap')
  heatmap(@Req() req: Request, @Query('year') year?: string) {
    const user = req.user as { id: string }
    return this.viz.getHeatmap(user.id, year ? parseInt(year, 10) : new Date().getFullYear())
  }

  @Get('annual-growth')
  annualGrowth(@Req() req: Request, @Query('years') years?: string) {
    const user = req.user as { id: string }
    return this.viz.getAnnualGrowth(user.id, years ? parseInt(years, 10) : 6)
  }
}
