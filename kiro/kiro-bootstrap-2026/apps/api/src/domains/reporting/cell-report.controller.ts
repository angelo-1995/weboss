import { Controller, Post, Get, Body, Query, UseGuards, Res } from '@nestjs/common';
import { CellReportService } from './cell-report.service';
import { CellReportExportService } from './cell-report-export.service';
import { CellReportAlertsService } from './cell-report-alerts.service';
import { CreateCellReportDto, CellReportQueryDto } from './dto/cell-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('reports/cell')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CellReportController {
  constructor(
    private readonly service: CellReportService,
    private readonly exportService: CellReportExportService,
    private readonly alertsService: CellReportAlertsService,
  ) {}

  @Post()
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  create(@Body() dto: CreateCellReportDto, @CurrentUser() user: CurrentUserData): Promise<any> {
    return this.service.create(dto, user.id);
  }

  @Get()
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  findAll(@Query() query: CellReportQueryDto, @CurrentUser() user: CurrentUserData): Promise<any> {
    return this.service.findAll(query, user.id, user.roles);
  }

  @Get('pending')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  findPending(@CurrentUser() user: CurrentUserData) {
    return this.service.findPending(user.id, user.roles);
  }

  @Get('export')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async exportData(
    @Query() query: CellReportQueryDto & { format?: string },
    @CurrentUser() user: CurrentUserData,
    @Res() res: any,
  ) {
    if (query.format === 'csv') {
      const csv = await this.exportService.exportCSV(query, user.id, user.roles);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="reportes-celula.csv"');
      return res.send(csv);
    }

    // Default: return summary JSON (for PDF generation on client)
    const summary = await this.exportService.exportSummary(query, user.id, user.roles);
    return res.send(summary);
  }

  @Get('alerts')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getAlerts() {
    return this.alertsService.checkMissingReports();
  }

  /**
   * GET /reports/cell/lookup?code=E5.1
   * Returns leader, co-leader, and coverage info for a given cell code.
   * Used for auto-filling the report form.
   */
  @Get('lookup')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  lookupByCode(@Query('code') code: string): Promise<any> {
    return this.service.lookupByCode(code);
  }

  /**
   * GET /reports/cell/lookup-by-group?groupId=<uuid>
   * Returns leader, co-leader, coverage, phone, and location for a given group.
   * Used for auto-filling the report form when a group is selected from dropdown.
   */
  @Get('lookup-by-group')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  lookupByGroup(@Query('groupId') groupId: string): Promise<any> {
    return this.service.lookupByGroup(groupId);
  }
}
