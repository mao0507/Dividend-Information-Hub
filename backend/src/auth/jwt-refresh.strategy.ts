import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = config.get<string>('JWT_REFRESH_SECRET')
    if (!secret) throw new Error('JWT_REFRESH_SECRET not configured')
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token,
      ]),
      secretOrKey: secret,
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: { sub: string; email: string; tokenVersion?: number }) {
    const refreshToken = req.cookies?.refresh_token
    if (!refreshToken) throw new UnauthorizedException()

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) throw new UnauthorizedException()
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Session revoked')
    }

    return { ...payload, tokenVersion: user.tokenVersion, refreshToken }
  }
}
