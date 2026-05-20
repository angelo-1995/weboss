import { Injectable, Logger } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { CacheService } from '../../infrastructure/cache/cache.service';
import type { UserRole } from '@community-os/types';

// RBAC defaults — what each role can do by default
// Inheritance chain: SUPER_ADMIN > ADMIN > LEADER > MEMBER > GUEST
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  SUPER_ADMIN: ['ADMIN', 'LEADER', 'MEMBER', 'GUEST'],
  ADMIN: ['LEADER', 'MEMBER', 'GUEST'],
  LEADER: ['MEMBER', 'GUEST'],
  MEMBER: ['GUEST'],
  GUEST: [],
};

const ROLE_DEFAULTS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*:*'],
  ADMIN: [
    'users:*', 'groups:*', 'memberships:*',
    'discipleship:*', 'reports:read', 'audit:read',
    'permissions:read',
  ],
  LEADER: [
    'users:read', 'groups:read', 'groups:create', 'groups:update',
    'memberships:read', 'memberships:create',
    'discipleship:read', 'discipleship:create', 'discipleship:update',
    'reports:read',
  ],
  MEMBER: ['users:read', 'groups:read', 'discipleship:read', 'memberships:read'],
  GUEST: ['groups:read'],
};

const CACHE_TTL = 300; // 5 min

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private readonly repository: PermissionsRepository,
    private readonly cache: CacheService,
  ) {}

  /**
   * Main check: can this user perform action on resource?
   * Order: SUPER_ADMIN bypass → explicit deny → explicit grant → role default
   */
  async can(
    userId: string,
    roles: UserRole[],
    resource: string,
    action: string,
    resourceId?: string,
  ): Promise<boolean> {
    // SUPER_ADMIN bypasses everything
    if (roles.includes('SUPER_ADMIN')) return true;

    const cacheKey = `perm:${userId}:${resource}:${action}:${resourceId ?? '*'}`;

    return this.cache.getOrSet(cacheKey, async () => {
      // 1. Check explicit user-level overrides (ABAC)
      const overrides = await this.repository.findUserPermissionOverrides(userId, resource, action, resourceId);

      // Explicit deny takes priority
      const deny = overrides.find((o) => !o.granted);
      if (deny) return false;

      // Explicit grant
      const grant = overrides.find((o) => o.granted);
      if (grant) return true;

      // 2. Fall back to role defaults
      return this.checkRoleDefaults(roles, resource, action);
    }, CACHE_TTL);
  }

  private checkRoleDefaults(roles: UserRole[], resource: string, action: string): boolean {
    // Resolve all roles including inherited ones
    const allRoles = this.resolveRoleHierarchy(roles);

    for (const role of allRoles) {
      const perms = ROLE_DEFAULTS[role] ?? [];
      if (
        perms.includes('*:*') ||
        perms.includes(`${resource}:*`) ||
        perms.includes(`${resource}:${action}`) ||
        perms.includes(`*:${action}`)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resolve role hierarchy — returns all roles a user effectively has
   * through inheritance.
   */
  private resolveRoleHierarchy(roles: UserRole[]): UserRole[] {
    const resolved = new Set<UserRole>(roles);
    for (const role of roles) {
      const inherited = ROLE_HIERARCHY[role] ?? [];
      for (const r of inherited) {
        resolved.add(r);
      }
    }
    return Array.from(resolved);
  }

  /**
   * ABAC check: verify the user has access to the specific resource
   * based on attributes (e.g., same campus).
   */
  async canAccessResource(
    userId: string,
    roles: UserRole[],
    resource: string,
    action: string,
    resourceOwnerId?: string,
    resourceCampusId?: string,
  ): Promise<boolean> {
    // First check basic RBAC
    const rbacAllowed = await this.can(userId, roles, resource, action);
    if (!rbacAllowed) return false;

    // SUPER_ADMIN and ADMIN bypass ABAC
    if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) return true;

    // ABAC: For LEADER role, check campus match
    if (resourceCampusId && roles.includes('LEADER')) {
      const user = await this.repository.findUserById(userId);
      if (user?.campusId && user.campusId !== resourceCampusId) {
        return false;
      }
    }

    return true;
  }

  /**
   * Invalidate cache for all users with a specific role.
   * Called when role permissions are modified.
   */
  async invalidateRoleCache(role: UserRole): Promise<void> {
    const users = await this.repository.findUsersByRole(role);

    for (const user of users) {
      await this.invalidateUserCache(user.id);
    }

    this.logger.log(`Cache invalidated for ${users.length} users with role ${role}`);
  }

  async getUserPermissions(userId: string) {
    return this.repository.findUserPermissions(userId);
  }

  async grantPermission(params: {
    userId: string;
    resource: string;
    action: string;
    resourceId?: string;
    expiresAt?: Date;
    actorId: string;
  }) {
    const result = await this.repository.grantPermission({
      userId: params.userId,
      resource: params.resource,
      action: params.action,
      resourceId: params.resourceId,
      expiresAt: params.expiresAt,
    });
    await this.invalidateUserCache(params.userId);
    return result;
  }

  async denyPermission(params: {
    userId: string;
    resource: string;
    action: string;
    resourceId?: string;
  }) {
    const result = await this.repository.denyPermission(params);
    await this.invalidateUserCache(params.userId);
    return result;
  }

  async revokePermission(permissionId: string, userId: string) {
    await this.repository.revokePermission(permissionId);
    await this.invalidateUserCache(userId);
  }

  async getEffectivePermissions(userId: string, roles: UserRole[]) {
    const rolePerms = roles.flatMap((r) => ROLE_DEFAULTS[r] ?? []);
    const userOverrides = await this.getUserPermissions(userId);
    return {
      fromRoles: [...new Set(rolePerms)],
      overrides: userOverrides,
    };
  }

  private async invalidateUserCache(userId: string) {
    await this.cache.delPattern(`perm:${userId}:*`);
  }
}
