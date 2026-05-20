import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
export class ReportingController {
  constructor(private readonly service: ReportingService) {}

  @Get('overview')
  getOverview(@Query('campusId') campusId?: string) {
    return this.service.getOverview(campusId);
  }

  @Get('growth')
  getGrowth(@Query('months') months?: string) {
    return this.service.getGrowthMetrics(months ? parseInt(months, 10) : 12);
  }

  @Get('groups/:groupId')
  getGroupReport(@Param('groupId', ParseUUIDPipe) groupId: string) {
    return this.service.getGroupReport(groupId);
  }

  @Get('discipleship')
  getDiscipleshipReport(@Query('mentorId') mentorId?: string) {
    return this.service.getDiscipleshipReport(mentorId);
  }
}
