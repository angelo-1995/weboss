import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

// Mock argon2 to avoid needing real hashes in tests
vi.mock('argon2', () => ({
  verify: vi.fn().mockResolvedValue(false),
  hash: vi.fn().mockResolvedValue('$argon2id$hashed'),
  argon2id: 2,
}));

// Mock dependencies
const mockDb = {
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
};

const mockTokenService = {
  generateTokenPair: vi.fn(),
  signAccessToken: vi.fn(),
  getRefreshExpiresAt: vi.fn(),
};

const mockSessionService = {
  create: vi.fn(),
  revoke: vi.fn(),
  revokeAllForUser: vi.fn(),
  findByRefreshToken: vi.fn(),
  isTokenReused: vi.fn(),
  revokeFamily: vi.fn(),
};

const mockEvents = {
  emit: vi.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      mockDb as any,
      mockTokenService as any,
      mockSessionService as any,
      mockEvents as any,
    );
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent email', async () => {
      mockDb.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: 'pass123' }, {}),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for suspended user', async () => {
      mockDb.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
        status: 'SUSPENDED',
        roles: ['MEMBER'],
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'pass123' }, {}),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockDb.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$wronghash',
        status: 'ACTIVE',
        roles: ['MEMBER'],
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpass' }, {}),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not reveal whether email exists in error message', async () => {
      mockDb.user.findFirst.mockResolvedValue(null);

      try {
        await service.login({ email: 'nonexistent@test.com', password: 'pass' }, {});
      } catch (e: any) {
        expect(e.message).toBe('Invalid credentials');
        expect(e.message).not.toContain('email');
        expect(e.message).not.toContain('not found');
      }
    });
  });

  describe('register', () => {
    it('should throw ConflictException for duplicate email', async () => {
      mockDb.user.findFirst.mockResolvedValue({ id: '1', email: 'existing@test.com' });

      await expect(
        service.register(
          { email: 'existing@test.com', password: 'Pass123!', firstName: 'Test', lastName: 'User' },
          {},
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refresh', () => {
    it('should revoke entire token family on replay attack', async () => {
      mockSessionService.isTokenReused.mockResolvedValue({
        reused: true,
        familyId: 'family-123',
      });

      await expect(
        service.refresh('reused-token', {}),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockSessionService.revokeFamily).toHaveBeenCalledWith('family-123');
    });

    it('should throw for invalid refresh token', async () => {
      mockSessionService.isTokenReused.mockResolvedValue({ reused: false });
      mockSessionService.findByRefreshToken.mockResolvedValue(null);

      await expect(
        service.refresh('invalid-token', {}),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
