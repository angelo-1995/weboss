import { Global, Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { AuditProcessor } from './processors/audit.processor';
import { EventProcessor } from './processors/event.processor';
import { ReportProcessor } from './processors/report.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { QUEUE_NAMES } from './queue.constants';

export { QUEUE_NAMES } from './queue.constants';

const logger = new Logger('QueueModule');

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');
        logger.log(`Connecting to Redis: ${redisUrl.replace(/\/\/.*@/, '//***@')}`);
        return {
          redis: {
            host: new URL(redisUrl).hostname,
            port: parseInt(new URL(redisUrl).port || '6379', 10),
            password: decodeURIComponent(new URL(redisUrl).password || ''),
            tls: redisUrl.startsWith('rediss://') ? {} : undefined,
            maxRetriesPerRequest: 3,
            retryStrategy: (times: number) => {
              if (times > 3) {
                logger.warn('Redis connection failed after 3 retries, giving up');
                return null;
              }
              return Math.min(times * 500, 2000);
            },
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        };
      },
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
