import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('kpis')
  getKPIs(@Query('campusId') campusId?: string) {
    return this.service.getKPIs(campusId);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.service.getLeaderboard(limit ? parseInt(limit, 10) : 10);
  }

  @Get('groups')
  getGroupAnalytics(@Query('campusId') campusId?: string) {
    return this.service.getGroupAnalytics(campusId);
  }

  @Get('retention')
  getRetention() {
    return this.service.getRetentionMetrics();
  }
}
