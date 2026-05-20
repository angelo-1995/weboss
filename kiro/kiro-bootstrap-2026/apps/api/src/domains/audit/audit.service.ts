import { Injectable, Logger } from '@nestjs/common';
import { AuditRepository } from './audit.repository';

interface AuditLogParams {
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
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly repository: AuditRepository) {}

  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.repository.create(params);
    } catch (err) {
      // Audit failures must never break the main flow
      this.logger.error('Failed to write audit log', err);
    }
  }

  async findMany(params: {
    userId?: string;
    resource?: string;
    action?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: unknown[]; meta: { total: number; page: number; pageSize: number; hasNextPage: boolean; hasPrevPage: boolean } }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const { userId, resource, action } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(userId && { userId }),
      ...(resource && { resource }),
      ...(action && { action: { contains: action } }),
    };

    const [data, total] = await Promise.all([
      this.repository.findMany({ where, skip, take: pageSize }),
      this.repository.count(where),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        hasNextPage: page * pageSize < total,
        hasPrevPage: page > 1,
      },
    };
  }
}
