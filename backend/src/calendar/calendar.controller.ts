import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common'
import type { Request } from 'express'
import { CalendarService } from './calendar.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private calendar: CalendarService) {}

  @Get()
  getMonth(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('watchlistOnly') watchlistOnly: string,
    @Query('freq') freq: string,
    @Query('yieldGt') yieldGt: string,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string }
    return this.calendar.getMonthEvents(
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1,
      user.id,
      {
        watchlistOnly: watchlistOnly === 'true',
        freq: freq || undefined,
        yieldGt: yieldGt ? parseFloat(yieldGt) : undefined,
      },
    )
  }

  @Get('upcoming')
  getUpcoming(@Query('days') days: string, @Req() req: Request) {
    const user = req.user as { id: string }
    return this.calendar.getUpcoming(parseInt(days) || 7, user.id)
  }
}
