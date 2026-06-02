import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { HierarchyVisibilityService } from './hierarchy-visibility.service';

/**
 * Determines what ACTIONS a user can perform on a Person.
 *
 * ADR-011: Visibility (who can SEE) ≠ Ownership (who can ACT)
 *
 * Rules:
 * - Owner (ownerLeaderId matches userId): full edit, disciple, promote, follow-up
 * - Cobertura (parent hierarchy of ownerLeader): view, supervise, comment only
 * - Pastor de Red: view, supervise, reassign ownership
 * - Pastor General (ADMIN/SUPER_ADMIN): everything
 */
@Injectable()
export class OwnershipService {
  constructor(
    private readonly db: DatabaseService,
    private readonly hierarchy: HierarchyVisibilityService,
  ) {}

  /**
   * Check if a user is the owner of a person.
   */
  async isOwner(userId: string, personId: string): Promise<boolean> {
    const person = await this.db.person.findUnique({
      where: { id: personId },
      select: { ownerLeaderId: true },
    });
    return person?.ownerLeaderId === userId;
  }

  /**
   * Check if a user can perform ownership actions (edit, promote, disciple) on a person.
   *
   * Returns: { canEdit, canPromote, canDisciple, canReassign, canSupervise }
   */
  async getPermissions(
    userId: string,
    roles: string[],
    personId: string,
  ): Promise<OwnershipPermissions> {
    // Admin/Super_Admin can do everything
    if (this.hierarchy.isFullAccess(roles)) {
      return {
        canEdit: true,
        canPromote: true,
        canDisciple: true,
        canReassign: true,
        canSupervise: true,
      };
    }

    const person = await this.db.person.findUnique({
      where: { id: personId },
      select: { ownerLeaderId: true, currentGroupId: true },
    });

    if (!person) {
      return {
        canEdit: false,
        canPromote: false,
        canDisciple: false,
        canReassign: false,
        canSupervise: false,
      };
    }

    // Check if user is the direct owner
    if (person.ownerLeaderId === userId) {
      return {
        canEdit: true,
        canPromote: true,
        canDisciple: true,
        canReassign: false,
        canSupervise: true,
      };
    }

    // Check if user is Pastor de Red (can reassign but not directly edit)
    const currentUser = await this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { leaderCode: true, ministerialRole: true },
    });

    if (
      currentUser?.ministerialRole === 'PASTOR_RED' ||
      currentUser?.ministerialRole === 'PASTOR_GENERAL'
    ) {
      return {
        canEdit: false,
        canPromote: false,
        canDisciple: false,
        canReassign: true,
        canSupervise: true,
      };
    }

    // Check if user is Cobertura (can supervise/comment but not edit/promote)
    if (currentUser?.ministerialRole === 'COBERTURA') {
      return {
        canEdit: false,
        canPromote: false,
        canDisciple: false,
        canReassign: false,
        canSupervise: true,
      };
    }

    // Default: no permissions (user can see via visibility but not act)
    return {
      canEdit: false,
      canPromote: false,
      canDisciple: false,
      canReassign: false,
      canSupervise: false,
    };
  }

  /**
   * Transfer ownership when a person moves to a new group.
   * The new owner is the LEADER of the target group.
   */
  async transferOwnership(
    personId: string,
    toGroupId: string,
    _transferredBy: string,
    _reason?: string,
  ): Promise<void> {
    // Find the leader of the target group
    const leader = await this.db.groupMember.findFirst({
      where: { groupId: toGroupId, role: 'LEADER', leftAt: null },
      select: { userId: true },
    });

    const newOwnerId = leader?.userId ?? null;

    // Update ownership
    await this.db.person.update({
      where: { id: personId },
      data: { ownerLeaderId: newOwnerId },
    });

    // The transfer event itself is handled by PersonsService.transfer()
    // This method only updates the ownerLeaderId field
  }
}

export interface OwnershipPermissions {
  canEdit: boolean;
  canPromote: boolean;
  canDisciple: boolean;
  canReassign: boolean;
  canSupervise: boolean;
}
