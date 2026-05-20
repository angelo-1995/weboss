import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { CellReportQueryDto } from './dto/cell-report.dto';

@Injectable()
export class CellReportExportService {
  constructor(private readonly db: DatabaseService) {}

  async exportCSV(query: CellReportQueryDto, userId: string, roles: string[]): Promise<string> {
    const isAdmin = roles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

    const where: Record<string, unknown> = {};

    if (!isAdmin) {
      const userGroups = await this.db.groupMember.findMany({
        where: { userId, role: { in: ['LEADER', 'CO_LEADER'] }, leftAt: null },
        select: { groupId: true },
      });
      where.groupId = { in: userGroups.map((g) => g.groupId) };
    }

    if (query.groupId) where.groupId = query.groupId;

    if (query.startDate || query.endDate) {
      where.meetingDate = {
        ...(query.startDate && { gte: new Date(query.startDate) }),
        ...(query.endDate && { lte: new Date(query.endDate) }),
      };
    }

    const reports = await this.db.cellReport.findMany({
      where,
      include: {
        group: { select: { name: true } },
        reporter: { select: { firstName: true, lastName: true } },
      },
      orderBy: { meetingDate: 'desc' },
    });

    const headers = [
      'Fecha', 'Grupo', 'Código', 'Líder', 'Cobertura',
      'Hombres', 'Mujeres', 'Jóvenes M', 'Jóvenes F', 'Niños',
      'Total Asistencia', 'Visitantes', 'Convertidos', 'Reconciliados',
      'Ofrenda', 'Tema', 'Supervisada', 'Observaciones',
    ];

    const rows = reports.map((r: any) => [
      new Date(r.meetingDate).toISOString().split('T')[0],
      r.group.name,
      r.cellCode,
      r.leaderName,
      r.coverageName,
      r.menCount,
      r.womenCount,
      r.youthMaleCount,
      r.youthFemaleCount,
      r.childrenCount,
      r.totalAttendance,
      r.visitorsCount,
      r.convertsCount,
      r.reconciledCount,
      r.offeringAmount ?? '',
      r.messageTopic ?? '',
      r.wasSupervised ? 'Sí' : 'No',
      (r.observations ?? '').replace(/"/g, '""'),
    ]);

    const csvLines = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((v) => `"${v}"`).join(',')),
    ];

    return csvLines.join('\n');
  }

  async exportSummary(query: CellReportQueryDto, userId: string, roles: string[]): Promise<any> {
    const isAdmin = roles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

    const where: Record<string, unknown> = {};

    if (!isAdmin) {
      const userGroups = await this.db.groupMember.findMany({
        where: { userId, role: { in: ['LEADER', 'CO_LEADER'] }, leftAt: null },
        select: { groupId: true },
      });
      where.groupId = { in: userGroups.map((g) => g.groupId) };
    }

    if (query.groupId) where.groupId = query.groupId;

    if (query.startDate || query.endDate) {
      where.meetingDate = {
        ...(query.startDate && { gte: new Date(query.startDate) }),
        ...(query.endDate && { lte: new Date(query.endDate) }),
      };
    }

    const agg = await this.db.cellReport.aggregate({
      where,
      _count: true,
      _sum: {
        totalAttendance: true,
        visitorsCount: true,
        convertsCount: true,
        reconciledCount: true,
      },
      _avg: {
        totalAttendance: true,
      },
    });

    return {
      totalReports: agg._count,
      totalAttendance: agg._sum.totalAttendance ?? 0,
      avgAttendance: Math.round(agg._avg.totalAttendance ?? 0),
      totalVisitors: agg._sum.visitorsCount ?? 0,
      totalConverts: agg._sum.convertsCount ?? 0,
      totalReconciled: agg._sum.reconciledCount ?? 0,
    };
  }
}
