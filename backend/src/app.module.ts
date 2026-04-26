import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { StockModule } from './stock/stock.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { CalendarModule } from './calendar/calendar.module'
import { WatchlistModule } from './watchlist/watchlist.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StockModule,
    DashboardModule,
    CalendarModule,
    WatchlistModule,
  ],
})
export class AppModule {}
