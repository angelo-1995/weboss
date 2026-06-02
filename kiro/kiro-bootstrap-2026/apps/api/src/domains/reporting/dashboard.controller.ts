import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { DashboardKpisService } from './dashboard-kpis.service';
import { AlertDetectionService } from './alert-detection.service';
import { ReportDraftsService } from './report-drafts.service';
import { ReportPeriodService } from './report-period.service';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly kpis: DashboardKpisService,
    private readonly alerts: AlertDetectionService,
    private readonly drafts: ReportDraftsService,
    private readonly period: ReportPeriodService,
    private readonly db: DatabaseService,
  ) {}

  // ── KPIs ──────────────────────────────────────────────

  @Get('kpis')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async getKPIs(@CurrentUser() user: CurrentUserData, @Query('networkId') networkId?: string) {
    return this.kpis.getKPIs(user.campusId, networkId);
  }

  @Get('attendance-trend')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async getAttendanceTrend(
    @CurrentUser() user: CurrentUserData,
    @Query('weeks') weeks?: string,
    @Query('networkId') networkId?: string,
  ) {
    return this.kpis.getAttendanceTrend(user.campusId, weeks ? parseInt(weeks) : 12, networkId);
  }

  // ── Alerts ────────────────────────────────────────────

  @Get('alerts')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async getAlerts(@CurrentUser() user: CurrentUserData, @Query('acknowledged') acknowledged?: string): Promise<any> {
    const isAcknowledged = acknowledged === 'true';
    return this.db.operationalAlert.findMany({
      where: {
        campusId: user.campusId,
        acknowledged: isAcknowledged,
      },
      include: {
        targetGroup: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Patch('alerts/:id/acknowledge')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async acknowledgeAlert(@Param('id') id: string, @CurrentUser() user: CurrentUserData): Promise<any> {
    return this.db.operationalAlert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: user.id,
      },
    });
  }

  @Post('alerts/detect')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async triggerAlertDetection(): Promise<any> {
    return this.alerts.detectAll();
  }

  // ── Drafts ────────────────────────────────────────────

  @Get('drafts')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async getMyDrafts(@CurrentUser() user: CurrentUserData): Promise<any> {
    return this.drafts.getUserDrafts(user.id);
  }

  @Get('drafts/:groupId')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async getDraft(@CurrentUser() user: CurrentUserData, @Param('groupId') groupId: string): Promise<any> {
    return this.drafts.getDraft(user.id, groupId);
  }

  @Post('drafts')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async saveDraft(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { groupId: string; formData: Record<string, unknown>; currentStep: number },
  ): Promise<any> {
    return this.drafts.saveDraft(user.id, body.groupId, body.formData, body.currentStep);
  }

  @Patch('drafts/:groupId/discard')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async discardDraft(@CurrentUser() user: CurrentUserData, @Param('groupId') groupId: string): Promise<any> {
    return this.drafts.deleteDraft(user.id, groupId);
  }

  // ── Period Info ───────────────────────────────────────

  @Get('report-period')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async getReportPeriodInfo(@Query('meetingDate') meetingDate: string) {
    const date = new Date(meetingDate);
    const status = this.period.getPeriodStatus(date);
    const boundaries = this.period.getWeekBoundaries(date);
    return {
      status,
      canSubmit: status !== 'CLOSED',
      ...boundaries,
    };
  }
}
