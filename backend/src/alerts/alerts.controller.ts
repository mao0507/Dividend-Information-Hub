import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import type { Request } from 'express'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AlertsService } from './alerts.service'

class CreateAlertRuleDto {
  @IsString() label: string
  @IsString() type: string
  @IsString() @IsOptional() matchType?: string
  @IsString() @IsOptional() stockCode?: string
  @IsArray() @IsOptional() @IsString({ each: true }) channels?: string[]
  @IsNumber() @IsOptional() threshold?: number
  @IsBoolean() @IsOptional() isOn?: boolean
}

class UpdateAlertRuleDto {
  @IsString() @IsOptional() label?: string
  @IsString() @IsOptional() type?: string
  @IsString() @IsOptional() matchType?: string
  @IsString() @IsOptional() stockCode?: string
  @IsArray() @IsOptional() @IsString({ each: true }) channels?: string[]
  @IsNumber() @IsOptional() threshold?: number
  @IsBoolean() @IsOptional() isOn?: boolean
}

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private alerts: AlertsService) {}

  @Get('notifications')
  getNotifications(
    @Req() req: Request,
    @Query('type') type?: string,
    @Query('page') page?: string,
  ) {
    const user = req.user as { id: string }
    return this.alerts.getNotifications(user.id, type, page ? parseInt(page, 10) : 1)
  }

  @Patch('notifications/read-all')
  readAll(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.alerts.readAllNotifications(user.id)
  }

  @Patch('notifications/:id/read')
  readOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string }
    return this.alerts.readNotification(user.id, id)
  }

  @Get('rules')
  getRules(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.alerts.getRules(user.id)
  }

  @Post('rules')
  createRule(@Req() req: Request, @Body() dto: CreateAlertRuleDto) {
    const user = req.user as { id: string }
    return this.alerts.createRule(user.id, dto)
  }

  @Patch('rules/:id')
  updateRule(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateAlertRuleDto) {
    const user = req.user as { id: string }
    return this.alerts.updateRule(user.id, id, dto)
  }

  @Delete('rules/:id')
  deleteRule(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string }
    return this.alerts.deleteRule(user.id, id)
  }
}
