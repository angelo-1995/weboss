import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { DomainEventName, DomainEventPayload } from './event-types';

/**
 * Service for emitting typed domain events via BullMQ.
 * Events are processed asynchronously with at-least-once delivery.
 */
@Injectable()
export class DomainEventsService {
  private readonly logger = new Logger(DomainEventsService.name);

  constructor(private readonly queueService: QueueService) {}

  /**
   * Emit a domain event to the BullMQ events queue.
   * The event will be processed asynchronously by the EventProcessor.
   */
  async emit(eventName: DomainEventName, payload: DomainEventPayload): Promise<void> {
    try {
      await this.queueService.addToEvents(eventName, payload as unknown as Record<string, unknown>);
      this.logger.debug(`Domain event emitted: ${eventName}`);
    } catch (error) {
      // Log but don't throw — events should not break the main flow
      this.logger.error(
        `Failed to emit domain event "${eventName}": ${error instanceof Error ? error.message : 'Unknown'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
