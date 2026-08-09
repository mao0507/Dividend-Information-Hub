import {
  Controller,
  Post,
  Delete,
  Body,
  Res,
  UseGuards,
  Get,
  Req,
  HttpCode,
} from '@nestjs/common'
import type { Response, Request } from 'express'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto } from './dto/auth.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { tokenVersion, ...user } = await this.auth.register(dto)
    this.auth.issueTokens(user.id, user.email, tokenVersion, res)
    return { user }
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { tokenVersion, ...user } = await this.auth.login(dto)
    this.auth.issueTokens(user.id, user.email, tokenVersion, res)
    return { user }
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { sub: string; email: string; tokenVersion: number }
    this.auth.issueTokens(user.sub, user.email, user.tokenVersion, res)
    return { ok: true }
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { id: string }
    await this.auth.revokeSessions(user.id)
    this.auth.clearTokens(res)
    return { ok: true }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    return req.user
  }
}
