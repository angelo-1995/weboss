import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QUEUE_NAMES } from '../queue.constants';

/**
 * Processes domain events from the BullMQ events queue.
 * Re-emits them via EventEmitter2 for local handlers to consume.
 */
@Processor(QUEUE_NAMES.EVENTS)
export class EventProcessor {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Process({ name: '*' })
  async handleEvent(job: { name: string; data: Record<string, unknown> }): Promise<void> {
    const eventName = job.name;
    const payload = job.data;

    this.logger.debug(`Processing event: ${eventName}`);

    try {
      await this.eventEmitter.emitAsync(`queue.${eventName}`, payload);
      this.logger.debug(`Event "${eventName}" processed successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to process event "${eventName}": ${error instanceof Error ? error.message : 'Unknown'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
