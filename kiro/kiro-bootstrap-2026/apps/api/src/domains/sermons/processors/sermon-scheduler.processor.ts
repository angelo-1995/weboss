import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SermonsRepository } from '../sermons.repository';
import { EmailService } from '../../../infrastructure/email/email.service';
import { emailTemplates } from '../../../infrastructure/email/templates';
import { QUEUE_NAMES } from '../../../infrastructure/queue/queue.constants';

/**
 * SermonSchedulerProcessor
 *
 * Processes the repeatable 'publish-scheduled-sermons' job.
 * Finds all sermons with status=SCHEDULED and publishAt <= now,
 * transitions them to PUBLISHED, and emits sermon.published events.
 *
 * Edge case: If publishAt is in the past at creation time, the repository
 * already handles this by setting status=PUBLISHED immediately.
 * This processor handles the normal case where publishAt was in the future
 * at creation time and has now passed.
 */
@Processor(QUEUE_NAMES.SERMONS)
export class SermonSchedulerProcessor {
  private readonly logger = new Logger(SermonSchedulerProcessor.name);

  constructor(
    private readonly sermonsRepo: SermonsRepository,
    private readonly events: EventEmitter2,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Handles sermon email notification jobs.
   * Renders and sends an email with sermon info to a member.
   */
  @Process('sermon-email')
  async handleSermonEmail(job: {
    data: {
      userId: string;
      email: string;
      sermonTitle: string;
      sermonExcerpt: string;
      sermonLink: string;
    };
  }): Promise<void> {
    const { email, sermonTitle, sermonExcerpt, sermonLink } = job.data;

    const html = emailTemplates.sermonNotification({
      sermonTitle,
      sermonExcerpt,
      sermonLink,
    });

    await this.emailService.sendEmail({
      to: email,
      subject: `Nueva predicación: ${sermonTitle}`,
      html,
      text: `Nueva predicación: ${sermonTitle}\n\n${sermonExcerpt}\n\nVer: ${sermonLink}`,
    });
  }

  @Process('publish-scheduled-sermons')
  async handlePublishScheduled(): Promise<void> {
    const readySermons = await this.sermonsRepo.findScheduledReady();

    if (readySermons.length === 0) {
      return;
    }

    this.logger.log(`Found ${readySermons.length} scheduled sermon(s) ready to publish`);

    for (const sermon of readySermons) {
      try {
        await this.sermonsRepo.updateStatus(sermon.id, 'PUBLISHED');

        this.logger.log(
          `Sermon published: ${sermon.id} (title: "${sermon.title}", scheduled for: ${sermon.publishAt?.toISOString()})`,
        );

        // Emit event for notification fan-out
        this.events.emit('sermon.published', {
          sermonId: sermon.id,
          networkId: sermon.networkId,
          title: sermon.title,
          description: sermon.description,
        });
      } catch (error) {
        this.logger.error(
          `Failed to publish sermon ${sermon.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
