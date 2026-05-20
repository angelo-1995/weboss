import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../../infrastructure/queue/queue.constants';

/**
 * SermonSchedulerService
 *
 * Registers a repeatable BullMQ job that runs every 30 seconds
 * to check for scheduled sermons ready to be published.
 *
 * Testing tip: Create a sermon with publishAt set to 1 minute in the future,
 * then wait ~30-60 seconds for the scheduler to pick it up and transition
 * it to PUBLISHED status.
 */
@Injectable()
export class SermonSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SermonSchedulerService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.SERMONS) private readonly sermonsQueue: Queue,
  ) {}

  async onModuleInit() {
    // Remove any existing repeatable jobs to avoid duplicates on restart
    const existingJobs = await this.sermonsQueue.getRepeatableJobs();
    for (const job of existingJobs) {
      if (job.name === 'publish-scheduled-sermons') {
        await this.sermonsQueue.removeRepeatableByKey(job.key);
      }
    }

    // Add repeatable job that runs every 30 seconds
    await this.sermonsQueue.add(
      'publish-scheduled-sermons',
      {},
      {
        repeat: { every: 30_000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log('Sermon scheduler registered: runs every 30 seconds');
  }
}
