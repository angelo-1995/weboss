import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { CellReportController } from './cell-report.controller';
import { CellReportService } from './cell-report.service';
import { CellReportExportService } from './cell-report-export.service';
import { CellReportAlertsService } from './cell-report-alerts.service';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [MembershipsModule],
  controllers: [ReportingController, CellReportController],
  providers: [ReportingService, CellReportService, CellReportExportService, CellReportAlertsService],
  exports: [ReportingService, CellReportService],
})
export class ReportingModule {}
