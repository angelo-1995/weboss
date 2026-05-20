import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import type { LoginDto, RegisterDto } from './dto/auth.dto';
import type { TokenPair, JwtPayload } from '@community-os/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly events: EventEmitter2,
  ) {}

  async register(dto: RegisterDto, meta: { ip?: string; userAgent?: string }): Promise<TokenPair> {
    const existing = await this.db.user.findFirst({
      where: { email: { equals: dto.email, mode: 'insensitive' }, deletedAt: null },
    });
    if (existing) throw new ConflictException('Email already registered');

    const password = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.db.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: 'ACTIVE',
        roles: ['MEMBER'],
        profile: { create: {} },
      },
    });

    this.events.emit('auth.user.registered', { userId: user.id, email: user.email });
    this.logger.log(`User registered: ${user.id}`);

    return this.createSession(user, meta);
  }

  async login(dto: LoginDto, meta: { ip?: string; userAgent?: string }): Promise<TokenPair> {
    // Generic error message — never reveal if email exists
    const genericError = 'Invalid credentials';

    const user = await this.db.user.findFirst({
      where: { email: { equals: dto.email, mode: 'insensitive' }, deletedAt: null },
    });

    if (!user) throw new UnauthorizedException(genericError);
    if (user.status === 'SUSPENDED') throw new UnauthorizedException(genericError);
    if (user.status === 'INACTIVE') throw new UnauthorizedException(genericError);

    const valid = await argon2.verify(user.password, dto.password);
    if (!valid) throw new UnauthorizedException(genericError);

    this.events.emit('auth.user.login', { userId: user.id, ip: meta.ip });
    return this.createSession(user, meta);
  }

  async refresh(rawRefreshToken: string, meta: { ip?: string; userAgent?: string }): Promise<TokenPair> {
    // Check for replay attack first
    const replayCheck = await this.sessionService.isTokenReused(rawRefreshToken);

    if (replayCheck.reused && replayCheck.familyId) {
      // REPLAY ATTACK DETECTED — invalidate entire token family
      await this.sessionService.revokeFamily(replayCheck.familyId);
      this.logger.warn(`Replay attack detected for family ${replayCheck.familyId}`);
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'TOKEN_FAMILY_COMPROMISED',
        message: 'Security violation detected. All sessions have been revoked.',
      });
    }

    const session = await this.sessionService.findByRefreshToken(rawRefreshToken);
    if (!session) throw new UnauthorizedException('Invalid or expired refresh token');

    const { user } = session;
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account not active');

    // Rotate: revoke old session, create new one in the same family
    await this.sessionService.revoke(session.id);
    return this.createSession(user, meta, (session as any).familyId);
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.revoke(sessionId);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.revokeAllForUser(userId);
  }

  async getMe(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phoneNumber: true,
        roles: true,
        campusId: true,
        status: true,
        leaderCode: true,
        spiritualStage: true,
        leaderId: true,
        networkId: true,
        isBaptized: true,
        hasFirstRetreat: true,
        hasAcademy: true,
        hasLaunch: true,
        profile: true,
        network: { select: { id: true, name: true, code: true } },
        campus: { select: { id: true, name: true } },
        coverageLeader: { select: { id: true, firstName: true, lastName: true, leaderCode: true } },
        groupMembers: {
          where: { leftAt: null },
          select: {
            role: true,
            group: { select: { id: true, name: true, code: true, type: true } },
          },
        },
      },
    });

    if (!user) return null;

    // Count subordinates
    const subordinateCount = await this.db.user.count({
      where: { leaderId: userId, deletedAt: null },
    });

    return {
      ...user,
      leader: user.coverageLeader,
      groups: user.groupMembers,
      subordinateCount,
      coverageLeader: undefined,
      groupMembers: undefined,
    };
  }

  // ── Private ──────────────────────────────────────────────

  private async createSession(
    user: { id: string; email: string; roles: string[] },
    meta: { ip?: string; userAgent?: string },
    familyId?: string,
  ): Promise<TokenPair> {
    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      roles: user.roles,
      sessionId: '', // filled after session creation
    });

    const session = await this.sessionService.create({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
      expiresAt: this.tokenService.getRefreshExpiresAt(),
      familyId,
    });

    // Re-sign access token with real sessionId
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      sessionId: session.id,
    };

    return {
      accessToken: this.tokenService.signAccessToken(payload),
      refreshToken: tokens.refreshToken,
    };
  }
}
