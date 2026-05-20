import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../session.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: { body?: { refreshToken?: string } }, payload: { sub: string }) {
    const rawToken = req.body?.refreshToken;
    if (!rawToken) throw new UnauthorizedException();

    const session = await this.sessionService.findByRefreshToken(rawToken);
    if (!session) throw new UnauthorizedException('Invalid refresh token');

    return { userId: payload.sub, sessionId: session.id, rawToken };
  }
}
