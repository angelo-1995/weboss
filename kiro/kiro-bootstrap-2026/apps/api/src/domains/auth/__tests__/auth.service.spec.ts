import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';

vi.mock('argon2', () => ({
  verify: vi.fn(),
  hash: vi.fn().mockResolvedValue('$argon2id$hashed-password'),
  argon2id: 2,
}));

const mockDb = {
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
};

const mockTokenService = {
  generateTokenPair: vi.fn().mockResolvedValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }),
  signAccessToken: vi.fn().mockReturnValue('signed-access-token'),
  getRefreshExpiresAt: vi.fn().mockReturnValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
};

const mockSessionService = {
  create: vi.fn().mockResolvedValue({ id: 'session-id', familyId: 'family-id' }),
  findByRefreshToken: vi.fn(),
  revoke: vi.fn(),
  revokeAllForUser: vi.fn(),
  revokeFamily: vi.fn(),
  isTokenReused: vi.fn().mockResolvedValue({ reused: false }),
};

const mockEvents = {
  emit: vi.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTokenService.generateTokenPair.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    mockTokenService.signAccessToken.mockReturnValue('signed-access-token');
    mockTokenService.getRefreshExpiresAt.mockReturnValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    mockSessionService.create.mockResolvedValue({ id: 'session-id', familyId: 'family-id' });
    mockSessionService.isTokenReused.mockResolvedValue({ reused: false });

    service = new AuthService(
      mockDb as any,
      mockTokenService as any,
      mockSessionService as any,
      mockEvents as any,
    );
  });

  describe('register', () => {
    it('should create user with hashed password and return tokens', async () => {
      mockDb.user.findFirst.mockResolvedValue(null);
      mockDb.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@test.com',
        roles: ['MEMBER'],
      });

      const result = await service.register(
        { email: 'new@test.com', password: 'SecurePass1!', firstName: 'John', lastName: 'Doe' },
        { ip: '127.0.0.1', userAgent: 'test-agent' },
      );

      expect(argon2.hash).toHaveBeenCalledWith('SecurePass1!', expect.objectContaining({
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      }));
      expect(mockDb.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@test.com',
          password: '$argon2id$hashed-password',
          firstName: 'John',
          lastName: 'Doe',
          status: 'ACTIVE',
          roles: ['MEMBER'],
        }),
      }));
      expect(result).toEqual({
        accessToken: 'signed-access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockEvents.emit).toHaveBeenCalledWith('auth.user.registered', expect.objectContaining({
        userId: 'user-1',
        email: 'new@test.com',
      }));
    });

    it('should throw ConflictException if email already exists', async () => {
      mockDb.user.findFirst.mockResolvedValue({ id: 'existing-user', email: 'existing@test.com' });

      await expect(
        service.register(
          { email: 'existing@test.com', password: 'Pass123!x', firstName: 'Test', lastName: 'User' },
          {},
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockDb.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      mockDb.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'valid@test.com',
        password: '$argon2id$valid-hash',
        status: 'ACTIVE',
        roles: ['MEMBER'],
      });
      (argon2.verify as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await service.login(
        { email: 'valid@test.com', password: 'CorrectPass1!' },
        { ip: '127.0.0.1', userAgent: 'test-agent' },
      );

      expect(result).toEqual({
        accessToken: 'signed-access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockEvents.emit).toHaveBeenCalledWith('auth.user.login', expect.objectContaining({
        userId: 'user-1',
      }));
      expect(mockSessionService.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockDb.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'valid@test.com',
        password: '$argon2id$valid-hash',
        status: 'ACTIVE',
        roles: ['MEMBER'],
      });
      (argon2.verify as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      await expect(
        service.login({ email: 'valid@test.com', password: 'WrongPass1!' }, {}),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent email with generic message', async () => {
      mockDb.user.findFirst.mockResolvedValue(null);

      try {
        await service.login({ email: 'nonexistent@test.com', password: 'Pass123!' }, {});
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Invalid credentials');
        expect(e.message).not.toContain('email');
        expect(e.message).not.toContain('not found');
      }
    });

    it('should throw UnauthorizedException for SUSPENDED user', async () => {
      mockDb.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'suspended@test.com',
        password: '$argon2id$hash',
        status: 'SUSPENDED',
        roles: ['MEMBER'],
      });

      await expect(
        service.login({ email: 'suspended@test.com', password: 'Pass123!' }, {}),
      ).rejects.toThrow(UnauthorizedException);

      // Should not even attempt password verification
      expect(argon2.verify).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should rotate tokens and return new pair', async () => {
      mockSessionService.isTokenReused.mockResolvedValue({ reused: false });
      mockSessionService.findByRefreshToken.mockResolvedValue({
        id: 'old-session-id',
        familyId: 'family-1',
        user: { id: 'user-1', email: 'user@test.com', roles: ['MEMBER'], status: 'ACTIVE' },
      });

      const result = await service.refresh('valid-refresh-token', { ip: '127.0.0.1' });

      expect(mockSessionService.revoke).toHaveBeenCalledWith('old-session-id');
      expect(mockSessionService.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'signed-access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should detect replay attack and revoke entire family', async () => {
      mockSessionService.isTokenReused.mockResolvedValue({
        reused: true,
        familyId: 'compromised-family',
      });

      await expect(
        service.refresh('reused-token', {}),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockSessionService.revokeFamily).toHaveBeenCalledWith('compromised-family');
    });
  });

  describe('logout', () => {
    it('should revoke the session', async () => {
      await service.logout('session-123');

      expect(mockSessionService.revoke).toHaveBeenCalledWith('session-123');
    });
  });
});
