import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '../queue.constants';
import { DatabaseService } from '../../database/database.service';

@Processor(QUEUE_NAMES.AUDIT)
export class AuditProcessor {
  private readonly logger = new Logger(AuditProcessor.name);

  constructor(private readonly db: DatabaseService) {}

  @Process('audit-log')
  async handleAuditLog(job: { data: Record<string, unknown> }): Promise<void> {
    const { userId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent } = job.data;

    try {
      await this.db.auditLog.create({
        data: {
          userId: userId as string,
          action: action as string,
          resource: entityType as string,
          resourceId: entityId as string,
          oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : undefined,
          newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : undefined,
          ipAddress: (ipAddress as string) || null,
          userAgent: (userAgent as string) || null,
        },
      });

      this.logger.debug(`Audit log written: ${action} on ${entityType}/${entityId}`);
    } catch (error) {
      this.logger.error(
        `Failed to write audit log: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error; // Let Bull retry
    }
  }
}
