import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { StockModule } from './stock/stock.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { CalendarModule } from './calendar/calendar.module'
import { WatchlistModule } from './watchlist/watchlist.module'
import { DripModule } from './drip/drip.module'
import { VizModule } from './viz/viz.module'
import { AlertsModule } from './alerts/alerts.module'
import { SettingsModule } from './settings/settings.module'
import { DataSyncModule } from './data-sync/data-sync.module'
import { HoldingsModule } from './holdings/holdings.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    StockModule,
    DashboardModule,
    CalendarModule,
    WatchlistModule,
    DripModule,
    VizModule,
    AlertsModule,
    SettingsModule,
    DataSyncModule,
    HoldingsModule,
  ],
})
export class AppModule {}
