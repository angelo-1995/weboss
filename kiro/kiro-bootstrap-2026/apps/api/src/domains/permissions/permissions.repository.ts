import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import type { UserRole } from '@community-os/types';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findUserPermissionOverrides(userId: string, resource: string, action: string, resourceId?: string) {
    return this.db.userPermission.findMany({
      where: {
        userId,
        resource,
        action: action.toUpperCase() as never,
        OR: [
          { resourceId: null },
          { resourceId },
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUserById(userId: string) {
    return this.db.user.findUnique({
      where: { id: userId },
      select: { campusId: true },
    });
  }

  async findUsersByRole(role: UserRole) {
    return this.db.user.findMany({
      where: { roles: { has: role }, deletedAt: null },
      select: { id: true },
    });
  }

  async findUserPermissions(userId: string) {
    return this.db.userPermission.findMany({
      where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: { createdAt: 'desc' },
    });
  }

  async grantPermission(params: {
    userId: string;
    resource: string;
    action: string;
    resourceId?: string;
    expiresAt?: Date;
  }) {
    return this.db.userPermission.create({
      data: {
        userId: params.userId,
        resource: params.resource,
        action: params.action.toUpperCase() as never,
        resourceId: params.resourceId,
        granted: true,
        expiresAt: params.expiresAt,
      },
    });
  }

  async denyPermission(params: {
    userId: string;
    resource: string;
    action: string;
    resourceId?: string;
  }) {
    return this.db.userPermission.create({
      data: {
        userId: params.userId,
        resource: params.resource,
        action: params.action.toUpperCase() as never,
        resourceId: params.resourceId,
        granted: false,
      },
    });
  }

  async revokePermission(permissionId: string) {
    return this.db.userPermission.delete({ where: { id: permissionId } });
  }
}
