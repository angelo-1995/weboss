import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HierarchyVisibilityService } from '../hierarchy-visibility.service';

const mockDb = {
  user: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  groupMember: {
    findMany: vi.fn(),
  },
};

describe('HierarchyVisibilityService', () => {
  let service: HierarchyVisibilityService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HierarchyVisibilityService(mockDb as any);
  });

  describe('isFullAccess', () => {
    it('should return true for ADMIN role', () => {
      expect(service.isFullAccess(['ADMIN'])).toBe(true);
    });

    it('should return true for SUPER_ADMIN role', () => {
      expect(service.isFullAccess(['SUPER_ADMIN'])).toBe(true);
    });

    it('should return true when ADMIN is among multiple roles', () => {
      expect(service.isFullAccess(['LEADER', 'ADMIN'])).toBe(true);
    });

    it('should return false for LEADER role', () => {
      expect(service.isFullAccess(['LEADER'])).toBe(false);
    });

    it('should return false for MEMBER role', () => {
      expect(service.isFullAccess(['MEMBER'])).toBe(false);
    });

    it('should return false for empty roles', () => {
      expect(service.isFullAccess([])).toBe(false);
    });
  });

  describe('getVisibleGroupIds', () => {
    it('should return null for admin (no filter)', async () => {
      const result = await service.getVisibleGroupIds('user-1', ['ADMIN']);
      expect(result).toBeNull();
    });

    it('should return null for SUPER_ADMIN', async () => {
      const result = await service.getVisibleGroupIds('user-1', ['SUPER_ADMIN']);
      expect(result).toBeNull();
    });

    it('should return only own groups for leader with code E5.8', async () => {
      mockDb.user.findFirst.mockResolvedValue({ leaderCode: 'E5.8' });
      mockDb.user.findMany.mockResolvedValue([
        { id: 'user-e58' },
      ]);
      mockDb.groupMember.findMany.mockResolvedValue([
        { groupId: 'group-e58' },
      ]);

      const result = await service.getVisibleGroupIds('user-e58', ['LEADER']);

      expect(result).toEqual(['group-e58']);
      expect(mockDb.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            OR: [
              { leaderCode: 'E5.8' },
              { leaderCode: { startsWith: 'E5.8.' } },
            ],
          }),
        }),
      );
    });

    it('should return descendant groups for cobertura with code E5.6', async () => {
      mockDb.user.findFirst.mockResolvedValue({ leaderCode: 'E5.6' });
      mockDb.user.findMany.mockResolvedValue([
        { id: 'user-e56' },
        { id: 'user-e561' },
        { id: 'user-e562' },
        { id: 'user-e563' },
      ]);
      mockDb.groupMember.findMany.mockResolvedValue([
        { groupId: 'group-e56' },
        { groupId: 'group-e561' },
        { groupId: 'group-e562' },
        { groupId: 'group-e563' },
      ]);

      const result = await service.getVisibleGroupIds('user-e56', ['LEADER']);

      expect(result).toEqual(['group-e56', 'group-e561', 'group-e562', 'group-e563']);
    });

    it('should return only self when user has no leaderCode', async () => {
      mockDb.user.findFirst.mockResolvedValue({ leaderCode: null });

      const result = await service.getVisibleUserIds('user-no-code', ['LEADER']);

      expect(result).toEqual(['user-no-code']);
    });

    it('should deduplicate group IDs', async () => {
      mockDb.user.findFirst.mockResolvedValue({ leaderCode: 'E5' });
      mockDb.user.findMany.mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' },
      ]);
      // Same groupId appears twice (e.g. LEADER and CO_LEADER in same group)
      mockDb.groupMember.findMany.mockResolvedValue([
        { groupId: 'group-1' },
        { groupId: 'group-1' },
        { groupId: 'group-2' },
      ]);

      const result = await service.getVisibleGroupIds('user-1', ['LEADER']);

      expect(result).toHaveLength(2);
      expect(result).toContain('group-1');
      expect(result).toContain('group-2');
    });
  });

  describe('getVisibleUserIds', () => {
    it('should return null for admin', async () => {
      const result = await service.getVisibleUserIds('user-1', ['ADMIN']);
      expect(result).toBeNull();
    });

    it('should include user themselves when no subordinates match', async () => {
      mockDb.user.findFirst.mockResolvedValue({ leaderCode: 'E5.8' });
      mockDb.user.findMany.mockResolvedValue([{ id: 'other-user' }]);

      const result = await service.getVisibleUserIds('user-e58', ['LEADER']);

      expect(result).toContain('user-e58');
      expect(result).toContain('other-user');
    });
  });

  describe('getCodePrefix', () => {
    it('should return null for admin', async () => {
      const result = await service.getCodePrefix('user-1', ['ADMIN']);
      expect(result).toBeNull();
    });

    it('should return leaderCode for non-admin', async () => {
      mockDb.user.findFirst.mockResolvedValue({ leaderCode: 'E5.6' });

      const result = await service.getCodePrefix('user-1', ['LEADER']);

      expect(result).toBe('E5.6');
    });

    it('should return null when user has no leaderCode', async () => {
      mockDb.user.findFirst.mockResolvedValue({ leaderCode: null });

      const result = await service.getCodePrefix('user-1', ['LEADER']);

      expect(result).toBeNull();
    });
  });
});
