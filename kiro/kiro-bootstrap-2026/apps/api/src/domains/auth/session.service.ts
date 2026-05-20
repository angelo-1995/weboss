import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { CacheService } from '../../infrastructure/cache/cache.service';
import type { UUID } from '@community-os/types';

const SESSION_CACHE_TTL = 300; // 5 min
const REFRESH_TOKEN_REDIS_TTL = 604800; // 7 days in seconds

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly cache: CacheService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Create a new session with a token family.
   * If familyId is provided, the session belongs to an existing family (rotation).
   * If not, a new family is created (fresh login).
   */
  async create(params: {
    userId: UUID;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    familyId?: string;
  }) {
    const hashed = this.hashToken(params.refreshToken);
    const familyId = params.familyId || randomUUID();

    const session = await this.db.session.create({
      data: {
        userId: params.userId,
        refreshToken: hashed,
        familyId,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        expiresAt: params.expiresAt,
      } as any,
    });

    // Store in Redis for fast lookup with TTL
    await this.cache.set(
      `refresh:${hashed}`,
      { sessionId: session.id, userId: params.userId, familyId },
      REFRESH_TOKEN_REDIS_TTL,
    );

    return session;
  }

  /**
   * Find a valid session by raw refresh token.
   * Checks Redis first, falls back to DB.
   */
  async findByRefreshToken(rawToken: string) {
    const hashed = this.hashToken(rawToken);

    // Try Redis first
    const cached = await this.cache.get<{ sessionId: string; userId: string; familyId: string }>(
      `refresh:${hashed}`,
    );

    if (cached) {
      // Verify in DB that it's still valid
      const session = await this.db.session.findUnique({
        where: { id: cached.sessionId },
        include: { user: { select: { id: true, email: true, roles: true, status: true } } },
      });

      if (session && !session.revokedAt && session.expiresAt > new Date()) {
        return session;
      }

      // Stale cache — clean up
      await this.cache.del(`refresh:${hashed}`);
      return null;
    }

    // Fallback to DB
    return this.db.session.findFirst({
      where: {
        refreshToken: hashed,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: { select: { id: true, email: true, roles: true, status: true } } },
    });
  }

  /**
   * Check if a refresh token was already used (replay attack detection).
   * A token is "used" if its session has been revoked.
   */
  async isTokenReused(rawToken: string): Promise<{ reused: boolean; familyId?: string }> {
    const hashed = this.hashToken(rawToken);

    const session = await this.db.session.findFirst({
      where: { refreshToken: hashed },
    });

    if (!session) return { reused: false };

    // If the session exists but is revoked, this is a replay attack
    if (session.revokedAt) {
      return { reused: true, familyId: (session as any).familyId };
    }

    return { reused: false, familyId: (session as any).familyId };
  }

  /**
   * Revoke a single session.
   */
  async revoke(sessionId: UUID) {
    const session = await this.db.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    // Remove from Redis
    await this.cache.del(`refresh:${session.refreshToken}`);
    await this.cache.del(`session:${sessionId}`);
  }

  /**
   * Revoke ALL sessions in a token family (replay attack response).
   * This invalidates the entire chain of rotated tokens.
   */
  async revokeFamily(familyId: string): Promise<number> {
    const sessions = await this.db.session.findMany({
      where: { familyId, revokedAt: null } as any,
      select: { id: true, refreshToken: true },
    });

    if (sessions.length === 0) return 0;

    await this.db.session.updateMany({
      where: { familyId, revokedAt: null } as any,
      data: { revokedAt: new Date() },
    });

    // Clean up Redis entries
    for (const session of sessions) {
      await this.cache.del(`refresh:${session.refreshToken}`);
      await this.cache.del(`session:${session.id}`);
    }

    this.logger.warn(`Token family ${familyId} revoked (${sessions.length} sessions) — possible replay attack`);
    return sessions.length;
  }

  /**
   * Revoke all sessions for a user.
   */
  async revokeAllForUser(userId: UUID) {
    const sessions = await this.db.session.findMany({
      where: { userId, revokedAt: null },
      select: { id: true, refreshToken: true },
    });

    await this.db.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Clean up Redis
    for (const session of sessions) {
      await this.cache.del(`refresh:${session.refreshToken}`);
      await this.cache.del(`session:${session.id}`);
    }

    await this.cache.delPattern(`session:user:${userId}:*`);
  }

  /**
   * Get all active sessions for a user.
   */
  async getActiveSessions(userId: string, currentSessionId: string) {
    const sessions = await this.db.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      current: s.id === currentSessionId,
    }));
  }

  /**
   * Revoke a specific session belonging to a user.
   */
  async revokeUserSession(userId: string, sessionId: string) {
    const session = await this.db.session.findFirst({
      where: { id: sessionId, userId, revokedAt: null },
    });

    if (session) {
      await this.revoke(sessionId);
    }
  }
}
