import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import type { JwtPayload, TokenPair } from '@community-os/types';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  signAccessToken(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }

  signRefreshToken(): string {
    // Opaque random token — stored hashed in DB
    return randomBytes(64).toString('hex');
  }

  async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    return {
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(),
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwt.verify<JwtPayload>(token);
  }

  getRefreshExpiresAt(): Date {
    const days = parseInt(
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d').replace('d', ''),
      10,
    );
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}
