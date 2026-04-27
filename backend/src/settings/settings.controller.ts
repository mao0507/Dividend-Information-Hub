import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { SettingsService } from './settings.service'

class UpdateSettingsDto {
  @IsOptional() @IsString() accent?: string
  @IsOptional() @IsBoolean() upRed?: boolean
  @IsOptional() @IsString() density?: string
  @IsOptional() @IsString() monoFont?: string
  @IsOptional() @IsString() sansFont?: string
  @IsOptional() @IsInt() @Min(0) @Max(24) radius?: number
}

class LinkBrokerDto {
  @IsString() broker: string
  @IsOptional() @IsString() account?: string
}

class SyncPrefDto {
  @IsOptional() @IsBoolean() autoSync?: boolean
  @IsOptional() @IsBoolean() positions?: boolean
  @IsOptional() @IsBoolean() dividends?: boolean
  @IsOptional() @IsBoolean() profile?: boolean
  @IsOptional() @IsBoolean() notifications?: boolean
}

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  getSettings(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.settings.getSettings(user.id)
  }

  @Patch()
  patchSettings(@Req() req: Request, @Body() dto: UpdateSettingsDto) {
    const user = req.user as { id: string }
    return this.settings.updateSettings(user.id, dto)
  }

  @Get('brokers')
  getBrokers(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.settings.getBrokerLinks(user.id)
  }

  @Post('brokers/link')
  linkBroker(@Req() req: Request, @Body() dto: LinkBrokerDto) {
    const user = req.user as { id: string }
    return this.settings.linkBroker(user.id, dto.broker, dto.account)
  }

  @Delete('brokers/:id')
  unlinkBroker(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string }
    return this.settings.deleteBrokerLink(user.id, id)
  }

  @Patch('sync')
  patchSync(@Req() req: Request, @Body() dto: SyncPrefDto) {
    const user = req.user as { id: string }
    return this.settings.updateSyncPref(user.id, dto)
  }
}
