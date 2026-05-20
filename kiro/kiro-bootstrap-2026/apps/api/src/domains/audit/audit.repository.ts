import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

interface CreateAuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateAuditLogData): Promise<unknown> {
    return this.db.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        oldValues: data.oldValues ? JSON.parse(JSON.stringify(data.oldValues)) : undefined,
        newValues: data.newValues ? JSON.parse(JSON.stringify(data.newValues)) : undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async findMany(params: {
    where: Record<string, unknown>;
    skip: number;
    take: number;
  }): Promise<unknown[]> {
    return this.db.auditLog.findMany({
      where: params.where as any,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async count(where: Record<string, unknown>): Promise<number> {
    return this.db.auditLog.count({ where: where as any });
  }
}
