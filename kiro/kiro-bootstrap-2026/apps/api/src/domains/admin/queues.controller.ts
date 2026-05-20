import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/queues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QueuesController {
  constructor(private readonly queueService: QueueService) {}

  /**
   * GET /admin/queues — Returns status of all BullMQ queues.
   * Only accessible by SUPER_ADMIN role.
   */
  @Get()
  @Roles('SUPER_ADMIN')
  async getQueuesStatus() {
    return this.queueService.getQueuesStatus();
  }
}
