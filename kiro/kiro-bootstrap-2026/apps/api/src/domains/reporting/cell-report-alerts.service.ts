import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

@Injectable()
export class CellReportAlertsService {
  constructor(private readonly db: DatabaseService) {}

  async checkMissingReports(): Promise<any[]> {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Get all active groups with their leaders
    const groups = await this.db.group.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        members: {
          where: { role: 'LEADER', leftAt: null },
          select: { user: { select: { firstName: true, lastName: true } } },
          take: 1,
        },
      },
    });

    // Get the latest report for each group
    const latestReports = await this.db.cellReport.groupBy({
      by: ['groupId'],
      _max: { meetingDate: true },
    });

    const reportMap = new Map(
      latestReports.map((r) => [r.groupId, r._max.meetingDate]),
    );

    const now = new Date();
    const alerts: any[] = [];

    for (const group of groups) {
      const lastReportDate = reportMap.get(group.id);
      const leaderName = group.members[0]
        ? `${group.members[0].user.firstName} ${group.members[0].user.lastName}`
        : 'Sin líder';

      if (!lastReportDate || lastReportDate < twoWeeksAgo) {
        const weeksMissing = lastReportDate
          ? Math.floor((now.getTime() - lastReportDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
          : null;

        alerts.push({
          groupId: group.id,
          groupName: group.name,
          leaderName,
          lastReportDate: lastReportDate?.toISOString() ?? null,
          weeksMissing: weeksMissing ?? 'Nunca reportó',
        });
      }
    }

    return alerts.sort((a, b) => {
      if (a.weeksMissing === 'Nunca reportó') return -1;
      if (b.weeksMissing === 'Nunca reportó') return 1;
      return (b.weeksMissing as number) - (a.weeksMissing as number);
    });
  }
}
