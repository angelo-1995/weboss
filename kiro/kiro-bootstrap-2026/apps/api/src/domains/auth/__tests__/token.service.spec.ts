import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenService } from '../token.service';

const mockJwtService = {
  sign: vi.fn().mockReturnValue('jwt-access-token'),
  verify: vi.fn(),
};

const mockConfigService = {
  get: vi.fn().mockReturnValue('7d'),
};

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockJwtService.sign.mockReturnValue('jwt-access-token');
    mockConfigService.get.mockReturnValue('7d');

    service = new TokenService(mockJwtService as any, mockConfigService as any);
  });

  describe('generateTokenPair', () => {
    it('should return access and refresh tokens', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        roles: ['MEMBER'],
        sessionId: 'session-1',
      };

      const result = await service.generateTokenPair(payload);

      expect(result.accessToken).toBe('jwt-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(typeof result.refreshToken).toBe('string');
      // Refresh token is a 64-byte hex string = 128 chars
      expect(result.refreshToken).toHaveLength(128);
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
    });
  });

  describe('signAccessToken', () => {
    it('should create a valid JWT with correct payload', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        roles: ['MEMBER', 'LEADER'],
        sessionId: 'session-1',
      };

      const result = service.signAccessToken(payload);

      expect(result).toBe('jwt-access-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRefreshExpiresAt', () => {
    it('should return a date in the future based on config', () => {
      const before = new Date();
      const result = service.getRefreshExpiresAt();
      const after = new Date();

      // Should be approximately 7 days from now
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime() + sevenDaysMs - 1000);
      expect(result.getTime()).toBeLessThanOrEqual(after.getTime() + sevenDaysMs + 1000);
    });
  });
});
