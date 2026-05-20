import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

/**
 * Service that determines what a user can see based on their leaderCode.
 * 
 * Rules:
 * - SUPER_ADMIN / ADMIN: sees everything
 * - A leader with code "E5": sees all users/groups whose leader has code starting with "E5" (E5, E5.1, E5.1.1, etc.)
 * - A leader with code "E5.1": sees only "E5.1" and descendants (E5.1.1, E5.1.2, etc.)
 * - A user without leaderCode: sees only their own groups (existing behavior)
 */
@Injectable()
export class HierarchyVisibilityService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Determines if the user has full visibility (admin/super_admin).
   */
  isFullAccess(roles: string[]): boolean {
    return roles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
  }

  /**
   * Get all user IDs that are visible to the given user based on their leaderCode.
   * Returns null if user has full access (admin).
   */
  async getVisibleUserIds(userId: string, roles: string[]): Promise<string[] | null> {
    if (this.isFullAccess(roles)) return null; // null = no filter (see all)

    const currentUser = await this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { leaderCode: true },
    });

    if (!currentUser?.leaderCode) {
      // No leader code — can only see themselves
      return [userId];
    }

    // Find all users whose leaderCode starts with this user's code
    // E.g. if my code is "E5", I see users with codes: E5, E5.1, E5.1.1, E5.2, etc.
    const subordinates = await this.db.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { leaderCode: currentUser.leaderCode }, // themselves
          { leaderCode: { startsWith: `${currentUser.leaderCode}.` } }, // descendants
        ],
      },
      select: { id: true },
    });

    // Also include users who are members of groups led by visible leaders
    const visibleLeaderIds = subordinates.map((u) => u.id);
    
    // Add the user themselves
    if (!visibleLeaderIds.includes(userId)) {
      visibleLeaderIds.push(userId);
    }

    return visibleLeaderIds;
  }

  /**
   * Get all group IDs that are visible to the given user.
   * A group is visible if its leader (LEADER role member) is in the visible users list.
   * Returns null if user has full access (admin).
   */
  async getVisibleGroupIds(userId: string, roles: string[]): Promise<string[] | null> {
    if (this.isFullAccess(roles)) return null; // null = no filter

    const visibleUserIds = await this.getVisibleUserIds(userId, roles);
    if (!visibleUserIds) return null;

    // Find groups where any visible user is LEADER or CO_LEADER
    const groupMembers = await this.db.groupMember.findMany({
      where: {
        userId: { in: visibleUserIds },
        role: { in: ['LEADER', 'CO_LEADER'] },
        leftAt: null,
      },
      select: { groupId: true },
    });

    return [...new Set(groupMembers.map((gm) => gm.groupId))];
  }

  /**
   * Get the leaderCode prefix for filtering.
   * Returns null if user has full access.
   * Returns the user's leaderCode if they have one.
   */
  async getCodePrefix(userId: string, roles: string[]): Promise<string | null> {
    if (this.isFullAccess(roles)) return null;

    const user = await this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { leaderCode: true },
    });

    return user?.leaderCode ?? null;
  }
}
