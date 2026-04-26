import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import type { Request } from 'express'
import { DashboardService } from './dashboard.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('summary')
  summary(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.dashboard.getSummary(user.id)
  }
}
