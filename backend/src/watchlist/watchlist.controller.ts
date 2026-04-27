import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req,
} from '@nestjs/common'
import type { Request } from 'express'
import { WatchlistService } from './watchlist.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator'

class CreateGroupDto {
  @IsString() name: string
  @IsString() @IsOptional() color?: string
}

class AddItemDto {
  @IsString() groupId: string
  @IsString() stockCode: string
}

class ReorderDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[]
}

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private watchlist: WatchlistService) {}

  @Get()
  getAll(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.watchlist.getAll(user.id)
  }

  @Get('summary')
  getSummary(@Req() req: Request) {
    const user = req.user as { id: string }
    return this.watchlist.getSummary(user.id)
  }

  @Post('groups')
  createGroup(@Body() dto: CreateGroupDto, @Req() req: Request) {
    const user = req.user as { id: string }
    return this.watchlist.createGroup(user.id, dto.name, dto.color ?? '#22c55e')
  }

  @Patch('groups/:id')
  updateGroup(
    @Param('id') id: string,
    @Body() dto: Partial<CreateGroupDto>,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string }
    return this.watchlist.updateGroup(id, user.id, dto)
  }

  @Delete('groups/:id')
  deleteGroup(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { id: string }
    return this.watchlist.deleteGroup(id, user.id)
  }

  @Post('items')
  addItem(@Body() dto: AddItemDto, @Req() req: Request) {
    const user = req.user as { id: string }
    return this.watchlist.addItem(dto.groupId, dto.stockCode, user.id)
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { id: string }
    return this.watchlist.removeItem(id, user.id)
  }

  @Patch('items/reorder')
  reorder(@Body() dto: ReorderDto, @Req() req: Request) {
    const user = req.user as { id: string }
    return this.watchlist.reorder(dto.ids, user.id)
  }
}
