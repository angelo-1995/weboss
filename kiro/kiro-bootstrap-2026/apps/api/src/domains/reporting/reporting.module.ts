import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { CellReportController } from './cell-report.controller';
import { CellReportService } from './cell-report.service';
import { CellReportExportService } from './cell-report-export.service';
import { CellReportAlertsService } from './cell-report-alerts.service';
import { DashboardController } from './dashboard.controller';
import { DashboardKpisService } from './dashboard-kpis.service';
import { AlertDetectionService } from './alert-detection.service';
import { ReportDraftsService } from './report-drafts.service';
import { ReportPeriodService } from './report-period.service';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [MembershipsModule],
  controllers: [ReportingController, CellReportController, DashboardController],
  providers: [
    ReportingService,
    CellReportService,
    CellReportExportService,
    CellReportAlertsService,
    DashboardKpisService,
    AlertDetectionService,
    ReportDraftsService,
    ReportPeriodService,
  ],
  exports: [ReportingService, CellReportService, AlertDetectionService],
})
export class ReportingModule {}
