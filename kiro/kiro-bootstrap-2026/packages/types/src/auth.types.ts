import type { UUID } from './common.types';

export interface JwtPayload {
  sub: UUID;       // userId
  email: string;
  roles: string[];
  sessionId: UUID;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  id: UUID;
  userId: UUID;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  createdAt: string;
}
