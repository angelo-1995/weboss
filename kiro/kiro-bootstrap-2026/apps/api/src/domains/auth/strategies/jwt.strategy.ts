import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../../infrastructure/database/database.service';
import type { JwtPayload } from '@community-os/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly db: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.db.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: {
        id: true,
        email: true,
        roles: true,
        status: true,
        campusId: true,
        leaderCode: true,
        networkId: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      status: user.status,
      sessionId: payload.sessionId,
      campusId: user.campusId ?? '',
      leaderCode: user.leaderCode ?? null,
      networkId: user.networkId ?? null,
    };
  }
}
