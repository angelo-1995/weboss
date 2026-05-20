import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { QUEUE_NAMES } from './queue.constants';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.AUDIT) private readonly auditQueue: any,
    @InjectQueue(QUEUE_NAMES.EVENTS) private readonly eventsQueue: any,
    @InjectQueue(QUEUE_NAMES.REPORTS) private readonly reportsQueue: any,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notificationsQueue: any,
  ) {}

  async addToAudit(data: Record<string, unknown>): Promise<void> {
    await this.auditQueue.add('audit-log', data);
    this.logger.debug(`Job added to audit queue`);
  }

  async addToEvents(eventName: string, data: Record<string, unknown>): Promise<void> {
    await this.eventsQueue.add(eventName, data);
    this.logger.debug(`Event "${eventName}" added to events queue`);
  }

  async addToReports(data: Record<string, unknown>): Promise<void> {
    await this.reportsQueue.add('report-generate', data);
    this.logger.debug(`Job added to reports queue`);
  }

  async addToNotifications(type: string, data: Record<string, unknown>): Promise<void> {
    await this.notificationsQueue.add(type, data);
    this.logger.debug(`Notification "${type}" added to notifications queue`);
  }

  /**
   * Get status of all queues for monitoring.
   */
  async getQueuesStatus(): Promise<Record<string, unknown>> {
    const [auditCounts, eventsCounts, reportsCounts, notifCounts] = await Promise.all([
      this.auditQueue.getJobCounts(),
      this.eventsQueue.getJobCounts(),
      this.reportsQueue.getJobCounts(),
      this.notificationsQueue.getJobCounts(),
    ]);

    return {
      audit: auditCounts,
      events: eventsCounts,
      reports: reportsCounts,
      notifications: notifCounts,
    };
  }
}
