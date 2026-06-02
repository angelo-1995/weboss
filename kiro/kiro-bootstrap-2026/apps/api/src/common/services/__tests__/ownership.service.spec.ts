import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OwnershipService } from '../ownership.service';
import { HierarchyVisibilityService } from '../hierarchy-visibility.service';

const mockDb = {
  person: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
  groupMember: {
    findFirst: vi.fn(),
  },
};

const mockHierarchy = {
  isFullAccess: vi.fn(),
} as unknown as HierarchyVisibilityService;

describe('OwnershipService', () => {
  let service: OwnershipService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OwnershipService(mockDb as any, mockHierarchy);
  });

  describe('isOwner', () => {
    it('should return true when user is the owner', async () => {
      mockDb.person.findUnique.mockResolvedValue({ ownerLeaderId: 'user-1' });

      const result = await service.isOwner('user-1', 'person-1');

      expect(result).toBe(true);
    });

    it('should return false when user is not the owner', async () => {
      mockDb.person.findUnique.mockResolvedValue({ ownerLeaderId: 'user-2' });

      const result = await service.isOwner('user-1', 'person-1');

      expect(result).toBe(false);
    });

    it('should return false when person does not exist', async () => {
      mockDb.person.findUnique.mockResolvedValue(null);

      const result = await service.isOwner('user-1', 'nonexistent');

      expect(result).toBe(false);
    });

    it('should return false when ownerLeaderId is null', async () => {
      mockDb.person.findUnique.mockResolvedValue({ ownerLeaderId: null });

      const result = await service.isOwner('user-1', 'person-1');

      expect(result).toBe(false);
    });
  });

  describe('getPermissions', () => {
    it('should return full permissions for admin', async () => {
      (mockHierarchy.isFullAccess as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const result = await service.getPermissions('admin-1', ['ADMIN'], 'person-1');

      expect(result).toEqual({
        canEdit: true,
        canPromote: true,
        canDisciple: true,
        canReassign: true,
        canSupervise: true,
      });
      // Should not even query the database
      expect(mockDb.person.findUnique).not.toHaveBeenCalled();
    });

    it('should return owner permissions when user is the direct owner', async () => {
      (mockHierarchy.isFullAccess as ReturnType<typeof vi.fn>).mockReturnValue(false);
      mockDb.person.findUnique.mockResolvedValue({
        ownerLeaderId: 'leader-1',
        currentGroupId: 'group-1',
      });

      const result = await service.getPermissions('leader-1', ['LEADER'], 'person-1');

      expect(result).toEqual({
        canEdit: true,
        canPromote: true,
        canDisciple: true,
        canReassign: false,
        canSupervise: true,
      });
    });

    it('should return supervise-only permissions for cobertura', async () => {
      (mockHierarchy.isFullAccess as ReturnType<typeof vi.fn>).mockReturnValue(false);
      mockDb.person.findUnique.mockResolvedValue({
        ownerLeaderId: 'other-leader',
        currentGroupId: 'group-1',
      });
      mockDb.user.findFirst.mockResolvedValue({
        leaderCode: 'E5.6',
        ministerialRole: 'COBERTURA',
      });

      const result = await service.getPermissions('cobertura-1', ['LEADER'], 'person-1');

      expect(result).toEqual({
        canEdit: false,
        canPromote: false,
        canDisciple: false,
        canReassign: false,
        canSupervise: true,
      });
    });

    it('should return reassign permissions for pastor de red', async () => {
      (mockHierarchy.isFullAccess as ReturnType<typeof vi.fn>).mockReturnValue(false);
      mockDb.person.findUnique.mockResolvedValue({
        ownerLeaderId: 'other-leader',
        currentGroupId: 'group-1',
      });
      mockDb.user.findFirst.mockResolvedValue({
        leaderCode: 'E5',
        ministerialRole: 'PASTOR_RED',
      });

      const result = await service.getPermissions('pastor-red-1', ['LEADER'], 'person-1');

      expect(result).toEqual({
        canEdit: false,
        canPromote: false,
        canDisciple: false,
        canReassign: true,
        canSupervise: true,
      });
    });

    it('should return no permissions for non-related user', async () => {
      (mockHierarchy.isFullAccess as ReturnType<typeof vi.fn>).mockReturnValue(false);
      mockDb.person.findUnique.mockResolvedValue({
        ownerLeaderId: 'other-leader',
        currentGroupId: 'group-1',
      });
      mockDb.user.findFirst.mockResolvedValue({
        leaderCode: 'E3.1',
        ministerialRole: 'LIDER',
      });

      const result = await service.getPermissions('unrelated-user', ['LEADER'], 'person-1');

      expect(result).toEqual({
        canEdit: false,
        canPromote: false,
        canDisciple: false,
        canReassign: false,
        canSupervise: false,
      });
    });

    it('should return no permissions when person does not exist', async () => {
      (mockHierarchy.isFullAccess as ReturnType<typeof vi.fn>).mockReturnValue(false);
      mockDb.person.findUnique.mockResolvedValue(null);

      const result = await service.getPermissions('user-1', ['LEADER'], 'nonexistent');

      expect(result).toEqual({
        canEdit: false,
        canPromote: false,
        canDisciple: false,
        canReassign: false,
        canSupervise: false,
      });
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership to the leader of the target group', async () => {
      mockDb.groupMember.findFirst.mockResolvedValue({ userId: 'new-leader' });
      mockDb.person.findUnique.mockResolvedValue({
        ownerLeaderId: 'old-leader',
        currentGroupId: 'old-group',
      });
      mockDb.person.update.mockResolvedValue({});

      await service.transferOwnership('person-1', 'new-group', 'admin-user');

      expect(mockDb.person.update).toHaveBeenCalledWith({
        where: { id: 'person-1' },
        data: { ownerLeaderId: 'new-leader' },
      });
    });

    it('should set ownerLeaderId to null when target group has no leader', async () => {
      mockDb.groupMember.findFirst.mockResolvedValue(null);
      mockDb.person.findUnique.mockResolvedValue({
        ownerLeaderId: 'old-leader',
        currentGroupId: 'old-group',
      });
      mockDb.person.update.mockResolvedValue({});

      await service.transferOwnership('person-1', 'empty-group', 'admin-user');

      expect(mockDb.person.update).toHaveBeenCalledWith({
        where: { id: 'person-1' },
        data: { ownerLeaderId: null },
      });
    });
  });
});
