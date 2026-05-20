import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { AsyncContextService } from '../logger/async-context.service';

export const AUDITABLE_KEY = 'auditable_entity_type';

/**
 * Decorator to mark a controller method as auditable.
 * @param entityType - The entity type being modified (e.g., 'User', 'Group')
 */
export const Auditable = (entityType: string) => SetMetadata(AUDITABLE_KEY, entityType);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly queueService: QueueService,
    private readonly asyncContext: AsyncContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const entityType = this.reflector.get<string>(AUDITABLE_KEY, context.getHandler());

    // Only audit if the handler is decorated with @Auditable
    if (!entityType) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const method = req.method;

    // Only audit write operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const action = this.methodToAction(method);
    const userId = this.asyncContext.getUserId() || req.user?.id;
    const entityId = req.params?.id;
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers?.['user-agent'];

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          await this.queueService.addToAudit({
            userId,
            action,
            entityType,
            entityId: entityId || responseData?.id || 'unknown',
            oldValues: null, // Could be populated with a pre-fetch in the future
            newValues: method === 'DELETE' ? null : req.body,
            ipAddress,
            userAgent,
          });
        } catch {
          // Audit should never break the main flow — errors are logged by QueueService
        }
      }),
    );
  }

  private methodToAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'UNKNOWN';
    }
  }
}
