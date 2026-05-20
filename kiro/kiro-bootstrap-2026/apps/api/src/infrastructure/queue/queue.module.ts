import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { AuditProcessor } from './processors/audit.processor';
import { EventProcessor } from './processors/event.processor';
import { ReportProcessor } from './processors/report.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { QUEUE_NAMES } from './queue.constants';

export { QUEUE_NAMES } from './queue.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.AUDIT },
      { name: QUEUE_NAMES.EVENTS },
      { name: QUEUE_NAMES.REPORTS },
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.SERMONS },
    ),
  ],
  providers: [
    QueueService,
    AuditProcessor,
    EventProcessor,
    ReportProcessor,
    NotificationProcessor,
  ],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
