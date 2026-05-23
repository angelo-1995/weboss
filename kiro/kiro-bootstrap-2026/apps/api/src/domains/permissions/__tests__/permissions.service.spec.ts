import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PermissionsService } from '../permissions.service';

const mockRepository = {
  findUserPermissionOverrides: vi.fn(),
  findUserById: vi.fn(),
  findUsersByRole: vi.fn(),
  findUserPermissions: vi.fn(),
  grantPermission: vi.fn(),
  denyPermission: vi.fn(),
  revokePermission: vi.fn(),
};

const mockCache = {
  getOrSet: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  delPattern: vi.fn(),
};

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(() => {
    vi.clearAllMocks();
    // By default, getOrSet executes the factory function directly
    mockCache.getOrSet.mockImplementation(async (_key: string, factory: () => Promise<boolean>) => {
      return factory();
    });

    service = new PermissionsService(mockRepository as any, mockCache as any);
  });

  describe('can', () => {
    it('should return true for SUPER_ADMIN (bypasses all checks)', async () => {
      const result = await service.can('user-1', ['SUPER_ADMIN'], 'users', 'delete');

      expect(result).toBe(true);
      // Should not even check cache or repository
      expect(mockCache.getOrSet).not.toHaveBeenCalled();
      expect(mockRepository.findUserPermissionOverrides).not.toHaveBeenCalled();
    });

    it('should return true when role has the permission', async () => {
      mockRepository.findUserPermissionOverrides.mockResolvedValue([]);

      const result = await service.can('user-1', ['ADMIN'], 'users', 'read');

      expect(result).toBe(true);
    });

    it('should return false when role lacks the permission', async () => {
      mockRepository.findUserPermissionOverrides.mockResolvedValue([]);

      const result = await service.can('user-1', ['GUEST'], 'users', 'create');

      expect(result).toBe(false);
    });

    it('should check user-level overrides — explicit grant', async () => {
      mockRepository.findUserPermissionOverrides.mockResolvedValue([
        { id: 'perm-1', userId: 'user-1', resource: 'reports', action: 'CREATE', granted: true },
      ]);

      // GUEST normally cannot create reports, but has an explicit grant
      const result = await service.can('user-1', ['GUEST'], 'reports', 'create');

      expect(result).toBe(true);
    });

    it('should check user-level overrides — explicit deny takes priority', async () => {
      mockRepository.findUserPermissionOverrides.mockResolvedValue([
        { id: 'perm-1', userId: 'user-1', resource: 'users', action: 'READ', granted: false },
      ]);

      // ADMIN normally can read users, but has an explicit deny
      const result = await service.can('user-1', ['ADMIN'], 'users', 'read');

      expect(result).toBe(false);
    });

    it('should respect permission expiration (expired overrides not returned by repo)', async () => {
      // The repository already filters expired permissions (expiresAt > now),
      // so if no overrides are returned, it falls back to role defaults.
      mockRepository.findUserPermissionOverrides.mockResolvedValue([]);

      // MEMBER has 'users:read' by default
      const result = await service.can('user-1', ['MEMBER'], 'users', 'read');

      expect(result).toBe(true);
      expect(mockRepository.findUserPermissionOverrides).toHaveBeenCalledWith(
        'user-1', 'users', 'read', undefined,
      );
    });
  });
});
