import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SermonsController } from './sermons.controller';
import { SermonsService } from './sermons.service';
import { SermonsRepository } from './sermons.repository';
import { SermonSchedulerService } from './sermon-scheduler.service';
import { SermonNotificationService } from './sermon-notification.service';
import { SermonSchedulerProcessor } from './processors/sermon-scheduler.processor';
import { QUEUE_NAMES } from '../../infrastructure/queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_NAMES.SERMONS }),
  ],
  controllers: [SermonsController],
  providers: [
    SermonsService,
    SermonsRepository,
    SermonSchedulerService,
    SermonNotificationService,
    SermonSchedulerProcessor,
  ],
  exports: [SermonsService],
})
export class SermonsModule {}
