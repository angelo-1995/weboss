import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { OnEvent } from '@nestjs/event-emitter';
import type { Queue } from 'bullmq';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { QUEUE_NAMES } from '../../infrastructure/queue/queue.constants';

/**
 * SermonNotificationService
 *
 * Handles fan-out notifications when a sermon is published.
 * Creates in-site Notification records and enqueues email jobs
 * for all active members in the sermon's network.
 *
 * Rate limiting: Members are processed in batches of 100 with
 * a 50ms delay between batches to avoid overwhelming the database.
 */
@Injectable()
export class SermonNotificationService {
  private readonly logger = new Logger(SermonNotificationService.name);

  private static readonly BATCH_SIZE = 100;
  private static readonly BATCH_DELAY_MS = 50;

  constructor(
    private readonly db: DatabaseService,
    @InjectQueue(QUEUE_NAMES.SERMONS) private readonly sermonsQueue: Queue,
  ) {}

  /**
   * Event listener for sermon.published events.
   * Triggered both by immediate publish and scheduled publish.
   */
  @OnEvent('sermon.published')
  async handleSermonPublished(payload: {
    sermonId: string;
    networkId: string;
    title?: string;
    description?: string;
  }) {
    // Fetch full sermon data if title/description not provided in event
    let title = payload.title;
    let description = payload.description;

    if (!title) {
      const sermon = await this.db.sermon.findUnique({
        where: { id: payload.sermonId },
        select: { title: true, description: true },
      });
      if (!sermon) {
        this.logger.warn(`Sermon ${payload.sermonId} not found for notification`);
        return;
      }
      title = sermon.title;
      description = sermon.description ?? undefined;
    }

    await this.notifyNetworkMembers({
      id: payload.sermonId,
      networkId: payload.networkId,
      title: title!,
      description: description ?? '',
    });
  }

  /**
   * Notify all active members in a network about a published sermon.
   *
   * 1. Fetches all active users with matching networkId
   * 2. Batch-inserts Notification records (type: 'sermon_published')
   * 3. Enqueues sermon-email jobs per member
   * 4. Processes in batches of 100 with 50ms delay between batches
   */
  async notifyNetworkMembers(sermon: {
    id: string;
    networkId: string;
    title: string;
    description: string;
  }): Promise<void> {
    const members = await this.db.user.findMany({
      where: {
        networkId: sermon.networkId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true, email: true, firstName: true },
    });

    if (members.length === 0) {
      this.logger.log(`No active members found in network ${sermon.networkId}`);
      return;
    }

    this.logger.log(
      `Notifying ${members.length} member(s) for sermon "${sermon.title}" (network: ${sermon.networkId})`,
    );

    const excerpt = sermon.description
      ? sermon.description.substring(0, 150)
      : '';
    const link = `/sermons/${sermon.id}`;

    // Process in batches of 100 with 50ms delay between batches
    for (let i = 0; i < members.length; i += SermonNotificationService.BATCH_SIZE) {
      const batch = members.slice(i, i + SermonNotificationService.BATCH_SIZE);

      // Batch-insert in-site notifications
      await this.db.notification.createMany({
        data: batch.map((member) => ({
          userId: member.id,
          type: 'sermon_published',
          title: sermon.title,
          body: excerpt,
          link,
          sermonId: sermon.id,
        })),
      });

      // Enqueue email jobs for each member in the batch
      const emailJobs = batch.map((member) => ({
        name: 'sermon-email',
        data: {
          userId: member.id,
          email: member.email,
          sermonTitle: sermon.title,
          sermonExcerpt: excerpt,
          sermonLink: link,
        },
        opts: {
          attempts: 3,
          backoff: { type: 'exponential' as const, delay: 5000 },
        },
      }));

      await this.sermonsQueue.addBulk(emailJobs);

      // Rate limiting: delay between batches (skip delay on last batch)
      if (i + SermonNotificationService.BATCH_SIZE < members.length) {
        await this.delay(SermonNotificationService.BATCH_DELAY_MS);
      }
    }

    this.logger.log(
      `Notifications created and email jobs enqueued for ${members.length} member(s)`,
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
